import { rm } from "node:fs/promises";
import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";

async function main() {
  await rm("dist", { recursive: true, force: true });

  console.log("[build] Compilando interface do CRIS...");
  await viteBuild();

  console.log("[build] Compilando servidor do CRIS...");
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    sourcemap: true,
    packages: "external",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    logLevel: "info",
  });

  console.log("[build] Build de produção concluído.");
}

main().catch((error) => {
  console.error("[build] Falha ao compilar o CRIS:", error);
  process.exit(1);
});
