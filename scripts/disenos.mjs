/**
 * Genera los estampados listos para la imprenta.
 *
 *   npm run disenos
 *
 * Escribe un PNG por diseño en `disenos/`, a 300 ppp y con fondo transparente,
 * que es lo que pide Printful para estampado directo. De cada uno salen dos
 * versiones: en tinta para prendas claras y en crema para prendas oscuras.
 *
 * Se dibuja aquí y no en el navegador a propósito. Estos ficheros son lo que se
 * imprime de verdad sobre una camiseta: tienen que poder regenerarse igual
 * dentro de un año, sin depender de qué fuentes tenga instaladas la máquina ni
 * de cómo redondee un canvas de Chrome. Por eso las tipografías van en el
 * repositorio, en `scripts/fuentes/`, y se registran antes de pintar nada.
 *
 * Lo que sale de aquí y lo que dibuja la web tienen que ser el mismo diseño: si
 * uno cambia, el cliente ve una cosa y recibe otra.
 */

import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const FUENTES = join(AQUI, "fuentes");
const SALIDA = join(RAIZ, "disenos");

/** 300 puntos por pulgada: el mínimo para que no se vea la trama al tacto. */
const PPP = 300;
const pulgadas = (n) => Math.round(n * PPP);

/** Ancho de estampado de pecho: 30 cm, que es lo normal en una camiseta. */
const ANCHO = pulgadas(11.8);

const TINTA = "#14120f";
const CREMA = "#f2ece2";

for (const f of await readdir(FUENTES)) {
  if (/\.(ttf|otf)$/i.test(f)) GlobalFonts.registerFromPath(join(FUENTES, f));
}

const serif = (px) => `${px}px "Instrument Serif"`;
/**
 * Bangers y no una grotesca en negrita. Dos razones: es la misma rotulación que
 * usa la sala del cómic, así que la camiseta y la web hablan el mismo idioma; y
 * la Inter que hay descargada es una fuente variable, y el canvas no sabe
 * pedirle un peso concreto —salía todo en fino—.
 */
const palo = (px) => `${px}px Bangers`;

/**
 * Escribe una línea con interletrado, que el canvas no sabe hacer solo.
 * Devuelve el ancho ocupado, para poder centrar.
 */
function letras(ctx, texto, x, y, espacio) {
  const anchos = [...texto].map((c) => ctx.measureText(c).width);
  const total = anchos.reduce((a, b) => a + b, 0) + espacio * (texto.length - 1);
  let cursor = x - total / 2;
  [...texto].forEach((c, i) => {
    ctx.fillText(c, cursor + anchos[i] / 2, y);
    cursor += anchos[i] + espacio;
  });
  return total;
}

/** El símbolo: las dos esferas de Culow y la barra de Pililarge. */
function simbolo(ctx, x, y, ancho, color) {
  // El original mide 129 × 102; se escala desde ahí.
  const k = ancho / 129;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(33, 64, 27, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(60, 64, 27, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(97, 12, 26, 79, 13);
  ctx.fill();
  ctx.restore();
  return 102 * k;
}

/**
 * Qué cuerpo de letra cabe.
 *
 * Se prueba desde el más grande y se va bajando hasta que la línea más larga
 * entra en el ancho útil. Hay que saberlo *antes* de crear el lienzo: si el
 * lienzo se dimensiona con el cuerpo de partida y luego la letra se encoge para
 * caber, queda medio PNG en blanco debajo del texto.
 */
function cuerpoQueCabe(ctx, lineas, { fuente, desde, espacio, ancho }) {
  let px = desde;
  for (let i = 0; i < 60; i++) {
    ctx.font = fuente(px);
    const mayor = Math.max(
      ...lineas.map((l) => ctx.measureText(l).width + espacio * px * (l.length - 1))
    );
    if (mayor <= ancho) break;
    px = Math.floor(px * 0.96);
  }
  return px;
}

const DISENOS = {
  simbolo: {
    nombre: "El símbolo",
    // El símbolo mide 102 de alto por 129 de ancho.
    alto: () => Math.round(ANCHO * (102 / 129)),
    dibujar: (ctx, color, alto) => simbolo(ctx, 0, 0, ANCHO, color),
  },

  rotulo: {
    nombre: "El rótulo",
    // 0,633 lo alto del símbolo a ese ancho, más lo que ocupa el rótulo debajo.
    alto: () => Math.round(ANCHO * 0.633 + ANCHO * 0.125),
    dibujar: (ctx, color) => {
      const h = simbolo(ctx, ANCHO * 0.1, 0, ANCHO * 0.8, color);
      const px = cuerpoQueCabe(ctx, ["CULOW & PILILARGE"], {
        fuente: palo,
        desde: ANCHO * 0.13,
        espacio: 0.1,
        ancho: ANCHO * 0.94,
      });
      ctx.font = palo(px);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      letras(ctx, "CULOW & PILILARGE", ANCHO / 2, h + px * 0.72, px * 0.1);
    },
  },

  brazos: {
    nombre: "Sin brazos",
    lineas: ["CULOW NO TIENE BRAZOS", "Y AÚN ASÍ SEÑALA"],
    fuente: palo,
    espacio: 0.04,
  },

  sentarme: {
    nombre: "Cuatro años",
    lineas: ["LLEVO CUATRO AÑOS", "INTENTANDO", "SENTARME"],
    fuente: palo,
    espacio: 0.04,
  },

  lujo: {
    nombre: "Lujo estúpido",
    lineas: ["Lujo", "estúpido"],
    fuente: serif,
    espacio: 0.01,
    interlinea: 0.92,
  },
};

/** Los que son solo texto se dibujan todos igual. */
function dibujarTexto(ctx, d, color, px, alturaLinea) {
  ctx.font = d.fuente(px);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  d.lineas.forEach((linea, i) => {
    letras(ctx, linea, ANCHO / 2, px * alturaLinea * (i + 0.5), px * d.espacio);
  });
}

async function main() {
  await mkdir(SALIDA, { recursive: true });
  console.log(`Estampados a ${PPP} ppp, ${ANCHO} px de ancho (unos 30 cm).\n`);

  for (const [id, d] of Object.entries(DISENOS)) {
    for (const [tono, color] of [["tinta", TINTA], ["crema", CREMA]]) {
      const alturaLinea = d.interlinea ?? 1.16;

      // Se mide en un lienzo de usar y tirar antes de saber cuánto mide el bueno.
      let alto;
      let px = 0;
      if (d.alto) {
        alto = d.alto();
      } else {
        const regla = createCanvas(10, 10).getContext("2d");
        px = cuerpoQueCabe(regla, d.lineas, {
          fuente: d.fuente,
          desde: Math.round(ANCHO * 0.26),
          espacio: d.espacio,
          ancho: ANCHO * 0.96,
        });
        alto = Math.round(px * alturaLinea * d.lineas.length);
      }

      const lienzo = createCanvas(ANCHO, alto);
      const ctx = lienzo.getContext("2d");

      if (d.dibujar) d.dibujar(ctx, color, alto);
      else dibujarTexto(ctx, d, color, px, alturaLinea);

      const png = await lienzo.encode("png");
      const fichero = join(SALIDA, `${id}-${tono}.png`);
      await writeFile(fichero, png);
      if (tono === "tinta") {
        console.log(`  ${d.nombre}`);
        console.log(`    ${ANCHO} × ${alto} px · ${Math.round(png.length / 1024)} KB`);
      }
    }
  }

  console.log(`\nListos en ${SALIDA}`);
  console.log("Fondo transparente. Sube a Printful el «-tinta» para prendas claras");
  console.log("y el «-crema» para las oscuras.");
}

main().catch((err) => {
  console.error(`\nNo se han podido generar: ${err.message}`);
  process.exit(1);
});
