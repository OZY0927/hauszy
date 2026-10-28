"""Local preview server: always serve current HTML, CSS and JavaScript."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 3000), PreviewHandler).serve_forever()
