import http.server
import socketserver
import json
import os
import urllib.parse

PORT = 8000
DIRECTORY = "frontend"
DRAFTS_DIR = "drafts"
DRAFT_FILE = os.path.join(DRAFTS_DIR, "resume_draft.json")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/api/draft':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            if os.path.exists(DRAFT_FILE):
                with open(DRAFT_FILE, 'r') as f:
                    self.wfile.write(f.read().encode())
            else:
                self.wfile.write(b'{}')
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/draft':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            if not os.path.exists(DRAFTS_DIR):
                os.makedirs(DRAFTS_DIR)
                
            with open(DRAFT_FILE, 'w') as f:
                f.write(post_data.decode('utf-8'))
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "success"}')
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}", flush=True)
        httpd.serve_forever()
