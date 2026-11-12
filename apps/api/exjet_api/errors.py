"""Error envelope: {"error": {"code": "snake_case", "message": "..."}}."""
from __future__ import annotations


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message


def unauthenticated(message: str = "Authentication required.") -> ApiError:
    return ApiError(401, "unauthenticated", message)


def forbidden(message: str = "You do not have access to this resource.") -> ApiError:
    return ApiError(403, "forbidden", message)


def not_entitled(message: str = "An approved identity check and an active membership are required.") -> ApiError:
    return ApiError(403, "not_entitled", message)


def not_found(message: str = "Not found.") -> ApiError:
    return ApiError(404, "not_found", message)


def conflict(code: str, message: str) -> ApiError:
    return ApiError(409, code, message)


def unprocessable(code: str, message: str) -> ApiError:
    return ApiError(422, code, message)
