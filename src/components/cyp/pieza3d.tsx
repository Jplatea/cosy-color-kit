import { useEffect, useRef, useState } from "react";
import { Character } from "./Character";
import type { CharacterId } from "./costumes";

/**
 * Las dos esculturas de verdad, girables con el dedo.
 *
 * Hasta aquí Culow y Pililarge eran dibujos: dos formas de CSS con un
 * degradado que finge volumen. Esto es el modelo real, el mismo que existe en
 * el ordenador de quien los hizo, y se puede dar la vuelta para verlo por
 * detrás. En una sala que se llama «Estudio de las piezas» parecía lo mínimo.
 *
 * Está escrito a mano contra WebGL, sin biblioteca de 3D. No es cabezonería:
 * la más pequeña de las que sirven pesa más que toda esta web junta, y lo que
 * hay que hacer aquí —cargar una malla, girarla con el ratón y darle dos
 * luces— cabe en este fichero. El precio es no tener sombras ni materiales,
 * que aquí tampoco hacían falta: son dos bultos de poliestireno mate.
 *
 * Si algo falla —no hay WebGL, no llega la malla, el móvil es viejo— se vuelve
 * al dibujo de siempre sin decir nada. La sala tiene que verse igual de bien
 * sin esto.
 */

/** El modelo de cada pieza, ya convertido desde su FBX por `npm run modelos`. */
const MALLA: Record<CharacterId, string> = {
  culow: "/modelos/culow.mesh",
  pililarge: "/modelos/pililarge.mesh",
};

type Malla = { pos: Float32Array; nor: Int8Array; idx: Uint16Array };

/**
 * Lee el `.mesh`. El formato lo escribe `scripts/fbx-a-malla.mjs` y es a
 * propósito de los que se leen de un tirón: cabecera de dieciséis bytes y
 * detrás los tres bloques, uno tras otro.
 */
async function cargar(url: string, señal: AbortSignal): Promise<Malla> {
  const r = await fetch(url, { signal: señal });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const b = await r.arrayBuffer();
  const dv = new DataView(b);
  const marca = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
  if (marca !== "CYPM") throw new Error("eso no es una malla");
  const nv = dv.getUint32(8, true);
  const ni = dv.getUint32(12, true);
  let o = 16;
  const pos = new Float32Array(b.slice(o, o + nv * 12));
  o += nv * 12;
  const nor = new Int8Array(b.slice(o, o + nv * 3));
  o += nv * 3;
  const idx = new Uint16Array(b.slice(o, o + ni * 2));
  return { pos, nor, idx };
}

const VERTICE = `
attribute vec3 posicion;
attribute vec3 normal;
uniform mat4 proyeccion;
uniform mat4 vista;
uniform mat3 giro;
varying vec3 vN;
varying vec3 vP;
void main() {
  vec4 p = vista * vec4(posicion, 1.0);
  vP = p.xyz;
  vN = giro * normal;
  gl_Position = proyeccion * p;
}`;

/*
  El acabado: poliestireno mate.

  La clave es el difuso «envuelto» —`dot * 0.5 + 0.5` en vez de recortar en
  cero—, que es lo que hace que la sombra no corte en seco. Una esfera con
  Lambert a secas se ve como una bola de billar; con esto se ve como algo
  poroso, que es lo que son estas piezas. El contraluz del borde no es adorno:
  sin él, una pieza casi blanca sobre una peana casi blanca se queda sin
  silueta y no se entiende dónde acaba.
*/
const FRAGMENTO = `
precision mediump float;
varying vec3 vN;
varying vec3 vP;
uniform vec3 claro;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(-vP);
  vec3 luz = normalize(vec3(-0.42, 0.78, 0.72));
  vec3 relleno = normalize(vec3(0.75, -0.30, 0.35));
  // La sombra sale del propio color, no de otra variable del tema: las que hay
  // son tonos de papel, casi tan claros como la pieza, y mezclando contra ellos
  // la figura salía plana. Multiplicando se conserva el tinte —cálido de día,
  // cálido de noche— y se gana el recorrido que hacía falta para ver el bulto.
  vec3 oscuro = claro * vec3(0.46, 0.43, 0.395);
  float d = pow(clamp(dot(n, luz) * 0.5 + 0.5, 0.0, 1.0), 1.5);
  d += clamp(dot(n, relleno) * 0.5 + 0.5, 0.0, 1.0) * 0.30;
  float borde = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.4) * 0.30;
  vec3 c = mix(oscuro, claro, clamp(d, 0.0, 1.0)) + borde * claro * 0.55;
  gl_FragColor = vec4(c, 1.0);
}`;

function compilar(gl: WebGLRenderingContext, tipo: number, fuente: string) {
  const s = gl.createShader(tipo)!;
  gl.shaderSource(s, fuente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
  return s;
}

/** El color del material, leído del tema para que valga de día y de noche. */
function colorDelTema(el: HTMLElement, nombre: string, respaldo: [number, number, number]) {
  const v = getComputedStyle(el).getPropertyValue(nombre).trim();
  const m = v.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return respaldo;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as [number, number, number];
}

export function Pieza3D({
  char,
  escalaPlana,
  etiqueta,
}: {
  char: CharacterId;
  /** El tamaño del dibujo de respaldo, para que ocupe lo mismo. */
  escalaPlana: number;
  etiqueta: string;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const [falla, setFalla] = useState(false);
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    const cv = lienzo.current;
    const contenedor = caja.current;
    if (!cv || !contenedor) return;

    const gl =
      (cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false }) as
        | WebGLRenderingContext
        | null) || null;
    if (!gl) {
      setFalla(true);
      return;
    }

    const corta = new AbortController();
    let vivo = true;
    let animando = 0;

    // Ángulos en radianes. `giroY` da la vuelta entera; `giroX` se limita para
    // que no se pueda poner la pieza del revés y perder la referencia de dónde
    // está el suelo.
    let giroY = -0.5;
    let giroX = 0.12;
    let inercia = 0;
    let arrastrando = false;
    let visible = true;
    let quieto = false;

    const suave = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let programa: WebGLProgram | null = null;
    let malla: Malla | null = null;
    let bufPos: WebGLBuffer | null = null;
    let bufNor: WebGLBuffer | null = null;
    let bufIdx: WebGLBuffer | null = null;

    function dimensionar() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(contenedor!.clientWidth * dpr));
      const h = Math.max(1, Math.round(contenedor!.clientHeight * dpr));
      if (cv!.width !== w || cv!.height !== h) {
        cv!.width = w;
        cv!.height = h;
      }
    }

    function pintar() {
      if (!gl || !programa || !malla) return;
      dimensionar();
      gl.viewport(0, 0, cv!.width, cv!.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);

      const aspecto = cv!.width / cv!.height;
      const fov = 0.62;
      const cerca = 0.1;
      const lejos = 20;
      const f = 1 / Math.tan(fov / 2);
      // Proyección en perspectiva, corta pero no de ojo de pez: con una pieza
      // tan cerca, una focal larga la aplana y deja de parecer un objeto.
      const proy = new Float32Array([
        f / aspecto, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (lejos + cerca) / (cerca - lejos), -1,
        0, 0, (2 * lejos * cerca) / (cerca - lejos), 0,
      ]);

      const cy = Math.cos(giroY), sy = Math.sin(giroY);
      const cx = Math.cos(giroX), sx = Math.sin(giroX);
      // Giro en Y y después en X, en columnas, que es como los quiere WebGL.
      const r = [
        cy, sx * sy, -cx * sy,
        0, cx, sx,
        sy, -sx * cy, cx * cy,
      ];
      // Con la pieza normalizada a radio 1, esta distancia deja como un
      // cuarto de aire alrededor. Más cerca y los brazos de Culow tocan el
      // borde al girar, que es justo cuando se nota que está mal encuadrado.
      const dist = 4.25;
      const vista = new Float32Array([
        r[0], r[1], r[2], 0,
        r[3], r[4], r[5], 0,
        r[6], r[7], r[8], 0,
        0, 0, -dist, 1,
      ]);

      gl.useProgram(programa);
      gl.uniformMatrix4fv(gl.getUniformLocation(programa, "proyeccion"), false, proy);
      gl.uniformMatrix4fv(gl.getUniformLocation(programa, "vista"), false, vista);
      gl.uniformMatrix3fv(gl.getUniformLocation(programa, "giro"), false, new Float32Array(r));

      const claro = colorDelTema(contenedor!, "--cyp-objeto", [0.98, 0.96, 0.92]);
      gl.uniform3fv(gl.getUniformLocation(programa, "claro"), claro);

      const aP = gl.getAttribLocation(programa, "posicion");
      gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
      gl.enableVertexAttribArray(aP);
      gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);

      const aN = gl.getAttribLocation(programa, "normal");
      gl.bindBuffer(gl.ARRAY_BUFFER, bufNor);
      gl.enableVertexAttribArray(aN);
      gl.vertexAttribPointer(aN, 3, gl.BYTE, true, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIdx);
      gl.drawElements(gl.TRIANGLES, malla.idx.length, gl.UNSIGNED_SHORT, 0);
    }

    /**
     * El bucle solo corre cuando hay algo que enseñar.
     *
     * Un `requestAnimationFrame` perpetuo en una página con dos lienzos come
     * batería para siempre aunque nadie los mire. Así que se dibuja mientras
     * quede movimiento —arrastre, inercia o el giro lento de reposo— y en
     * cuanto se para, se para de verdad hasta que alguien toque algo.
     */
    function bucle() {
      animando = 0;
      if (!vivo || !visible) return;
      if (!arrastrando) {
        giroY += inercia;
        inercia *= 0.94;
        if (Math.abs(inercia) < 0.0004) inercia = 0;
        // El giro de reposo es el «está vivo, tócame» de la vitrina. Se apaga
        // si el sistema pide menos movimiento y mientras alguien lo maneja.
        if (!inercia && !quieto && !suave) giroY += 0.0022;
      }
      pintar();
      const sigue = arrastrando || inercia !== 0 || (!quieto && !suave);
      if (sigue) animando = requestAnimationFrame(bucle);
    }

    function despertar() {
      if (!animando && vivo && visible) animando = requestAnimationFrame(bucle);
    }

    // ── arrastre
    let ultimoX = 0;
    let ultimoY = 0;
    let idPuntero: number | null = null;

    const abajo = (e: PointerEvent) => {
      arrastrando = true;
      quieto = true;
      idPuntero = e.pointerId;
      ultimoX = e.clientX;
      ultimoY = e.clientY;
      // Capturar el puntero es lo que permite seguir girando aunque el dedo se
      // salga de la vitrina. Puede fallar —el puntero ya no está, otro elemento
      // lo tiene— y entonces se gira igual, solo que soltando en el borde.
      try {
        cv!.setPointerCapture(e.pointerId);
      } catch {
        /* se sigue sin captura */
      }
      setTocado(true);
      despertar();
    };
    const mueve = (e: PointerEvent) => {
      if (!arrastrando || e.pointerId !== idPuntero) return;
      // Se convierte el arrastre a radianes con el ancho del lienzo, para que
      // recorrer la caja de lado a lado dé media vuelta se vea donde se vea.
      const k = (Math.PI * 1.4) / Math.max(1, contenedor!.clientWidth);
      const dx = (e.clientX - ultimoX) * k;
      giroY += dx;
      giroX = Math.max(-0.85, Math.min(0.85, giroX + (e.clientY - ultimoY) * k * 0.7));
      inercia = dx * 0.55;
      ultimoX = e.clientX;
      ultimoY = e.clientY;
      e.preventDefault();
      despertar();
    };
    const arriba = (e: PointerEvent) => {
      if (e.pointerId !== idPuntero) return;
      arrastrando = false;
      idPuntero = null;
      despertar();
    };
    const teclas = (e: KeyboardEvent) => {
      const paso = 0.22;
      if (e.key === "ArrowLeft") giroY -= paso;
      else if (e.key === "ArrowRight") giroY += paso;
      else if (e.key === "ArrowUp") giroX = Math.max(-0.85, giroX - paso * 0.6);
      else if (e.key === "ArrowDown") giroX = Math.min(0.85, giroX + paso * 0.6);
      else return;
      e.preventDefault();
      quieto = true;
      setTocado(true);
      despertar();
    };

    cv.addEventListener("pointerdown", abajo);
    cv.addEventListener("pointermove", mueve);
    cv.addEventListener("pointerup", arriba);
    cv.addEventListener("pointercancel", arriba);
    cv.addEventListener("keydown", teclas);

    // Fuera de pantalla no se dibuja: la sala tiene dos de estos y más abajo
    // hay una tienda entera.
    const mirilla = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) despertar();
      },
      { rootMargin: "120px" }
    );
    mirilla.observe(contenedor);

    const alRedimensionar = () => despertar();
    window.addEventListener("resize", alRedimensionar);

    (async () => {
      try {
        malla = await cargar(MALLA[char], corta.signal);
        if (!vivo) return;
        const p = gl.createProgram()!;
        gl.attachShader(p, compilar(gl, gl.VERTEX_SHADER, VERTICE));
        gl.attachShader(p, compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTO));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("no enlaza");
        programa = p;

        bufPos = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, malla.pos, gl.STATIC_DRAW);
        bufNor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, malla.nor, gl.STATIC_DRAW);
        bufIdx = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, malla.idx, gl.STATIC_DRAW);

        despertar();
      } catch (e) {
        if ((e as Error).name !== "AbortError") setFalla(true);
      }
    })();

    return () => {
      vivo = false;
      corta.abort();
      if (animando) cancelAnimationFrame(animando);
      mirilla.disconnect();
      window.removeEventListener("resize", alRedimensionar);
      cv.removeEventListener("pointerdown", abajo);
      cv.removeEventListener("pointermove", mueve);
      cv.removeEventListener("pointerup", arriba);
      cv.removeEventListener("pointercancel", arriba);
      cv.removeEventListener("keydown", teclas);
      // Devolver la memoria de la tarjeta a mano: el recolector de JavaScript
      // no sabe nada de lo que hay dentro de la GPU.
      [bufPos, bufNor, bufIdx].forEach((b) => b && gl.deleteBuffer(b));
      if (programa) gl.deleteProgram(programa);
    };
  }, [char]);

  if (falla) return <Character char={char} scale={escalaPlana} />;

  return (
    <div ref={caja} className="relative h-full w-full">
      <canvas
        ref={lienzo}
        tabIndex={0}
        role="img"
        aria-label={`${etiqueta} en tres dimensiones. Arrástralo o usa las flechas para girarlo.`}
        className="h-full w-full cursor-grab touch-none rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-museo-tinta active:cursor-grabbing"
      />
      {/* La pista de que esto se toca. Desaparece en cuanto se ha entendido. */}
      <span
        aria-hidden
        className={`cartela pointer-events-none absolute inset-x-0 bottom-0 text-center text-museo-tinta-tenue transition-opacity duration-500 ${
          tocado ? "opacity-0" : "opacity-100"
        }`}
      >
        Gíralo
      </span>
    </div>
  );
}
