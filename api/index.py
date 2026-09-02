"""Vercel Serverless Function entrypoint for MindSetu FastAPI backend."""
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlencode

# Add backend directory to sys.path so all backend modules and ML models resolve cleanly
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Import the existing configured FastAPI app from sih26186_server.py
from sih26186_server import app as fastapi_app  # noqa: E402


class VercelFastAPIWrapper:
    """ASGI wrapper ensuring exact path resolution across Vercel serverless rewrites."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") in ("http", "websocket"):
            raw_qs = scope.get("query_string", b"").decode("utf-8", errors="ignore")
            params = parse_qs(raw_qs, keep_blank_values=True)

            if "__path__" in params:
                subpath = params.pop("__path__")[0]
                new_qs = urlencode(params, doseq=True).encode("utf-8")
                clean = re.sub(r"/+", "/", "/" + subpath.lstrip("/"))
                scope = dict(scope, path=clean, raw_path=clean.encode("utf-8"), query_string=new_qs)
            else:
                path = scope.get("path", "")
                if path.startswith("/api/index.py"):
                    path = path[len("/api/index.py"):]
                clean = re.sub(r"/+", "/", "/" + path.lstrip("/"))
                scope = dict(scope, path=clean, raw_path=clean.encode("utf-8"))

        await self.app(scope, receive, send)


app = VercelFastAPIWrapper(fastapi_app)
__all__ = ["app"]
