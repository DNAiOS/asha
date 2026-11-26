"""Python client for the Asha API, made by DNAi Systems.

    from askasha import Asha

    client = Asha()  # reads ASHA_API_KEY
    answer = client.chat.create(messages=[{"role": "user", "content": "First-line drug for hypertension?"}])
    print(answer.text)
    for ref in answer.asha.references:
        print(ref.marker, ref.display)
"""

from . import types
from ._client import (
    DEFAULT_BASE_URL,
    Asha,
    ChatResponse,
    ChatStream,
    MessageResponse,
    MessageStream,
    idempotency_key,
)
from ._errors import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AshaError,
    AuthenticationError,
    BadRequestError,
    ConflictError,
    GoneError,
    InternalServerError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
    RegionNotSupportedError,
    UnprocessableEntityError,
)
from ._version import __version__

__all__ = [
    "Asha",
    "ChatResponse",
    "ChatStream",
    "MessageResponse",
    "MessageStream",
    "DEFAULT_BASE_URL",
    "idempotency_key",
    "types",
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
    "__version__",
]
