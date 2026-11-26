from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

import httpx
import pytest

from askasha import Asha

FIXTURES: Dict[str, Any] = json.loads((Path(__file__).parent / "fixtures.json").read_text(encoding="utf-8"))
HEADERS = {
    "x-request-id": "req_test_1",
    "asha-model": "asha-base",
    "asha-snapshot": "asha-base-2026-12-01",
    "x-dnai-intended-user": "sandbox",
    "x-ratelimit-limit": "20",
    "x-ratelimit-remaining": "19",
    "x-ratelimit-reset": "60",
}


def sse(frames: List[str]) -> bytes:
    return "".join(frames).encode()


def chat_stream_body() -> bytes:
    base = {"id": "chatcmpl-1", "object": "chat.completion.chunk", "created": 1, "model": "dnai/asha-base"}
    chunks = [
        {**base, "choices": [{"index": 0, "delta": {"role": "assistant", "content": "Thiazides "}, "finish_reason": None}]},
        {**base, "choices": [{"index": 0, "delta": {"content": "are first-line [1]."}, "finish_reason": None}]},
        {**base, "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}], "asha": FIXTURES["chat"]["asha"]},
        {**base, "choices": [], "usage": {"prompt_tokens": 5, "completion_tokens": 7, "total_tokens": 12}},
    ]
    frames = [": phase retrieval_start 10ms\n\n"] + [f"data: {json.dumps(c)}\n\n" for c in chunks] + ["data: [DONE]\n\n"]
    return sse(frames)


def message_json() -> Dict[str, Any]:
    return {
        "id": "msg_1", "type": "message", "role": "assistant", "model": "asha-base",
        "content": [{"type": "text", "text": "Thiazides are first-line [1].", "citations": [
            {"type": "web_search_result_location", "cited_text": "Thiazides", "url": None,
             "title": "Hypertension in adults", "encrypted_index": "r1"}]}],
        "stop_reason": "end_turn", "stop_sequence": None, "usage": {"input_tokens": 5, "output_tokens": 7},
        "asha": FIXTURES["chat"]["asha"],
    }


def message_stream_body() -> bytes:
    events = [
        ("message_start", {"type": "message_start", "message": {
            "id": "msg_1", "type": "message", "role": "assistant", "model": "asha-base", "content": [],
            "stop_reason": None, "stop_sequence": None, "usage": {"input_tokens": 5, "output_tokens": 0}}}),
        ("content_block_start", {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}),
        ("ping", {"type": "ping"}),
        ("content_block_delta", {"type": "content_block_delta", "index": 0,
                                 "delta": {"type": "text_delta", "text": "Thiazides are first-line [1]."}}),
        ("content_block_stop", {"type": "content_block_stop", "index": 0}),
        ("message_delta", {"type": "message_delta", "delta": {"stop_reason": "end_turn", "stop_sequence": None},
                           "usage": {"output_tokens": 7}, "asha": FIXTURES["chat"]["asha"]}),
        ("message_stop", {"type": "message_stop"}),
    ]
    return sse([": phase retrieval_start 10ms\n\n"] + [f"event: {n}\ndata: {json.dumps(d)}\n\n" for n, d in events])


class MockAPI:
    """Routes requests to fixtures and records them. ``queue`` forces responses for the next calls."""

    def __init__(self) -> None:
        self.requests: List[httpx.Request] = []
        self.queue: List[httpx.Response] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        if self.queue:
            return self.queue.pop(0)
        path = request.url.path
        body = json.loads(request.content or b"{}") if request.method == "POST" else {}
        if path == "/v1/chat/completions":
            if body.get("stream"):
                return httpx.Response(200, headers={**HEADERS, "content-type": "text/event-stream"},
                                      content=chat_stream_body())
            # The API sends whitespace keep-alive bytes before the JSON body.
            return httpx.Response(200, headers={**HEADERS, "content-type": "application/json"},
                                  content=b"  \n" + json.dumps(FIXTURES["chat"]).encode())
        if path == "/v1/messages":
            if body.get("stream"):
                return httpx.Response(200, headers={**HEADERS, "content-type": "text/event-stream"},
                                      content=message_stream_body())
            return httpx.Response(200, headers=HEADERS, json=message_json())
        routes: Dict[str, Callable[[], Any]] = {
            "/v1/verify": lambda: FIXTURES["verify"],
            "/v1/clinical/med-check": lambda: FIXTURES["med_check"],
            "/v1/search": lambda: FIXTURES["search"],
            "/v1/rerank": lambda: FIXTURES["rerank"],
            "/v1/models": lambda: FIXTURES["models"],
            "/v1/corpus-state": lambda: FIXTURES["corpus_state"],
        }
        if path in routes:
            return httpx.Response(200, headers=HEADERS, json=routes[path]())
        if path.startswith("/v1/receipts/"):
            return httpx.Response(200, headers=HEADERS, json=FIXTURES["receipt"])
        if path.startswith("/v1/models/"):
            mid = path.rsplit("/", 1)[-1]
            for m in FIXTURES["models"]["data"]:
                if m["id"] == mid:
                    return httpx.Response(200, headers=HEADERS, json=m)
            return httpx.Response(404, json={"error": {"message": "no such model", "type": "invalid_request_error",
                                                       "code": "model_not_found"}})
        return httpx.Response(404, json={"error": {"message": "not found", "type": "not_found", "code": "not_found"}})


@pytest.fixture
def api() -> MockAPI:
    return MockAPI()


@pytest.fixture
def client(api: MockAPI) -> Asha:
    c = Asha(api_key="dnai_a2a_test", base_url="https://mock.askasha.test",
             http_client=httpx.Client(transport=httpx.MockTransport(api)))
    c._sleep = lambda s: api.requests.append(httpx.Request("SLEEP", f"https://sleep/{s}"))  # type: ignore[assignment]
    return c


def err(status: int, code: str, *, retry_after: Optional[str] = None, anthropic: bool = False) -> httpx.Response:
    headers = {"x-request-id": "req_err"}
    if retry_after is not None:
        headers["retry-after"] = retry_after
    inner = {"message": f"{code} happened", "type": "rate_limit_error" if status == 429 else "api_error", "code": code}
    body = {"type": "error", "error": inner} if anthropic else {"error": inner}
    return httpx.Response(status, headers=headers, json=body)
