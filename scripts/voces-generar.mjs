/**
 * Lanza el generador de voces con el Python del entorno del proyecto.
 *
 *   npm run voces:generar
 *
 * Esto es solo el arranque: el trabajo está en `generar-voces.py`. Existe
 * porque la ruta del intérprete cambia según el sistema —en Windows está en
 * `Scripts\\python.exe` y en el resto en `bin/python`— y porque npm en Windows
 * ejecuta los scripts con cmd, que no traga rutas con barras normales. Con
 * esto, el mismo comando funciona en los dos sitios.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENTORNO = join(RAIZ, ".venv-voces");

const candidatos = [
  join(ENTORNO, "Scripts", "python.exe"),
  join(ENTORNO, "bin", "python3"),
  join(ENTORNO, "bin", "python"),
];

const python = candidatos.find((p) => existsSync(p));

if (!python) {
  console.error(`
No encuentro el entorno de voces en ${ENTORNO}.

Se crea una sola vez, con un Python 3.11 o 3.12 (el 3.13 y posteriores todavía
no llevan PyTorch):

    py -3.12 -m venv .venv-voces
    .venv-voces\\Scripts\\python.exe -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
    .venv-voces\\Scripts\\python.exe -m pip install chatterbox-tts
`);
  process.exit(1);
}

const hijo = spawn(python, [join(RAIZ, "scripts", "generar-voces.py"), ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: RAIZ,
});

hijo.on("exit", (codigo) => process.exit(codigo ?? 1));
