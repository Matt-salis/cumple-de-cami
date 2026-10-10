import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const children = [];

function run(args) {
  const child = spawn(process.execPath, args, { cwd: root, stdio: "inherit" });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code) stop(code);
  });
  return child;
}

function stop(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  setTimeout(() => process.exit(code), 50);
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

function waitForPort(port) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const attempt = () => {
      const socket = net.connect({ port, host: "127.0.0.1" });
      socket.once("connect", () => {
        socket.end();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - started > 8000) reject(new Error("El servidor de confirmaciones no arrancó."));
        else setTimeout(attempt, 120);
      });
    };
    attempt();
  });
}

run(["server.js"]);
const ready = await waitForPort(4173).then(
  () => true,
  (error) => {
    console.error(error.message);
    stop(1);
    return false;
  },
);
if (ready) run([path.join(root, "node_modules", "vite", "bin", "vite.js")]);
