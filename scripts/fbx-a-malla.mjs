/**
 * Convierte los FBX de las esculturas en una malla que el navegador pueda pintar.
 *
 * Un FBX no se puede enseñar en una web: es un formato de intercambio entre
 * programas de 3D, binario, lleno de cosas que aquí no hacen falta —cámaras,
 * luces, materiales, historial de edición— y para leerlo en el navegador haría
 * falta una biblioteca de las que pesan más que toda esta web junta. Así que se
 * lee **una vez, aquí**, y se deja en disco solo lo que se va a dibujar:
 * posiciones, normales y triángulos.
 *
 * El formato de salida es a propósito el más tonto posible, porque leerlo en el
 * navegador tiene que caber en veinte líneas:
 *
 *     "CYPM"          4 bytes, para no cargar por error otra cosa
 *     versión         1 byte
 *     nº de vértices  uint32
 *     nº de índices   uint32
 *     posiciones      float32 · 3 por vértice, ya centradas y escaladas
 *     normales        int8 · 3 por vértice
 *     índices         uint16 · 3 por triángulo
 *
 * Las posiciones van en float32 porque estas piezas son esferas y cualquier
 * redondeo se ve como facetas en el brillo. Las normales, en cambio, aguantan
 * de sobra en un byte por eje: el error máximo es de medio grado y no hay
 * superficie especular donde pueda notarse.
 *
 *   npm run modelos
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = resolve(RAIZ, "public/modelos");

/** De dónde sale cada pieza. Los FBX no se suben: pesan y no hacen falta. */
const PIEZAS = [
  { id: "culow", fbx: "C:/Users/jplat/Downloads/culowsin.fbx" },
  { id: "pililarge", fbx: "C:/Users/jplat/Downloads/Pililargesin.fbx" },
];

// ─────────────────────────────────────────────── el FBX binario

/**
 * Un FBX binario es un árbol de nodos, cada uno con su nombre, sus propiedades
 * y sus hijos. Lo único raro es que el tamaño de los desplazamientos cambia con
 * la versión: a partir de la 7500 son de 64 bits en vez de 32.
 */
function leerFbx(ruta) {
  const buf = readFileSync(ruta);
  if (buf.subarray(0, 20).toString("binary") !== "Kaydara FBX Binary  ") {
    throw new Error(`${ruta} no es un FBX binario`);
  }
  const version = buf.readUInt32LE(23);
  const ancho = version >= 7500 ? 8 : 4;
  const desplaz = (p) => (ancho === 8 ? Number(buf.readBigUInt64LE(p)) : buf.readUInt32LE(p));

  function propiedad(p) {
    const tipo = String.fromCharCode(buf[p]);
    p++;
    switch (tipo) {
      case "Y": return { valor: buf.readInt16LE(p), fin: p + 2 };
      case "C": return { valor: !!buf[p], fin: p + 1 };
      case "I": return { valor: buf.readInt32LE(p), fin: p + 4 };
      case "F": return { valor: buf.readFloatLE(p), fin: p + 4 };
      case "D": return { valor: buf.readDoubleLE(p), fin: p + 8 };
      case "L": return { valor: Number(buf.readBigInt64LE(p)), fin: p + 8 };
      case "S":
      case "R": {
        const n = buf.readUInt32LE(p);
        const b = buf.subarray(p + 4, p + 4 + n);
        return { valor: tipo === "S" ? b.toString("binary") : b, fin: p + 4 + n };
      }
      default: {
        // Un array. Puede venir comprimido con zlib, que es lo normal.
        const n = buf.readUInt32LE(p);
        const codificado = buf.readUInt32LE(p + 4);
        const largo = buf.readUInt32LE(p + 8);
        let datos = buf.subarray(p + 12, p + 12 + largo);
        if (codificado === 1) datos = inflateSync(datos);
        const salida =
          tipo === "d" ? new Float64Array(n)
          : tipo === "f" ? new Float32Array(n)
          : tipo === "i" ? new Int32Array(n)
          : tipo === "b" ? new Uint8Array(n)
          : new Float64Array(n);
        for (let k = 0; k < n; k++) {
          if (tipo === "d") salida[k] = datos.readDoubleLE(k * 8);
          else if (tipo === "f") salida[k] = datos.readFloatLE(k * 4);
          else if (tipo === "i") salida[k] = datos.readInt32LE(k * 4);
          else if (tipo === "l") salida[k] = Number(datos.readBigInt64LE(k * 8));
          else salida[k] = datos[k];
        }
        return { valor: salida, fin: p + 12 + largo };
      }
    }
  }

  function nodo(p) {
    const fin = desplaz(p);
    // Un registro a cero es la marca de «aquí se acaban los hermanos».
    if (fin === 0) return null;
    const cuantas = desplaz(p + ancho);
    const nLargo = buf[p + ancho * 3];
    const nombre = buf.subarray(p + ancho * 3 + 1, p + ancho * 3 + 1 + nLargo).toString("binary");
    let q = p + ancho * 3 + 1 + nLargo;
    const props = [];
    for (let i = 0; i < cuantas; i++) {
      const pr = propiedad(q);
      props.push(pr.valor);
      q = pr.fin;
    }
    const hijos = [];
    while (q < fin - 1) {
      const h = nodo(q);
      if (!h) break;
      hijos.push(h.nodo);
      q = h.fin;
    }
    return { nodo: { nombre, props, hijos }, fin };
  }

  const raiz = { nombre: "", props: [], hijos: [] };
  let p = 27;
  while (p < buf.length - 20) {
    const h = nodo(p);
    if (!h || h.fin <= p) break;
    raiz.hijos.push(h.nodo);
    p = h.fin;
  }
  return raiz;
}

/** El primer nodo con ese nombre, buscando en profundidad. */
function buscar(nodo, nombre) {
  if (nodo.nombre === nombre) return nodo;
  for (const h of nodo.hijos) {
    const r = buscar(h, nombre);
    if (r) return r;
  }
  return null;
}

const hijo = (nodo, nombre) => nodo?.hijos.find((h) => h.nombre === nombre) || null;
const texto = (nodo, nombre) => hijo(nodo, nombre)?.props[0] ?? "";

// ─────────────────────────────────────────────── de malla FBX a triángulos

/**
 * Saca de la geometría una lista de triángulos con su normal.
 *
 * Dos cosas del formato que hay que saber:
 *
 *  · **Los polígonos no vienen separados.** `PolygonVertexIndex` es una lista
 *    corrida de índices y el último de cada cara viene negado —con el
 *    complemento a uno— para marcar dónde acaba. Por eso hay que ir juntando
 *    hasta ver un negativo. Y como pueden ser cuadriláteros o polígonos de más
 *    lados, se abanican en triángulos.
 *
 *  · **Las normales pueden ir por esquina, no por vértice.** Un vértice
 *    compartido por dos caras con ángulo vivo tiene dos normales distintas, así
 *    que la pareja (posición, normal) es lo que de verdad identifica un vértice
 *    al dibujar. Se rehace la lista deduplicando por esa pareja: en una esfera
 *    sale casi uno a uno, y en una arista viva se parte en dos como debe.
 */
function triangular(geo) {
  const posiciones = hijo(geo, "Vertices")?.props[0];
  const indices = hijo(geo, "PolygonVertexIndex")?.props[0];
  if (!posiciones || !indices) throw new Error("la geometría no trae vértices");

  const capaN = hijo(geo, "LayerElementNormal");
  const normales = hijo(capaN, "Normals")?.props[0];
  const indiceN = hijo(capaN, "NormalsIndex")?.props[0];
  const mapeoN = texto(capaN, "MappingInformationType");
  const refN = texto(capaN, "ReferenceInformationType");

  /** La normal que le toca a la esquina `k` del polígono, cuyo vértice es `v`. */
  const normalDe = (k, v) => {
    if (!normales) return -1;
    if (mapeoN === "ByVertice" || mapeoN === "ByVertex") {
      return refN.startsWith("IndexTo") ? indiceN[v] : v;
    }
    // ByPolygonVertex, que es lo habitual.
    return refN.startsWith("IndexTo") ? indiceN[k] : k;
  };

  const nuevos = new Map();
  const pos = [];
  const nor = [];
  const tri = [];

  const vertice = (k, v) => {
    const n = normalDe(k, v);
    const clave = `${v}|${n}`;
    let i = nuevos.get(clave);
    if (i !== undefined) return i;
    i = pos.length / 3;
    pos.push(posiciones[v * 3], posiciones[v * 3 + 1], posiciones[v * 3 + 2]);
    if (n >= 0) nor.push(normales[n * 3], normales[n * 3 + 1], normales[n * 3 + 2]);
    else nor.push(0, 0, 0);
    nuevos.set(clave, i);
    return i;
  };

  let cara = [];
  for (let k = 0; k < indices.length; k++) {
    const bruto = indices[k];
    const ultimo = bruto < 0;
    const v = ultimo ? ~bruto : bruto;
    cara.push(vertice(k, v));
    if (!ultimo) continue;
    // Abanico desde el primer vértice: vale para triángulos, cuadriláteros y
    // cualquier polígono convexo, que es todo lo que exporta un modelador.
    for (let j = 1; j + 1 < cara.length; j++) tri.push(cara[0], cara[j], cara[j + 1]);
    cara = [];
  }

  return { pos, nor, tri, sinNormales: !normales };
}

/**
 * La transformación que el modelador dejó puesta sobre la malla.
 *
 * Esto no es un detalle: los dos ficheros traen una rotación de −90° en X, que
 * es la que mete Blender al exportar para pasar de su mundo con la Z arriba al
 * de FBX con la Y arriba. La geometría cruda está girada y el nodo `Model` es
 * quien la endereza, así que leer solo los vértices deja a Pililarge tumbado.
 *
 * Se lee la rotación y la escala; la traslación da igual, porque después se
 * centra la pieza. La escala se aplica aunque luego se normalice, porque puede
 * no ser igual en los tres ejes —en Culow lo es por un 0,3 %— y eso sí cambia
 * la forma.
 */
function transformacionDe(objetos) {
  const modelo = objetos.hijos.find((h) => h.nombre === "Model");
  const props = hijo(modelo, "Properties70")?.hijos || [];
  const buscarP = (nombre, porDefecto) => {
    const p = props.find((x) => x.nombre === "P" && x.props[0] === nombre);
    return p ? [p.props[4], p.props[5], p.props[6]] : porDefecto;
  };
  const grados = buscarP("Lcl Rotation", [0, 0, 0]);
  const escala = buscarP("Lcl Scaling", [1, 1, 1]);

  const r = grados.map((g) => (g * Math.PI) / 180);
  const [cx, cy, cz] = r.map(Math.cos);
  const [sx, sy, sz] = r.map(Math.sin);
  // Euler en orden XYZ, que es el que declaran estos ficheros (RotationOrder 0).
  const R = [
    [cy * cz, -cy * sz, sy],
    [sx * sy * cz + cx * sz, -sx * sy * sz + cx * cz, -sx * cy],
    [-cx * sy * cz + sx * sz, cx * sy * sz + sx * cz, cx * cy],
  ];
  return { R, escala, grados };
}

/** Aplica la rotación y la escala a un vector, en su sitio. */
function aplicar({ R, escala }, v, i, conEscala = true) {
  const x = v[i] * (conEscala ? escala[0] : 1);
  const y = v[i + 1] * (conEscala ? escala[1] : 1);
  const z = v[i + 2] * (conEscala ? escala[2] : 1);
  v[i] = R[0][0] * x + R[0][1] * y + R[0][2] * z;
  v[i + 1] = R[1][0] * x + R[1][1] * y + R[1][2] * z;
  v[i + 2] = R[2][0] * x + R[2][1] * y + R[2][2] * z;
}

/**
 * Centra la pieza y la mete en una esfera de radio 1.
 *
 * Las dos esculturas vienen a escalas distintas y con el origen donde le vino
 * bien al modelador. Normalizándolas aquí, el visor no tiene que saber nada de
 * cada pieza: pinta lo que le den, siempre del mismo tamaño en pantalla.
 *
 * Se centra por la caja y se escala por el radio, no por la caja: escalando por
 * la caja, la cápsula alta y las dos esferas anchas acabarían ocupando lo mismo
 * y se perdería justo lo que las diferencia, que uno es largo y el otro gordo.
 */
function normalizar(pos) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) {
    for (let e = 0; e < 3; e++) {
      if (pos[i + e] < min[e]) min[e] = pos[i + e];
      if (pos[i + e] > max[e]) max[e] = pos[i + e];
    }
  }
  const centro = min.map((v, e) => (v + max[e]) / 2);
  let radio = 0;
  for (let i = 0; i < pos.length; i += 3) {
    const d = Math.hypot(pos[i] - centro[0], pos[i + 1] - centro[1], pos[i + 2] - centro[2]);
    if (d > radio) radio = d;
  }
  const k = radio > 0 ? 1 / radio : 1;
  for (let i = 0; i < pos.length; i += 3) {
    for (let e = 0; e < 3; e++) pos[i + e] = (pos[i + e] - centro[e]) * k;
  }
  return { tam: max.map((v, e) => (v - min[e]) * k) };
}

/** Normales suaves calculadas del propio triángulo, por si el FBX no las trae. */
function calcularNormales(pos, tri, nor) {
  nor.fill(0);
  for (let t = 0; t < tri.length; t += 3) {
    const [a, b, c] = [tri[t] * 3, tri[t + 1] * 3, tri[t + 2] * 3];
    const u = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]];
    const v = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    for (const i of [a, b, c]) for (let e = 0; e < 3; e++) nor[i + e] += n[e];
  }
}

function empaquetar(pos, nor, tri) {
  const nv = pos.length / 3;
  const ni = tri.length;
  const cabecera = 4 + 1 + 3 + 4 + 4;
  const buf = Buffer.alloc(cabecera + nv * 3 * 4 + nv * 3 + ni * 2);
  buf.write("CYPM", 0, "ascii");
  buf.writeUInt8(1, 4);
  buf.writeUInt32LE(nv, 8);
  buf.writeUInt32LE(ni, 12);

  let p = cabecera;
  for (let i = 0; i < nv * 3; i++, p += 4) buf.writeFloatLE(pos[i], p);
  for (let i = 0; i < nv; i++) {
    const l = Math.hypot(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]) || 1;
    for (let e = 0; e < 3; e++, p++) {
      buf.writeInt8(Math.max(-127, Math.min(127, Math.round((nor[i * 3 + e] / l) * 127))), p);
    }
  }
  for (let i = 0; i < ni; i++, p += 2) buf.writeUInt16LE(tri[i], p);
  return buf;
}

// ─────────────────────────────────────────────── principal

function main() {
  mkdirSync(SALIDA, { recursive: true });
  console.log("Convirtiendo las esculturas…\n");

  for (const pieza of PIEZAS) {
    let raiz;
    try {
      raiz = leerFbx(pieza.fbx);
    } catch (e) {
      console.log(`  · ${pieza.id}: no pude leer ${pieza.fbx}\n    (${e.message})`);
      continue;
    }

    const objetos = buscar(raiz, "Objects");
    const geo = objetos?.hijos.find((h) => h.nombre === "Geometry");
    if (!geo) {
      console.log(`  · ${pieza.id}: el fichero no trae ninguna geometría`);
      continue;
    }

    const { pos, nor, tri, sinNormales } = triangular(geo);

    // Primero se endereza con lo que dice el nodo Model, y después se centra:
    // al revés, el centro saldría del cuerpo tumbado y la pieza quedaría
    // descolocada al girarla.
    const t = transformacionDe(objetos);
    for (let i = 0; i < pos.length; i += 3) aplicar(t, pos, i);
    for (let i = 0; i < nor.length; i += 3) aplicar(t, nor, i, false);

    const { tam } = normalizar(pos);
    if (sinNormales) calcularNormales(pos, tri, nor);

    if (pos.length / 3 > 65535) {
      // Los índices van en 16 bits; más vértices que eso no cabrían.
      console.log(`  · ${pieza.id}: ${pos.length / 3} vértices, demasiados para índices de 16 bits`);
      continue;
    }

    const buf = empaquetar(pos, nor, tri);
    const destino = resolve(SALIDA, `${pieza.id}.mesh`);
    writeFileSync(destino, buf);

    console.log(`  · ${pieza.id}`);
    console.log(`      ${pos.length / 3} vértices · ${tri.length / 3} triángulos`);
    console.log(`      ancho ${tam[0].toFixed(2)} · alto ${tam[1].toFixed(2)} · fondo ${tam[2].toFixed(2)}` + (t.grados.some(Boolean) ? `  (enderezada ${t.grados.map(g=>Math.round(g)).join("/")}°)` : ""));
    console.log(`      ${(buf.length / 1024).toFixed(0)} KB en public/modelos/${pieza.id}.mesh`);
  }

  console.log("\nLos .fbx no se copian: pesan y el navegador no sabría leerlos.");
}

main();
