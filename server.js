
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 3000;
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Metode tidak diizinkan.");
  }

  let pathname;

  try {
    pathname = decodeURIComponent(
      new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname
    );
  } catch {
    res.writeHead(400);
    return res.end("Permintaan tidak valid.");
  }

  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT, relative);

  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    return res.end("Akses ditolak.");
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("File tidak ditemukan.");
    }

    const headers = {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache"
    };

    if (req.method === "HEAD") {
      res.writeHead(200, headers);
      return res.end();
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        return res.end("Gagal membaca file.");
      }

      res.writeHead(200, headers);
      res.end(content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log("------------------------------------------");
  console.log(" AGUNG KUSUMA TRI ATMAJA");
  console.log(" SHINOBI PERSONAL DASHBOARD");
  console.log("------------------------------------------");
  console.log(`Website aktif: http://${HOST}:${PORT}`);
  console.log("Tekan Ctrl + C untuk menghentikan server.");
});

server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} sudah digunakan. Hentikan server lama terlebih dahulu.`);
  } else {
    console.error("Server gagal dijalankan:", error.message);
  }
});
