import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  // @mseezee/shared is shipped as TypeScript source, so Next must transpile it.
  transpilePackages: ["@mseezee/shared"],
  // Prisma's client + query engine must not be bundled by the server compiler.
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Pin the workspace root — there are stray lockfiles higher up the filesystem.
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
