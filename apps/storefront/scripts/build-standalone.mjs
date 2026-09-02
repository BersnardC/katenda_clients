// Empaqueta el output standalone de Next para subirlo a un VPS.
//  - copia .next/standalone → dist-standalone/
//  - copia .next/static   → dist-standalone/apps/storefront/.next/static
//  - copia public         → dist-standalone/apps/storefront/public
// Uso: node scripts/build-standalone.mjs (tras `next build`)
import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(appRoot, "dist-standalone");
const appStandalone = join(dist, "apps", "storefront");

// pnpm crea junctions/symlinks que apuntan al .pnpm del workspace. Para que
// dist-standalone/ sea autocontenido (deploy a un VPS sin el workspace),
// se copia con dereference (contenido real, sin enlaces).
const opts = { recursive: true, dereference: true };

rmSync(dist, { recursive: true, force: true });

// 1) Todo el output standalone (server.js + node_modules + .next/server)
cpSync(join(appRoot, ".next", "standalone"), dist, opts);

// 2) Static assets de la app (JS/CSS de las páginas)
cpSync(
  join(appRoot, ".next", "static"),
  join(appStandalone, ".next", "static"),
  opts,
);

// 3) public/ (favicon, etc.)
if (existsSync(join(appRoot, "public"))) {
  cpSync(join(appRoot, "public"), join(appStandalone, "public"), opts);
}

console.log("Standalone listo en dist-standalone/");
console.log("  supervisor:  node apps/storefront/server.js   (env PORT / HOSTNAME)");
