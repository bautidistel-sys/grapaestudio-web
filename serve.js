const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8765;
const ROOT = path.join(__dirname);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".json": "application/json",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff2":"font/woff2",
};

http.createServer(function (req, res) {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";

  const file = path.join(ROOT, urlPath);

  if (!file.startsWith(ROOT)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }

  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    const ext  = path.extname(file).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}).listen(PORT, function () {
  console.log("GRAPA server running at http://localhost:" + PORT);
});
