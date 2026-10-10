import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanName, guestKey, nameError } from "./src/lib/names.js";

const root = path.dirname(fileURLToPath(import.meta.url));
export const confirmacionesPath = path.join(root, "data", "confirmaciones.txt");

const HEADER = [
  "# Cumple 25 de Cami — copia local de confirmaciones",
  "# nombre | apellido | estado | última respuesta",
];

function ensureFile() {
  fs.mkdirSync(path.dirname(confirmacionesPath), { recursive: true });
  if (!fs.existsSync(confirmacionesPath)) {
    fs.writeFileSync(confirmacionesPath, `${HEADER.join("\n")}\n`, "utf8");
  }
}

function parseLine(line) {
  const parts = line.split("|").map((part) => part.trim());
  if (parts.length !== 4) return null;
  const [firstName, lastName, status, updatedAt] = parts;
  if (status !== "confirmed" && status !== "unavailable") return null;
  if (!firstName || !lastName || !updatedAt) return null;
  return { firstName, lastName, status, updatedAt };
}

function readStore() {
  ensureFile();
  const raw = fs.readFileSync(confirmacionesPath, "utf8").replace(/^\uFEFF/, "");
  const records = [];
  const extras = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const record = parseLine(line);
    if (record) records.push(record);
    else extras.push(line);
  }
  return { records, extras };
}

function writeStore(records, extras) {
  const lines = [
    ...HEADER,
    ...records.map(
      (record) =>
        `${record.firstName} | ${record.lastName} | ${record.status} | ${record.updatedAt}`,
    ),
    ...extras,
  ];
  fs.writeFileSync(confirmacionesPath, `${lines.join("\n")}\n`, "utf8");
}

export function findConfirmation(firstName, lastName) {
  const key = guestKey(firstName, lastName);
  if (key === "|") return null;
  return readStore().records.find((record) => guestKey(record.firstName, record.lastName) === key) || null;
}

export function upsertConfirmation({ firstName, lastName, status }) {
  const first = cleanName(firstName);
  const last = cleanName(lastName);
  const firstErr = nameError(first, "nombre");
  const lastErr = nameError(last, "apellido");
  if (firstErr || lastErr) {
    throw Object.assign(new Error(firstErr || lastErr), { statusCode: 400 });
  }
  if (status !== "confirmed" && status !== "unavailable") {
    throw Object.assign(new Error("La respuesta tiene que ser confirmed o unavailable."), {
      statusCode: 400,
    });
  }

  const { records, extras } = readStore();
  const key = guestKey(first, last);
  const updatedAt = new Date().toISOString();
  const next = { firstName: first, lastName: last, status, updatedAt };
  const index = records.findIndex((record) => guestKey(record.firstName, record.lastName) === key);
  if (index >= 0) records[index] = next;
  else records.push(next);
  writeStore(records, extras);

  const saved = findConfirmation(first, last);
  if (!saved || saved.status !== status || saved.updatedAt !== updatedAt) {
    throw Object.assign(new Error("No se pudo comprobar la escritura del archivo."), {
      statusCode: 500,
    });
  }
  console.log(`Anotada: ${saved.firstName} ${saved.lastName} ${saved.status}`);
  return saved;
}

export function mediaExists(publicPath) {
  if (!/^\/videos\/[A-Za-z0-9._-]+$/.test(publicPath || "")) return false;
  const rel = publicPath.slice(1);
  return [path.join(root, "public", rel), path.join(root, "dist", rel)].some((file) => {
    try {
      return fs.statSync(file).isFile();
    } catch {
      return false;
    }
  });
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(json),
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let failed = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 4096) {
        failed = true;
        reject(Object.assign(new Error("La solicitud es demasiado grande."), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!failed) resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", () => {
      if (!failed) reject(Object.assign(new Error("No se pudo leer la solicitud."), { statusCode: 400 }));
    });
  });
}

export async function handleApi(req, res) {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (!url.pathname.startsWith("/api/")) return false;

  if (url.pathname === "/api/recurso" && req.method === "GET") {
    send(res, 200, { ok: true, exists: mediaExists(url.searchParams.get("path") || "") });
    return true;
  }

  if (url.pathname === "/api/confirmaciones" && req.method === "GET") {
    const record = findConfirmation(
      url.searchParams.get("nombre") || "",
      url.searchParams.get("apellido") || "",
    );
    send(res, 200, { ok: true, record });
    return true;
  }

  if (url.pathname === "/api/confirmaciones" && req.method === "POST") {
    try {
      const raw = await readBody(req);
      let body;
      try {
        body = JSON.parse(raw || "{}");
      } catch {
        send(res, 400, { ok: false, error: "El mensaje no se pudo leer." });
        return true;
      }
      const record = upsertConfirmation(body);
      send(res, 200, { ok: true, record });
    } catch (error) {
      const status = error.statusCode || 500;
      send(res, status, {
        ok: false,
        error: status >= 500 ? "No se pudo escribir la confirmación." : error.message,
      });
    }
    return true;
  }

  send(res, 404, { ok: false, error: "No encontrado." });
  return true;
}
