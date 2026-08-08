import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const target = process.env.RENDER === "true" ? "start" : "dev:local";

const child = spawn(npmCommand, ["run", target], {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error(`[startup] Não foi possível iniciar ${target}:`, error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
