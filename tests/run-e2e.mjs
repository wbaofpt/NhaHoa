import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import net from "node:net";
const root = fileURLToPath(new URL("../", import.meta.url));
const env = {
  ...process.env,
  MONGODB_DB_NAME: "nha_hoa_test",
  PORT: "4001",
  WEB_PORT: "5174",
  API_TARGET: "http://127.0.0.1:4001",
  FRONTEND_ORIGIN: "http://127.0.0.1:5174",
  E2E_BASE_URL: "http://127.0.0.1:5174",
};
function child(args, cwd = root) {
  return spawn(process.execPath, args, {
    cwd,
    env,
    stdio: "inherit",
    windowsHide: true,
  });
}
function completed(process) {
  return new Promise((resolve, reject) => {
    process.once("error", reject);
    process.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error("Test command failed (" + code + ")")),
    );
  });
}
async function free(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", error => port && error.code==='EADDRINUSE' ? free(0).then(resolve,reject) : reject(error));
    server.listen(port, "127.0.0.1", () => {const selected=server.address().port;server.close(()=>resolve(selected));});
  });
}
async function ready(url, process) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null)
      throw new Error("Test server exited before startup");
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Test server startup timed out");
}
let api, web;
try {
  env.PORT=String(await free(4001));
  env.WEB_PORT=String(await free(5174));
  env.API_TARGET='http://127.0.0.1:'+env.PORT;
  env.FRONTEND_ORIGIN=env.E2E_BASE_URL='http://127.0.0.1:'+env.WEB_PORT;
  await completed(child(["--import", "tsx", "src/setup.ts"], root + "backend"));
  api = child(["--import", "tsx", "src/server.ts"], root + "backend");
  web = child(
    [
      root + "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--strictPort",
    ],
    root + "frontend",
  );
  await Promise.all([
    ready(env.API_TARGET+"/api/health", api),
    ready(env.E2E_BASE_URL, web),
  ]);
  await completed(
    child([
      root + "node_modules/@playwright/test/cli.js",
      "test",
      ...process.argv.slice(2),
    ]),
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  api?.kill();
  web?.kill();
}
