import { SWATCHES } from "./costumes";
import { NOMBRES, NOMBRES_TEXTURA, type PiezaId, type TexturaId } from "./piezas";

/**
 * El sastre.
 *
 * Le describes un disfraz con tus palabras y te devuelve uno cosido con las
 * piezas del costurero. No busca nada en internet ni pide nada a ningún
 * servicio: es un diccionario de palabras y un puñado de reglas, así que
 * responde al instante, funciona sin conexión y no cuesta dinero.
 *
 * Dos decisiones que se notan al usarlo:
 *
 *  · **Nunca dice que no.** Si no reconoce ni una palabra, no se rinde: saca
 *    color y piezas de la propia frase. Un disfraz raro tiene más gracia que un
 *    «no te he entendido».
 *  · **La misma frase da siempre el mismo disfraz.** Lo que no se reconoce se
 *    resuelve con un número sacado del texto, no al azar. Así el vestidor se
 *    comporta como un sastre —le pides lo mismo y te hace lo mismo— y el
 *    resultado se puede compartir sabiendo que al otro le saldrá igual.
 */

export type Traje = {
  /** Cómo llamarlo en la cartela. */
  nombre: string;
  color: string;
  piezas: PiezaId[];
  textura?: TexturaId;
  /** Qué palabras del texto ha reconocido; vacío si se lo ha inventado todo. */
  reconocido: string[];
};

type Entrada = {
  claves: string[];
  piezas: PiezaId[];
  color?: string;
  textura?: TexturaId;
};

/** Colores por nombre. Se buscan aparte porque son adjetivos, no cosas. */
const COLORES: Record<string, string> = {
  rojo: "#c0392b", roja: "#c0392b", granate: "#7b241c",
  azul: "#2563eb", celeste: "#63b3ed", marino: "#1b3a6b",
  verde: "#3f9e4f", lima: "#8bc34a", turquesa: "#2ec4b6",
  amarillo: "#f2c500", amarilla: "#f2c500", dorado: "#c9a227", dorada: "#c9a227",
  naranja: "#e8762c",
  morado: "#7c3aed", morada: "#7c3aed", lila: "#a78bfa", violeta: "#8b5cf6",
  rosa: "#f39ec0", fucsia: "#e4308c",
  negro: "#26221e", negra: "#26221e",
  blanco: "#fdfaf4", blanca: "#fdfaf4",
  gris: "#8d8d8d", plateado: "#c9ccd1", plata: "#c9ccd1",
  marron: "#8a5a2b", marrón: "#8a5a2b", beige: "#e0d3ba",
};

/**
 * El diccionario. Cada entrada es una idea, no una palabra: se listan las
 * formas en que la gente la escribe. Añadir un disfraz nuevo es añadir una
 * línea aquí; no hay que tocar nada más.
 */
const VOCABULARIO: Entrada[] = [
  { claves: ["pirata", "corsario", "bucanero"], piezas: ["parche", "sombrero", "cinturon"], color: "#26221e" },
  { claves: ["bruja", "brujo", "mago", "maga", "hechicero", "wizard"], piezas: ["gorro-punta", "capa"], color: "#4c2a85" },
  { claves: ["rey", "reina", "principe", "príncipe", "princesa", "corona"], piezas: ["corona", "capa"], color: "#7b241c" },
  { claves: ["vampiro", "vampira", "dracula", "drácula"], piezas: ["capa", "colmillos"], color: "#1c1c22" },
  { claves: ["dragon", "dragón", "dino", "dinosaurio", "lagarto"], piezas: ["pinchos", "cola", "colmillos"], color: "#3f9e4f", textura: "escamas" },
  { claves: ["gato", "gata", "michi", "felino"], piezas: ["orejas-punta", "cola", "bigote"], color: "#8a8078" },
  { claves: ["perro", "perra", "chucho"], piezas: ["orejas-redondas", "hocico", "cola"], color: "#b07a3c" },
  { claves: ["oso", "osa", "panda"], piezas: ["orejas-redondas", "hocico"], color: "#6b5138", textura: "pelo" },
  { claves: ["conejo", "coneja", "liebre"], piezas: ["orejas-punta", "hocico"], color: "#efe4d4" },
  { claves: ["raton", "ratón", "rata"], piezas: ["orejas-redondas", "hocico", "cola", "bigote"], color: "#9a9490" },
  { claves: ["vaca", "toro", "buey"], piezas: ["cuernos", "hocico", "orejas-redondas"], color: "#f4efe6", textura: "lunares" },
  { claves: ["cabra", "carnero", "diablo", "demonio"], piezas: ["cuernos", "colmillos"], color: "#a83232" },
  { claves: ["leon", "león", "leona"], piezas: ["melena", "hocico", "cola"], color: "#d9a441" },
  { claves: ["pajaro", "pájaro", "loro", "pollo", "pollito", "gallina", "pato"], piezas: ["pico", "alas"], color: "#f7d34a" },
  { claves: ["pinguino", "pingüino"], piezas: ["pico", "aletas"], color: "#26221e" },
  { claves: ["pez", "pescado", "sirena", "tiburon", "tiburón"], piezas: ["aletas", "cola"], color: "#2ec4b6", textura: "escamas" },
  { claves: ["abeja", "avispa", "mosca", "bicho", "insecto", "hormiga"], piezas: ["antenas", "alas"], color: "#f2c500", textura: "rayas" },
  { claves: ["mariposa", "libelula", "libélula"], piezas: ["antenas", "alas"], color: "#e4308c" },
  { claves: ["angel", "ángel", "hada"], piezas: ["alas", "corona"], color: "#fdfaf4" },
  { claves: ["astronauta", "espacio", "cosmonauta", "marciano", "alien", "extraterrestre"], piezas: ["casco"], color: "#e7ecf2", textura: "metal" },
  { claves: ["robot", "androide", "maquina", "máquina", "cyborg"], piezas: ["antenas", "cinturon"], color: "#9aa4ad", textura: "metal" },
  { claves: ["buzo", "buceador", "submarinista"], piezas: ["casco", "aletas"], color: "#1f6f8b" },
  { claves: ["vaquero", "cowboy", "sheriff"], piezas: ["sombrero", "cinturon"], color: "#b4552f" },
  { claves: ["detective", "espia", "espía", "agente"], piezas: ["sombrero", "gafas"], color: "#3c3a38" },
  { claves: ["mayordomo", "camarero", "elegante", "esmoquin", "smoking", "gala", "boda"], piezas: ["chistera", "pajarita"], color: "#1c1a18" },
  { claves: ["superheroe", "superhéroe", "heroe", "héroe", "superman"], piezas: ["capa", "cinturon"], color: "#2563eb" },
  { claves: ["ladron", "ladrón", "chorizo", "caco"], piezas: ["gafas", "parche"], color: "#2b2b30" },
  { claves: ["obrero", "albañil", "albanil", "constructor", "obra"], piezas: ["casco", "cinturon"], color: "#f0a51f" },
  { claves: ["cocinero", "chef", "cocinera", "pastelero"], piezas: ["gorro-punta", "bigote"], color: "#fdfaf4" },
  { claves: ["fantasma", "espectro", "sabana", "sábana"], piezas: ["capa"], color: "#f2efe8" },
  { claves: ["momia", "vendas"], piezas: ["capa"], color: "#e4dcc6", textura: "rayas" },
  { claves: ["zombi", "zombie", "muerto"], piezas: ["colmillos", "capa"], color: "#7f9b6a" },
  { claves: ["flor", "planta", "cactus", "arbol", "árbol", "jardin", "jardín"], piezas: ["flor", "pinchos"], color: "#3f9e4f" },
  { claves: ["fresa", "tomate", "manzana", "cereza"], piezas: ["flor"], color: "#c0392b", textura: "lunares" },
  { claves: ["platano", "plátano", "limon", "limón", "piña", "pina"], piezas: ["flor"], color: "#f2c500" },
  { claves: ["sandia", "sandía", "melon", "melón"], piezas: [], color: "#3f9e4f", textura: "rayas" },
  { claves: ["payaso", "circo", "clown"], piezas: ["gorro-punta", "flor", "pajarita"], color: "#e4308c", textura: "lunares" },
  { claves: ["futbolista", "futbol", "fútbol", "deportista", "atleta"], piezas: ["cinturon"], color: "#2563eb", textura: "rayas" },
  { claves: ["medico", "médico", "enfermero", "enfermera", "doctor", "doctora"], piezas: ["gafas"], color: "#fdfaf4" },
  { claves: ["policia", "policía", "guardia"], piezas: ["sombrero", "gafas", "cinturon"], color: "#1b3a6b" },
  { claves: ["bombero", "bombera"], piezas: ["casco", "cinturon"], color: "#c0392b" },
  { claves: ["ninja", "samurai", "samurái"], piezas: ["cinturon"], color: "#26221e" },
  { claves: ["esqueleto", "hueso", "calavera"], piezas: [], color: "#1c1a18", textura: "rayas" },
  { claves: ["nadador", "playa", "verano", "bañador", "banador"], piezas: ["gafas"], color: "#2ec4b6", textura: "rayas" },
  { claves: ["invierno", "esquiador", "frio", "frío", "nieve"], piezas: ["gorro-punta"], color: "#63b3ed" },
  { claves: ["abuelo", "abuela", "viejo", "anciano"], piezas: ["gafas", "bigote"], color: "#b8b2a8" },
  { claves: ["bebe", "bebé", "niño", "nino", "chupete"], piezas: ["gorro-punta"], color: "#f9c8dc" },
  { claves: ["gafas", "gafa", "sol"], piezas: ["gafas"] },
  { claves: ["sombrero", "gorra"], piezas: ["sombrero"] },
  { claves: ["capa"], piezas: ["capa"] },
  { claves: ["alas", "volar", "volando"], piezas: ["alas"] },
  { claves: ["bigote", "mostacho"], piezas: ["bigote"] },
  { claves: ["cola", "rabo"], piezas: ["cola"] },
  { claves: ["cuernos", "cuerno"], piezas: ["cuernos"] },
  { claves: ["rayas", "rayado"], piezas: [], textura: "rayas" },
  { claves: ["lunares", "topos", "puntos"], piezas: [], textura: "lunares" },
  { claves: ["peludo", "pelo", "peluda"], piezas: [], textura: "pelo" },
  { claves: ["escamas", "escamoso"], piezas: [], textura: "escamas" },
];

/** Quita tildes y signos para que «pingüino» y «pinguino» sean lo mismo. */
const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ ]/g, " ")
    .replace(/  +/g, " ")
    .trim();

/** Un número estable a partir del texto: la misma frase, el mismo disfraz. */
function semilla(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Las piezas con las que se improvisa cuando no se reconoce nada. */
const IMPROVISABLES: PiezaId[] = [
  "orejas-punta", "orejas-redondas", "cuernos", "antenas", "alas", "capa",
  "cola", "sombrero", "gorro-punta", "chistera", "corona", "melena", "pico",
  "hocico", "colmillos", "bigote", "aletas", "pinchos", "flor", "gafas",
  "pajarita", "cinturon",
];

const TEXTURAS_IMPROVISABLES: TexturaId[] = ["rayas", "lunares", "escamas", "pelo", "metal"];

export function coser(descripcion: string): Traje {
  const texto = normalizar(descripcion);
  const palabras = texto.split(" ").filter(Boolean);

  const piezas: PiezaId[] = [];
  const reconocido: string[] = [];
  let color: string | undefined;
  let textura: TexturaId | undefined;

  // 1. Colores: el último que se nombre es el que manda.
  for (const p of palabras) {
    if (COLORES[p]) {
      color = COLORES[p];
      reconocido.push(p);
    }
  }

  // 2. Ideas del diccionario. Se busca por palabra entera para que «oso» no
  //    salte dentro de «hermoso», pero también se aceptan plurales simples.
  for (const entrada of VOCABULARIO) {
    const acierto = entrada.claves.find(
      (clave) => palabras.includes(clave) || palabras.includes(`${clave}s`) || palabras.includes(`${clave}es`)
    );
    if (!acierto) continue;
    reconocido.push(acierto);
    entrada.piezas.forEach((p) => {
      if (!piezas.includes(p)) piezas.push(p);
    });
    // El color escrito a mano gana al que trae la idea.
    if (!color && entrada.color) color = entrada.color;
    if (!textura && entrada.textura) textura = entrada.textura;
  }

  // 3. Si no ha sonado nada, se improvisa a partir del propio texto. Nunca se
  //    devuelve un disfraz vacío: eso sería decir que no.
  const n = semilla(texto || "nada");
  if (!piezas.length) {
    const cuantas = 2 + (n % 2);
    for (let i = 0; i < cuantas; i++) {
      const p = IMPROVISABLES[(n >> (i * 3)) % IMPROVISABLES.length];
      if (!piezas.includes(p)) piezas.push(p);
    }
    if (!textura && n % 3 === 0) textura = TEXTURAS_IMPROVISABLES[n % TEXTURAS_IMPROVISABLES.length];
  }
  if (!color) color = SWATCHES[n % SWATCHES.length].value;

  // La cara siempre va la primera para que quede por debajo de lo demás.
  piezas.unshift("cara");

  return {
    nombre: descripcion.trim() || "Disfraz sin nombre",
    color,
    piezas,
    textura,
    reconocido: [...new Set(reconocido)],
  };
}

/** «Orejas de punta, cola y bigote, a rayas» — para la cartela del disfraz. */
export function describir(traje: Traje): string {
  const partes = traje.piezas.filter((p) => p !== "cara").map((p) => NOMBRES[p]);
  if (!partes.length) return traje.textura ? NOMBRES_TEXTURA[traje.textura] : "solo color";
  const lista =
    partes.length === 1
      ? partes[0]
      : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
  const con = traje.textura ? `, ${NOMBRES_TEXTURA[traje.textura]}` : "";
  return lista.charAt(0).toUpperCase() + lista.slice(1) + con;
}
