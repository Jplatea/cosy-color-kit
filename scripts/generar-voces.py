"""
Genera las voces de Culow y Pililarge con sus propias muestras.

    npm run voces:generar              # todo lo que falte
    npm run voces:generar -- --todo    # también lo ya generado
    npm run voces:generar -- --solo frase-saludo

Usa Chatterbox Multilingual (Resemble AI, licencia MIT) en local: clona la voz
a partir de `src/assets/voces/<personaje>-muestra.mp3` y escribe un mp3 por
frase en esa misma carpeta. No sale nada a internet salvo la descarga del
modelo la primera vez, y no cuesta dinero por uso.

El guion no se decide aquí: se pide a `scripts/voces.mjs --json`, que lo saca
de `src/config/cyp.ts`. Así solo hay un sitio donde vive qué se dice y cómo se
llama cada fichero.

Va por CPU, que es lo que hay en este equipo: cuenta entre diez y treinta
segundos por frase. No es rápido, pero se lanza una vez y se olvida.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
VOCES = RAIZ / "src" / "assets" / "voces"
IDIOMA = "es"

# Cuánto se le deja improvisar a cada uno. `exaggeration` es cuánta emoción le
# mete; `cfg_weight` cuánto se pega al ritmo de la muestra. Culow va suelto y
# atropellado, Pililarge más plano y lento: es la diferencia medida entre los
# dos (124 Hz a 4,8 sílabas/s frente a 216 Hz a 4,0).
AJUSTES = {
    "culow": {"exaggeration": 0.62, "cfg_weight": 0.42, "temperature": 0.85},
    "pililarge": {"exaggeration": 0.42, "cfg_weight": 0.58, "temperature": 0.75},
}


def guion() -> list[dict]:
    """El guion, tal cual lo lista `npm run voces`."""
    salida = subprocess.run(
        ["node", str(RAIZ / "scripts" / "voces.mjs"), "--json"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        cwd=RAIZ,
    )
    if salida.returncode != 0:
        sys.exit(f"No he podido leer el guion:\n{salida.stderr}")
    return json.loads(salida.stdout)


def muestra_de(quien: str) -> Path:
    for extension in (".mp3", ".wav", ".m4a", ".ogg"):
        camino = VOCES / f"{quien}-muestra{extension}"
        if camino.exists():
            return camino
    sys.exit(
        f"Falta la muestra de voz de {quien}.\n"
        f"Deja un audio suyo en {VOCES / (quien + '-muestra.mp3')} "
        "(entre diez y treinta segundos, solo su voz, sin música)."
    )


def main() -> None:
    corta = argparse.ArgumentParser(add_help=False)
    corta.add_argument("--todo", action="store_true", help="regenera también lo que ya existe")
    corta.add_argument("--solo", metavar="ID", help="genera solo esa toma")
    opciones = corta.parse_args()

    tomas = guion()
    if opciones.solo:
        tomas = [t for t in tomas if t["id"] == opciones.solo]
        if not tomas:
            sys.exit(f"No hay ninguna toma que se llame «{opciones.solo}».")
    if not opciones.todo:
        tomas = [t for t in tomas if not (VOCES / f"{t['id']}.mp3").exists()]

    if not tomas:
        print("Todo generado. Con --todo se rehace.")
        return

    quienes = sorted({t["quien"] for t in tomas})
    muestras = {q: muestra_de(q) for q in quienes}

    print(f"{len(tomas)} frase(s) por generar.\n")
    print("Cargando el modelo… la primera vez se descarga y tarda un rato.")

    import torch  # se importa aquí para que --help no espere a cargar torch
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    dispositivo = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"  dispositivo: {dispositivo}")
    modelo = ChatterboxMultilingualTTS.from_pretrained(device=dispositivo)
    print("  listo\n")

    import soundfile as sf

    VOCES.mkdir(parents=True, exist_ok=True)
    empezado = time.time()

    for i, toma in enumerate(tomas, 1):
        destino = VOCES / f"{toma['id']}.mp3"
        ajuste = AJUSTES.get(toma["quien"], AJUSTES["culow"])
        print(f"[{i}/{len(tomas)}] {toma['id']}  ({toma['quien']})")
        print(f"        «{toma['texto']}»")

        reloj = time.time()
        onda = modelo.generate(
            toma["texto"],
            language_id=IDIOMA,
            audio_prompt_path=str(muestras[toma["quien"]]),
            **ajuste,
        )
        audio = onda.squeeze(0).detach().cpu().numpy()
        sf.write(destino, audio, modelo.sr, format="MP3")

        segundos = len(audio) / modelo.sr
        print(f"        {segundos:.1f}s de audio en {time.time() - reloj:.0f}s\n")

    print(f"Hecho en {(time.time() - empezado) / 60:.1f} min.")
    print(f"Los mp3 están en {VOCES}.")
    print("Escúchalos: lo que no te guste, bórralo y vuelve a lanzar esto.")


if __name__ == "__main__":
    main()
