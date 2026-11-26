from __future__ import annotations

from typing import Any, Mapping, Optional

import httpx

__all__ = [
    "AshaError",
    "APIConnectionError",
    "APITimeoutError",
    "APIStatusError",
    "BadRequestError",
    "AuthenticationError",
    "PermissionDeniedError",
    "NotFoundError",
    "ConflictError",
    "GoneError",
    "UnprocessableEntityError",
    "RateLimitError",
    "RegionNotSupportedError",
    "InternalServerError",
]


class AshaError(Exception):
    """Base class for every error this package raises."""


class APIConnectionError(AshaError):
    """The request never produced an HTTP response (DNS, TLS, reset)."""


class APITimeoutError(APIConnectionError):
    """The request timed out."""


class APIStatusError(AshaError):
    """The API answered with a 4xx or 5xx status.

    Branch on ``type`` and ``code``: both are stable per cause. ``message`` is
    readable text and may change.
    """

    status_code: int
    type: Optional[str]
    code: Optional[str]
    param: Optional[str]
    request_id: Optional[str]
    retry_after: Optional[float]
    body: Any

    def __init__(
        self,
        message: str,
        *,
        status_code: int,
        type: Optional[str] = None,
        code: Optional[str] = None,
        param: Optional[str] = None,
        request_id: Optional[str] = None,
        retry_after: Optional[float] = None,
        body: Any = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.type = type
        self.code = code
        self.param = param
        self.request_id = request_id
        self.retry_after = retry_after
        self.body = body

    def __str__(self) -> str:
        parts = [f"{self.status_code}"]
        if self.code:
            parts.append(self.code)
        parts.append(self.message)
        if self.request_id:
            parts.append(f"(request_id {self.request_id})")
        return " ".join(parts)


class BadRequestError(APIStatusError):
    pass


class AuthenticationError(APIStatusError):
    pass


class PermissionDeniedError(APIStatusError):
    pass


class NotFoundError(APIStatusError):
    pass


class ConflictError(APIStatusError):
    pass


class GoneError(APIStatusError):
    pass


class UnprocessableEntityError(APIStatusError):
    pass


class RateLimitError(APIStatusError):
    pass


class RegionNotSupportedError(APIStatusError):
    """HTTP 451: the API does not serve the EU, EEA or UK."""


class InternalServerError(APIStatusError):
    pass


_BY_STATUS: Mapping[int, "type[APIStatusError]"] = {
    400: BadRequestError,
    401: AuthenticationError,
    403: PermissionDeniedError,
    404: NotFoundError,
    409: ConflictError,
    410: GoneError,
    422: UnprocessableEntityError,
    429: RateLimitError,
    451: RegionNotSupportedError,
}


def parse_retry_after(headers: Mapping[str, str]) -> Optional[float]:
    value = headers.get("retry-after") or headers.get("Retry-After")
    if value is None:
        return None
    try:
        return max(0.0, float(value))
    except ValueError:
        return None


def error_from_parts(
    status_code: int, body: Any, headers: Mapping[str, str]
) -> APIStatusError:
    """Build the typed error from the OpenAI, Anthropic or A2A error envelope."""
    err: Mapping[str, Any] = {}
    if isinstance(body, dict):
        inner = body.get("error")
        if isinstance(inner, dict):
            err = inner
        elif isinstance(body.get("detail"), str):
            err = {"message": body["detail"]}
    message = str(err.get("message") or f"HTTP {status_code}")
    retry_after = parse_retry_after(headers)
    if retry_after is None and isinstance(err.get("retry_after"), (int, float)):
        retry_after = float(err["retry_after"])
    code = err.get("code")
    cls: "type[APIStatusError]" = _BY_STATUS.get(status_code) or (
        InternalServerError if status_code >= 500 else APIStatusError
    )
    return cls(
        message,
        status_code=status_code,
        type=err.get("type"),
        code=str(code) if code is not None else None,
        param=err.get("param"),
        request_id=err.get("request_id") or headers.get("x-request-id"),
        retry_after=retry_after,
        body=body,
    )


def error_from_response(response: httpx.Response) -> APIStatusError:
    try:
        body: Any = response.json()
    except ValueError:
        body = response.text
    return error_from_parts(response.status_code, body, response.headers)
