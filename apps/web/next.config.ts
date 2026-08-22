import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Load the shared DATABASE_URL from packages/db/.env so the web app can reach
// the same Postgres database used by the @cafemanager/db package.
const dbEnvPath = path.join(__dirname, "..", "..", "packages", "db", ".env");
if (fs.existsSync(dbEnvPath)) {
  for (const line of fs.readFileSync(dbEnvPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;