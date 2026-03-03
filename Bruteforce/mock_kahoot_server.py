#!/usr/bin/env python3
"""
Simple local mock Kahoot-like server for safe testing.
POST /join with JSON {"pin":"123456"} -> 200 if pin in VALID_PINS else 404
"""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

VALID_PINS = {"123456", "000001", "424242"}  # sample valid PINs for testing

class Handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/join":
            self._send(404, {"status": "not_found"})
            return
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body.decode())
            pin = str(payload.get("pin", ""))
        except Exception:
            self._send(400, {"status": "bad_request"})
            return
        if pin in VALID_PINS:
            self._send(200, {"status": "ok", "pin": pin})
        else:
            self._send(404, {"status": "not_found"})

def run(port=8000):
    server = HTTPServer(("127.0.0.1", port), Handler)
    print(f"Mock Kahoot server listening on http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()

if __name__ == "__main__":
    run()
