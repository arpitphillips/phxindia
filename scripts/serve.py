#!/usr/bin/env python3
"""Local preview server for the static site (stdlib only).

Serves site/ at http://localhost:8000 with the same URL semantics as the
production host: clean trailing-slash URLs and the custom 404 page.

Usage: python3 scripts/serve.py [port]
"""

from __future__ import annotations

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"


class SiteHandler(SimpleHTTPRequestHandler):
    def send_error(self, code: int, message: str | None = None, explain: str | None = None) -> None:
        if code == 404 and (SITE / "404.html").is_file():
            body = (SITE / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = partial(SiteHandler, directory=str(SITE))
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    print(f"serving {SITE} at http://127.0.0.1:{port}/ — Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
