import { spawn } from "node:child_process";

if (process.env.RENDER !== "true") {
  process.exit(0);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(npmCommand, ["run", "build"], {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error("[render] Não foi possível iniciar o build:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
