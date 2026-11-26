from __future__ import annotations

import json as _json
import os
import random
import time
import uuid
from dataclasses import dataclass, field
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    Dict,
    Iterator,
    List,
    Mapping,
    Optional,
    Sequence,
    TypeVar,
    Union,
)

import httpx

from ._errors import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AshaError,
    error_from_parts,
    error_from_response,
)
from ._version import __version__
from .types import (
    Allergy,
    AshaAnswer,
    CorpusCommitment,
    MedCheck,
    Medication,
    Model,
    Receipt,
    Rerank,
    ResponseMeta,
    SearchFilters,
    SearchResults,
    Verification,
)

if TYPE_CHECKING:  # pragma: no cover
    import anthropic
    import openai
    from anthropic.types import Message
    from openai.types.chat import ChatCompletion

DEFAULT_BASE_URL = "https://api.askasha.org"
DEFAULT_TIMEOUT = 300.0
DEFAULT_MAX_RETRIES = 2
DEFAULT_MAX_RETRY_WAIT = 60.0

_T = TypeVar("_T")


def idempotency_key() -> str:
    """A fresh Idempotency-Key (UUID v4). Never put personal data in a key."""
    return str(uuid.uuid4())


def _drop_none(d: Mapping[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in d.items() if v is not None}


def _dump(v: Any) -> Any:
    if hasattr(v, "model_dump"):
        return v.model_dump(exclude_none=True, by_alias=True)
    if isinstance(v, (list, tuple)):
        return [_dump(x) for x in v]
    return v


def _extra(obj: Any) -> Dict[str, Any]:
    extra = getattr(obj, "model_extra", None)
    if isinstance(extra, dict):
        return extra
    return {}


def _asha_from(obj: Any) -> Optional[AshaAnswer]:
    raw = _extra(obj).get("asha")
    return AshaAnswer.model_validate(raw) if isinstance(raw, dict) else None


class Asha:
    """Client for the Asha API.

    ``chat`` speaks the OpenAI wire through the official ``openai`` package and
    ``messages`` the Anthropic wire through ``anthropic`` (``pip install
    askasha[anthropic]``). Both return the parsed ``asha`` object as typed models.
    The clinical tools (``verify``, ``clinical.med_check``, ``search``,
    ``rerank``) and ``receipts``/``models`` are typed calls over HTTPS.

    Retries: 408, 502, 503, 504, connection errors, and 409/429 responses that
    carry ``Retry-After`` no longer than ``max_retry_wait`` seconds are retried
    up to ``max_retries`` times, waiting ``Retry-After`` when the API sends it.
    Every POST carries an Idempotency-Key (generated per call unless you pass
    one), so a retry never runs or bills the request twice.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        base_url: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES,
        max_retry_wait: float = DEFAULT_MAX_RETRY_WAIT,
        auto_idempotency: bool = True,
        default_headers: Optional[Mapping[str, str]] = None,
        http_client: Optional[httpx.Client] = None,
    ) -> None:
        key = api_key or os.environ.get("ASHA_API_KEY") or os.environ.get("DNAI_API_KEY")
        if not key:
            raise AshaError("No API key: pass api_key= or set ASHA_API_KEY. Free key: https://askasha.org/developers")
        self.api_key = key
        self.base_url = (base_url or os.environ.get("ASHA_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
        self.timeout = timeout
        self.max_retries = max(0, int(max_retries))
        self.max_retry_wait = max_retry_wait
        self.auto_idempotency = auto_idempotency
        self._default_headers = {"User-Agent": f"askasha-python/{__version__}", **dict(default_headers or {})}
        self._owns_http = http_client is None
        self._http = http_client or httpx.Client(timeout=timeout)
        self._sleep: Callable[[float], None] = time.sleep
        self._openai: Optional["openai.OpenAI"] = None
        self._anthropic: Optional["anthropic.Anthropic"] = None

        self.chat = Chat(self)
        self.messages = Messages(self)
        self.clinical = Clinical(self)
        self.receipts = Receipts(self)
        self.models = Models(self)

    # ------------------------------------------------------------ lifecycle

    def close(self) -> None:
        if self._owns_http:
            self._http.close()

    def __enter__(self) -> "Asha":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()

    # ------------------------------------------------------------ wrapped SDKs

    @property
    def openai(self) -> "openai.OpenAI":
        """An ``openai.OpenAI`` client pointed at ``{base_url}/v1`` with this key."""
        if self._openai is None:
            import openai

            self._openai = openai.OpenAI(
                api_key=self.api_key,
                base_url=f"{self.base_url}/v1",
                timeout=self.timeout,
                max_retries=0,
                default_headers=self._default_headers,
                http_client=self._http,
            )
        return self._openai

    @property
    def anthropic(self) -> "anthropic.Anthropic":
        """An ``anthropic.Anthropic`` client pointed at ``base_url`` with this key."""
        if self._anthropic is None:
            try:
                import anthropic
            except ImportError as e:  # pragma: no cover
                raise AshaError("messages needs the anthropic package: pip install 'askasha[anthropic]'") from e
            self._anthropic = anthropic.Anthropic(
                api_key=self.api_key,
                base_url=self.base_url,
                timeout=self.timeout,
                max_retries=0,
                default_headers=self._default_headers,
                http_client=self._http,
            )
        return self._anthropic

    # ------------------------------------------------------------ retry core

    def _idem(self, key: Optional[str]) -> Optional[str]:
        if key is not None:
            return key
        return idempotency_key() if self.auto_idempotency else None

    def _should_retry(self, err: AshaError, attempt: int) -> Optional[float]:
        """Seconds to wait before the next attempt, or None to give up."""
        if attempt >= self.max_retries:
            return None
        backoff = min(8.0, 0.5 * (2**attempt)) * random.uniform(0.75, 1.25)
        if isinstance(err, APIConnectionError):
            return float(backoff)
        if not isinstance(err, APIStatusError):
            return None
        if err.retry_after is not None:
            if err.status_code in (409, 429, 503) and err.retry_after <= self.max_retry_wait:
                return float(err.retry_after)
            return None
        if err.status_code in (408, 502, 503, 504):
            return float(backoff)
        return None

    def _with_retries(self, fn: Callable[[], _T]) -> _T:
        attempt = 0
        while True:
            try:
                return fn()
            except AshaError as err:
                wait = self._should_retry(err, attempt)
                if wait is None:
                    raise
                self._sleep(wait)
                attempt += 1

    def _sdk_call(self, fn: Callable[[], _T]) -> _T:
        """Run an openai/anthropic call, mapping its errors onto this package's types."""

        def run() -> _T:
            try:
                return fn()
            except Exception as e:  # noqa: BLE001 - re-raised as typed errors below
                raise _convert_sdk_error(e) from e

        return self._with_retries(run)

    def _request(
        self,
        method: str,
        path: str,
        *,
        json: Optional[Mapping[str, Any]] = None,
        params: Optional[Mapping[str, Any]] = None,
        idempotency_key: Optional[str] = None,
    ) -> "tuple[Any, ResponseMeta]":
        headers = {**self._default_headers, "Authorization": f"Bearer {self.api_key}", "Accept": "application/json"}
        if method == "POST":
            key = self._idem(idempotency_key)
            if key:
                headers["Idempotency-Key"] = key
        url = f"{self.base_url}{path}"

        def once() -> "tuple[Any, ResponseMeta]":
            try:
                resp = self._http.request(method, url, json=json, params=params, headers=headers, timeout=self.timeout)
            except httpx.TimeoutException as e:
                raise APITimeoutError(str(e) or "timed out") from e
            except httpx.TransportError as e:
                raise APIConnectionError(str(e) or "connection error") from e
            if resp.status_code >= 400:
                raise error_from_response(resp)
            try:
                body = _json.loads(resp.text)
            except ValueError as e:
                raise APIStatusError(
                    "Response was not JSON", status_code=resp.status_code, body=resp.text,
                    request_id=resp.headers.get("x-request-id"),
                ) from e
            return body, ResponseMeta.from_headers(resp.headers)

        return self._with_retries(once)

    # ------------------------------------------------------------ typed tools

    def verify(
        self,
        claim: str,
        *,
        context: Optional[str] = None,
        domain: Optional[str] = None,
        top_k: Optional[int] = None,
        idempotency_key: Optional[str] = None,
    ) -> Verification:
        """``POST /v1/verify``: try to refute one claim against the committed corpus."""
        body = _drop_none({"claim": claim, "context": context, "domain": domain, "top_k": top_k})
        data, meta = self._request("POST", "/v1/verify", json=body, idempotency_key=idempotency_key)
        out = Verification.model_validate(data)
        out.meta = meta
        return out

    def search(
        self,
        query: str,
        *,
        top_k: Optional[int] = None,
        filters: Optional[Union[SearchFilters, Mapping[str, Any]]] = None,
        idempotency_key: Optional[str] = None,
    ) -> SearchResults:
        """``POST /v1/search``: ranked, typed evidence passages from the committed corpus."""
        body = _drop_none({"query": query, "top_k": top_k, "filters": _dump(filters)})
        data, meta = self._request("POST", "/v1/search", json=body, idempotency_key=idempotency_key)
        out = SearchResults.model_validate(data)
        out.meta = meta
        return out

    def rerank(
        self,
        query: str,
        documents: Sequence[Union[str, Mapping[str, Any]]],
        *,
        top_n: Optional[int] = None,
        return_documents: Optional[bool] = None,
        idempotency_key: Optional[str] = None,
    ) -> Rerank:
        """``POST /v1/rerank``: cross-encoder relevance scores for up to 1,000 documents."""
        body = _drop_none(
            {"query": query, "documents": list(documents), "top_n": top_n, "return_documents": return_documents}
        )
        data, meta = self._request("POST", "/v1/rerank", json=body, idempotency_key=idempotency_key)
        out = Rerank.model_validate(data)
        out.meta = meta
        return out

    def corpus_state(self) -> CorpusCommitment:
        """``GET /v1/corpus-state``: the commitment answers cite in ``grounding.corpus_commitment``."""
        data, _ = self._request("GET", "/v1/corpus-state")
        return CorpusCommitment.model_validate(data)


def _convert_sdk_error(e: Exception) -> AshaError:
    if isinstance(e, AshaError):
        return e
    name = type(e).__name__
    response = getattr(e, "response", None)
    if isinstance(response, httpx.Response) and response.status_code >= 400:
        body = getattr(e, "body", None)
        if body is None:
            try:
                body = response.json()
            except Exception:  # noqa: BLE001
                body = None
        if isinstance(body, dict) and "error" not in body and isinstance(body.get("message"), str):
            body = {"error": body}
        return error_from_parts(response.status_code, body, response.headers)
    if "Timeout" in name:
        return APITimeoutError(str(e) or "timed out")
    if "Connection" in name:
        return APIConnectionError(str(e) or "connection error")
    raise e


# ---------------------------------------------------------------- chat (OpenAI wire)


@dataclass
class ChatResponse:
    """A ``/v1/chat/completions`` answer: the ``openai`` object plus the typed ``asha`` object."""

    completion: "ChatCompletion"
    asha: Optional[AshaAnswer]
    meta: ResponseMeta

    @property
    def id(self) -> str:
        return self.completion.id

    @property
    def text(self) -> str:
        if not self.completion.choices:
            return ""
        return self.completion.choices[0].message.content or ""

    @property
    def receipt_id(self) -> Optional[str]:
        return self.asha.receipt_id if self.asha else None

    def json(self) -> Any:
        """The answer parsed as JSON (for ``response_format`` json_object or json_schema)."""
        return _json.loads(self.text)


@dataclass
class ChatStream:
    """Iterate to receive text deltas; afterwards ``asha``, ``text`` and ``usage`` hold the result."""

    _stream: Any
    meta: ResponseMeta
    text: str = ""
    asha: Optional[AshaAnswer] = None
    usage: Any = None
    id: Optional[str] = None
    model: Optional[str] = None
    finish_reason: Optional[str] = None
    _done: bool = field(default=False, repr=False)

    def __iter__(self) -> Iterator[str]:
        if self._done:
            return
        for chunk in self._stream:
            self.id = self.id or chunk.id
            self.model = self.model or chunk.model
            answer = _asha_from(chunk)
            if answer is not None:
                self.asha = answer
            if getattr(chunk, "usage", None):
                self.usage = chunk.usage
            for choice in chunk.choices or []:
                delta = choice.delta.content if choice.delta else None
                if choice.finish_reason:
                    self.finish_reason = choice.finish_reason
                if delta:
                    self.text += delta
                    yield delta
        self._done = True

    def until_done(self) -> "ChatStream":
        for _ in self:
            pass
        return self

    def close(self) -> None:
        self._stream.close()

    def __enter__(self) -> "ChatStream":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()


class Chat:
    def __init__(self, client: Asha) -> None:
        self._client = client

    def _kwargs(
        self,
        messages: Sequence[Mapping[str, Any]],
        model: str,
        metadata: Optional[Mapping[str, Any]],
        instructions: Optional[str],
        response_format: Optional[Mapping[str, Any]],
        idempotency_key: Optional[str],
        extra_headers: Optional[Mapping[str, str]],
        extra_body: Optional[Mapping[str, Any]],
        kwargs: Dict[str, Any],
    ) -> Dict[str, Any]:
        body: Dict[str, Any] = dict(extra_body or {})
        if metadata is not None:
            body["metadata"] = dict(metadata)
        if instructions is not None:
            body["instructions"] = instructions
        headers = dict(extra_headers or {})
        key = self._client._idem(idempotency_key)
        if key:
            headers["Idempotency-Key"] = key
        out: Dict[str, Any] = {"model": model, "messages": list(messages), "extra_headers": headers, **kwargs}
        if response_format is not None:
            out["response_format"] = dict(response_format)
        if body:
            out["extra_body"] = body
        return out

    def create(
        self,
        *,
        messages: Sequence[Mapping[str, Any]],
        model: str = "asha",
        metadata: Optional[Mapping[str, Any]] = None,
        instructions: Optional[str] = None,
        response_format: Optional[Mapping[str, Any]] = None,
        idempotency_key: Optional[str] = None,
        extra_headers: Optional[Mapping[str, str]] = None,
        extra_body: Optional[Mapping[str, Any]] = None,
        **kwargs: Any,
    ) -> ChatResponse:
        """``POST /v1/chat/completions`` (non-streaming)."""
        kw = self._kwargs(messages, model, metadata, instructions, response_format, idempotency_key,
                          extra_headers, extra_body, kwargs)
        raw = self._client._sdk_call(lambda: self._client.openai.chat.completions.with_raw_response.create(**kw))
        completion = raw.parse()
        return ChatResponse(completion=completion, asha=_asha_from(completion), meta=ResponseMeta.from_headers(raw.headers))

    def stream(
        self,
        *,
        messages: Sequence[Mapping[str, Any]],
        model: str = "asha",
        metadata: Optional[Mapping[str, Any]] = None,
        instructions: Optional[str] = None,
        include_usage: bool = True,
        idempotency_key: Optional[str] = None,
        extra_headers: Optional[Mapping[str, str]] = None,
        extra_body: Optional[Mapping[str, Any]] = None,
        **kwargs: Any,
    ) -> ChatStream:
        """``POST /v1/chat/completions`` with ``stream=true``. The final chunk's ``asha`` object lands on ``.asha``."""
        kw = self._kwargs(messages, model, metadata, instructions, None, idempotency_key,
                          extra_headers, extra_body, kwargs)
        kw["stream"] = True
        if include_usage:
            kw["stream_options"] = {"include_usage": True}
        stream = self._client._sdk_call(lambda: self._client.openai.chat.completions.create(**kw))
        return ChatStream(_stream=stream, meta=ResponseMeta.from_headers(stream.response.headers))


# ---------------------------------------------------------------- messages (Anthropic wire)


@dataclass
class MessageResponse:
    """A ``/v1/messages`` answer: the ``anthropic`` Message plus the typed ``asha`` object."""

    message: "Message"
    asha: Optional[AshaAnswer]
    meta: ResponseMeta

    @property
    def id(self) -> str:
        return self.message.id

    @property
    def text(self) -> str:
        return "".join(getattr(b, "text", "") for b in self.message.content if getattr(b, "type", "") == "text")

    @property
    def receipt_id(self) -> Optional[str]:
        return self.asha.receipt_id if self.asha else None


@dataclass
class MessageStream:
    """Iterate to receive text deltas; ``message_delta`` delivers ``asha`` and ``usage``."""

    _stream: Any
    meta: ResponseMeta
    text: str = ""
    asha: Optional[AshaAnswer] = None
    usage: Any = None
    id: Optional[str] = None
    stop_reason: Optional[str] = None
    citations: List[Any] = field(default_factory=list)
    _done: bool = field(default=False, repr=False)

    def __iter__(self) -> Iterator[str]:
        if self._done:
            return
        for event in self._stream:
            kind = getattr(event, "type", "")
            if kind == "message_start":
                self.id = event.message.id
            elif kind == "content_block_delta":
                delta = event.delta
                if getattr(delta, "type", "") == "text_delta":
                    self.text += delta.text
                    yield delta.text
                elif getattr(delta, "type", "") == "citations_delta":
                    self.citations.append(delta.citation)
            elif kind == "message_delta":
                answer = _asha_from(event)
                if answer is not None:
                    self.asha = answer
                self.usage = getattr(event, "usage", None)
                self.stop_reason = getattr(event.delta, "stop_reason", None)
        self._done = True

    def until_done(self) -> "MessageStream":
        for _ in self:
            pass
        return self

    def close(self) -> None:
        self._stream.close()

    def __enter__(self) -> "MessageStream":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()


class Messages:
    def __init__(self, client: Asha) -> None:
        self._client = client

    def _kwargs(
        self,
        messages: Sequence[Mapping[str, Any]],
        model: str,
        max_tokens: int,
        system: Optional[Any],
        metadata: Optional[Mapping[str, Any]],
        idempotency_key: Optional[str],
        extra_headers: Optional[Mapping[str, str]],
        extra_body: Optional[Mapping[str, Any]],
        kwargs: Dict[str, Any],
    ) -> Dict[str, Any]:
        headers = dict(extra_headers or {})
        key = self._client._idem(idempotency_key)
        if key:
            headers["Idempotency-Key"] = key
        out: Dict[str, Any] = {
            "model": model, "max_tokens": max_tokens, "messages": list(messages), "extra_headers": headers, **kwargs,
        }
        if system is not None:
            out["system"] = system
        body = dict(extra_body or {})
        if metadata is not None:
            body["metadata"] = dict(metadata)
        if body:
            out["extra_body"] = body
        return out

    def create(
        self,
        *,
        messages: Sequence[Mapping[str, Any]],
        model: str = "asha",
        max_tokens: int = 1024,
        system: Optional[Any] = None,
        metadata: Optional[Mapping[str, Any]] = None,
        idempotency_key: Optional[str] = None,
        extra_headers: Optional[Mapping[str, str]] = None,
        extra_body: Optional[Mapping[str, Any]] = None,
        **kwargs: Any,
    ) -> MessageResponse:
        """``POST /v1/messages`` (non-streaming). ``max_tokens`` is accepted and ignored by Asha."""
        kw = self._kwargs(messages, model, max_tokens, system, metadata, idempotency_key,
                          extra_headers, extra_body, kwargs)
        raw = self._client._sdk_call(lambda: self._client.anthropic.messages.with_raw_response.create(**kw))
        message = raw.parse()
        return MessageResponse(message=message, asha=_asha_from(message), meta=ResponseMeta.from_headers(raw.headers))

    def stream(
        self,
        *,
        messages: Sequence[Mapping[str, Any]],
        model: str = "asha",
        max_tokens: int = 1024,
        system: Optional[Any] = None,
        metadata: Optional[Mapping[str, Any]] = None,
        idempotency_key: Optional[str] = None,
        extra_headers: Optional[Mapping[str, str]] = None,
        extra_body: Optional[Mapping[str, Any]] = None,
        **kwargs: Any,
    ) -> MessageStream:
        """``POST /v1/messages`` with ``stream=true``."""
        kw = self._kwargs(messages, model, max_tokens, system, metadata, idempotency_key,
                          extra_headers, extra_body, kwargs)
        kw["stream"] = True
        stream = self._client._sdk_call(lambda: self._client.anthropic.messages.create(**kw))
        return MessageStream(_stream=stream, meta=ResponseMeta.from_headers(stream.response.headers))


# ---------------------------------------------------------------- namespaces


class Clinical:
    def __init__(self, client: Asha) -> None:
        self._client = client

    def med_check(
        self,
        medications: Sequence[Union[str, Medication, Mapping[str, Any]]],
        *,
        pregnancy: Optional[bool] = None,
        lactation: Optional[bool] = None,
        age: Optional[float] = None,
        sex: Optional[str] = None,
        weight_kg: Optional[float] = None,
        egfr: Optional[float] = None,
        creatinine: Optional[float] = None,
        potassium: Optional[float] = None,
        allergies: Optional[Sequence[Union[str, Allergy, Mapping[str, Any]]]] = None,
        audience: Optional[str] = None,
        format: Optional[str] = None,
        idempotency_key: Optional[str] = None,
    ) -> MedCheck:
        """``POST /v1/clinical/med-check``: deterministic screen; ``format="fhir"`` adds DetectedIssue resources."""
        body = _drop_none({
            "medications": _dump(list(medications)),
            "pregnancy": pregnancy, "lactation": lactation, "age": age, "sex": sex,
            "weight_kg": weight_kg, "egfr": egfr, "creatinine": creatinine, "potassium": potassium,
            "allergies": _dump(list(allergies)) if allergies is not None else None,
            "audience": audience, "format": format,
        })
        data, meta = self._client._request("POST", "/v1/clinical/med-check", json=body,
                                           idempotency_key=idempotency_key)
        out = MedCheck.model_validate(data)
        out.meta = meta
        return out


class Receipts:
    def __init__(self, client: Asha) -> None:
        self._client = client

    def get(self, receipt_id: str) -> Receipt:
        """``GET /v1/receipts/{id}``: readable only with the key that received the answer."""
        data, meta = self._client._request("GET", f"/v1/receipts/{receipt_id}")
        out = Receipt.model_validate(data)
        out.meta = meta
        return out


class Models:
    def __init__(self, client: Asha) -> None:
        self._client = client

    def list(self, *, include_all: bool = False) -> List[Model]:
        """``GET /v1/models``. ``include_all`` also lists planned and blocked models with the reason."""
        params = {"include": "all"} if include_all else None
        data, _ = self._client._request("GET", "/v1/models", params=params)
        return [Model.model_validate(m) for m in data.get("data", [])]

    def retrieve(self, model_id: str) -> Model:
        data, _ = self._client._request("GET", f"/v1/models/{model_id}")
        return Model.model_validate(data)
