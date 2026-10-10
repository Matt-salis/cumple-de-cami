import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { handleApi } from "./confirmaciones.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");
const port = Number(process.env.PORT) || 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function streamFile(req, res, file) {
  const stat = fs.statSync(file);
  const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
  const range = req.headers.range;

  if (range && type.startsWith("video/")) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) {
      res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
      res.end();
      return;
    }
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : Math.min(start + 1024 * 1024 - 1, stat.size - 1);
    if (start >= stat.size || end >= stat.size || start > end) {
      res.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      "Content-Type": type,
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": stat.size,
    "Accept-Ranges": "bytes",
    "Cache-Control": path.extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
  });
  if (req.method === "HEAD") res.end();
  else fs.createReadStream(file).pipe(res);
}

function serveStatic(req, res) {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(dist, rel));
  const relative = path.relative(dist, file);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("No permitido");
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    streamFile(req, res, file);
    return;
  }
  if (!path.extname(rel)) {
    const index = path.join(dist, "index.html");
    if (fs.existsSync(index)) {
      streamFile(req, res, index);
      return;
    }
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("No encontrado. Para ver la página: npm run dev, o npm run build y npm start.");
}

const server = http.createServer(async (req, res) => {
  try {
    const handled = await handleApi(req, res);
    if (!handled) serveStatic(req, res);
  } catch {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Error del servidor");
    }
  }
});

const isDirect =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirect) {
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`El puerto ${port} ya está en uso.`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  });
  server.listen(port, "0.0.0.0", () => {
    console.log(`Cumple 25 de Cami en http://localhost:${port}`);
    for (const list of Object.values(os.networkInterfaces())) {
      for (const net of list || []) {
        if (net.family === "IPv4" && !net.internal) {
          console.log(`En el celular, misma Wi-Fi: http://${net.address}:${port}`);
        }
      }
    }
    console.log("Confirmaciones: data/confirmaciones.txt");
  });
}
