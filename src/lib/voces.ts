import { duet, phrases, poems } from "@/config/cyp";

/**
 * Los clips de voz de verdad.
 *
 * La idea es que meter una voz nueva sea arrastrar un fichero y nada más: ni
 * editar configuración, ni ejecutar un comando, ni acordarse de una ruta. Se
 * deja el mp3 en `src/assets/voces/` con el nombre que toca y ya suena.
 *
 * Vite lee la carpeta al compilar (`import.meta.glob`), así que la lista de lo
 * que hay se calcula sola y los ficheros entran en el build con su hash y su
 * caché. Si un clip no está, esa frase se sintetiza y no pasa nada: la web no
 * pide nunca un fichero que no exista, así que tampoco hay errores en consola.
 *
 * El guion —qué frases se pueden grabar y con qué nombre— sale de
 * `config/cyp.ts`, que ya es donde vive el contenido. Añadir un poema añade
 * automáticamente su hueco de audio.
 */

const ficheros = import.meta.glob("../assets/voces/*.{mp3,m4a,ogg,wav}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/** «Oda a la fregona» -> «oda-a-la-fregona». */
export function nombreDeFichero(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * Cómo se lee un poema en voz alta.
 *
 * Los versos van en líneas sueltas, y para que el sintetizador respire al final
 * de cada uno hay que darle puntuación. Pero muchos versos ya terminan en coma
 * o en punto, y añadir otra dejaba frases con «gracias.,» dentro. Solo se pone
 * separador donde falta.
 */
export function comoSeRecita(cuerpo: string): string {
  return cuerpo
    .split(/\r?\n/)
    .map((verso) => verso.trim())
    .filter(Boolean)
    .map((verso, i, todos) =>
      i === todos.length - 1 || /[.,;:!?…]$/.test(verso) ? verso : `${verso},`
    )
    .join(" ");
}

/** Todo lo que se puede grabar, con el nombre exacto que debe llevar el fichero. */
export type Toma = {
  id: string;
  quien: "culow" | "pililarge";
  texto: string;
  /** De qué parte de la web sale, para que la lista se entienda. */
  seccion: string;
};

export const GUION: Toma[] = [
  ...phrases.map((p) => ({
    id: `frase-${nombreDeFichero(p.label)}`,
    // Las frases sueltas las puede decir cualquiera de los dos; se graban con
    // Culow, que es quien viene elegido de fábrica en la audioguía.
    quien: "culow" as const,
    texto: p.text,
    seccion: "Audioguía",
  })),
  ...duet.map((d, i) => ({
    id: `duo-${i + 1}-${d.who}`,
    quien: d.who,
    texto: d.text,
    seccion: "Audioguía · pista a dos voces",
  })),
  ...poems.map((p) => ({
    id: `poema-${nombreDeFichero(p.title)}`,
    quien: p.voice,
    texto: comoSeRecita(p.body),
    seccion: "Textos de sala",
  })),
];

/** Índice por id, ya resuelto a la URL final del build. */
const porId = new Map<string, string>();
for (const [ruta, url] of Object.entries(ficheros)) {
  const base = ruta.split("/").pop()!.replace(/\.[^.]+$/, "");
  porId.set(base, url);
}

/** La URL del clip de esa toma, o undefined si todavía no se ha grabado. */
export const clipDe = (id?: string): string | undefined =>
  id ? porId.get(id) : undefined;

/** Cuántos clips hay puestos, de los que caben. */
export const grabados = () => ({
  hay: GUION.filter((t) => porId.has(t.id)).length,
  de: GUION.length,
});

/**
 * La muestra de voz de cada uno: un trozo suelto del canal, sin frase concreta.
 * Sirve para que en «Las dos piezas» se les pueda oír de verdad aunque todavía
 * no haya ni un diálogo grabado.
 */
export const muestraDe = (quien: "culow" | "pililarge") => clipDe(`${quien}-muestra`);
