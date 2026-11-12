"""FastAPI app. Run: uvicorn exjet_api.main:app --port 8000"""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import get_settings
from .errors import ApiError
from .guardrails import GuardrailViolation
from .providers import assert_safe_for_env
from .routers import admin, auth, billing, catalog, dev, flight, kyc, quotes, trips
from .security import CSRF_HEADER, CSRF_VALUE

log = logging.getLogger("exjet.api")
CSRF_EXEMPT = {"/v1/billing/webhook"}  # authenticated by the provider's signature, not a cookie
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
# On every response. File downloads set a stricter CSP of their own first (setdefault keeps it).
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}


def envelope(status: int, code: str, message: str, headers: dict | None = None) -> JSONResponse:
    return JSONResponse({"error": {"code": code, "message": message}}, status_code=status, headers=headers)


def create_app() -> FastAPI:
    settings = get_settings()
    dev_like = settings.is_dev_like
    # /docs and /openapi.json exist only in dev/test. The typed contract for staging/prod is the committed openapi.json.
    app = FastAPI(title="EXJET API", version="0.1.0", openapi_url="/openapi.json" if dev_like else None,
                  docs_url="/docs" if dev_like else None, redoc_url=None)

    @app.middleware("http")
    async def csrf_and_headers(request: Request, call_next):
        if request.method not in SAFE_METHODS and request.url.path not in CSRF_EXEMPT:
            if request.headers.get(CSRF_HEADER) != CSRF_VALUE:
                return envelope(403, "csrf_failed", "Missing or invalid X-Requested-With header.")
        response = await call_next(request)
        for k, v in SECURITY_HEADERS.items():
            response.headers.setdefault(k, v)
        if not dev_like:
            response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
        if request.url.path.startswith("/v1"):
            response.headers.setdefault("Cache-Control", "no-store")
        return response

    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,
                       allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                       allow_headers=["Content-Type", "X-Requested-With"])

    @app.exception_handler(ApiError)
    async def _api_error(_: Request, e: ApiError):
        return envelope(e.status, e.code, e.message)

    @app.exception_handler(GuardrailViolation)
    async def _guard(_: Request, e: GuardrailViolation):
        return envelope(409, e.code, "This action is not permitted.")

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, e: StarletteHTTPException):
        code = {401: "unauthenticated", 403: "forbidden", 404: "not_found", 405: "method_not_allowed"}.get(e.status_code, "error")
        return envelope(e.status_code, code, str(e.detail) if isinstance(e.detail, str) else "Request failed.")

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, e: RequestValidationError):
        # Field paths and messages only: never echo submitted values (they may be passwords or PII).
        parts = [f"{'.'.join(str(p) for p in err['loc'] if p not in ('body', 'query', 'form'))}: {err['msg']}" for err in e.errors()]
        return envelope(422, "validation_error", "; ".join(parts)[:500] or "Invalid request.")

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, e: Exception):
        log.error("unhandled error: %s", type(e).__name__)  # class only; messages can contain PII
        return envelope(500, "internal_error", "Something went wrong.")

    @app.get("/healthz", include_in_schema=False)
    def healthz():
        return {"status": "ok"}

    routers = [auth.router, kyc.router, billing.router, catalog.router, trips.router, flight.router, quotes.router, admin.router]
    if dev_like:
        routers.append(dev.router)  # the dev router is not mounted at all in staging/prod
    for r in routers:
        app.include_router(r, prefix="/v1")
    return app


assert_safe_for_env()
app = create_app()
