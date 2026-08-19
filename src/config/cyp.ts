/**
 * Contenido editable del sitio de Culow y Pililarge.
 *
 * Este es el único fichero que hay que tocar para actualizar vídeos, shorts,
 * poemas o enlaces. Los componentes de `src/components/cyp/` leen de aquí.
 *
 * Los vídeos y shorts se rellenan solos: ejecuta `npm run sync:youtube` y el
 * script escribe `youtube.json` con lo último del canal. Las listas de abajo
 * son el contenido de ejemplo que se muestra mientras ese fichero esté vacío.
 */

import synced from "./youtube.json";

export const socials = {
  youtube: "https://www.youtube.com/@CulowPililarge",
  youtubeVideos: "https://www.youtube.com/@CulowPililarge/videos",
  tiktok: "https://www.tiktok.com/@culow_pililarge",
  instagram: "https://instagram.com/culowpililarge",
  email: "hola@culowypililarge.com",
} as const;

export const handles = {
  youtube: "@CulowPililarge",
  tiktok: "@culow_pililarge",
  instagram: "@culowpililarge",
} as const;

export const nav = [
  { label: "Proyecciones", href: "#videos" },
  { label: "Piezas breves", href: "#shorts" },
  { label: "Las dos piezas", href: "#personajes" },
  { label: "Audioguía", href: "#hablar" },
  { label: "Vestuario", href: "#vestidor" },
  { label: "Tasación", href: "#subasta" },
  { label: "Tienda", href: "#tienda" },
  { label: "Libro de visitas", href: "#visitas" },
] as const;

export type Video = {
  /** ID de YouTube: lo que va después de `v=`. Con esto la miniatura y el enlace salen solos. */
  youtubeId?: string;
  title: string;
  meta: string;
  /** Miniatura propia. Solo hace falta si no hay `youtubeId`. */
  image?: string;
  /** Vertical (9:16) o apaisado. Lo rellena `npm run sync:youtube`. */
  vertical?: boolean;
  /** Dónde salen los personajes en la miniatura. Lo mide `sync:youtube`. */
  banda?: number;
  centro?: number;
  ratio?: number;
};

/** Contenido de ejemplo: solo se ve si `youtube.json` está sin sincronizar. */
const videosDeEjemplo: Video[] = [
  { youtubeId: "", title: "Poema al ventilador de mi tía", meta: "YouTube · nuevo" },
  { youtubeId: "", title: "Homenaje imposible: el señor del kebab", meta: "YouTube" },
  { youtubeId: "", title: "Culow descubre la fregona", meta: "YouTube" },
];

export const videos: Video[] = synced.videos.length ? synced.videos : videosDeEjemplo;

export type Short = {
  /** ID de YouTube Shorts: lo que va después de `/shorts/`. */
  youtubeId?: string;
  /** Enlace directo (útil para TikTok, que no tiene miniatura derivable del enlace). */
  url?: string;
  title: string;
  /** Miniatura propia. Obligatoria para los verticales de TikTok. */
  image?: string;
  /** Vertical (lo normal aquí) o apaisado. Lo rellena `npm run sync:youtube`. */
  vertical?: boolean;
  /** Dónde salen los personajes en la miniatura. Lo mide `sync:youtube`. */
  banda?: number;
  centro?: number;
  ratio?: number;
};

const shortsDeEjemplo: Short[] = [
  { youtubeId: "", title: "Pililarge intenta sentarse" },
  { youtubeId: "", title: "Culow aplaude sin brazos" },
  { youtubeId: "", title: "La cola del banco" },
  { youtubeId: "", title: "Dos formas, un ascensor" },
];

export const shorts: Short[] = synced.shorts.length ? synced.shorts : shortsDeEjemplo;

/** true cuando los vídeos vienen del canal de verdad y no del contenido de ejemplo. */
export const contenidoSincronizado = synced.videos.length > 0 || synced.shorts.length > 0;

/** Feed de Instagram. `image` es la miniatura; `url` el permalink del post. */
export const instagramPosts: { image?: string; url?: string }[] = [
  {}, {}, {}, {}, {}, {},
];

export type Poem = {
  title: string;
  /** Los saltos de línea se respetan al pintarlo. */
  body: string;
  /** Quién lo recita al pulsar el botón. */
  voice: "culow" | "pililarge";
  /**
   * Clip de voz real (ruta dentro de `public/`, p. ej. `/voces/oda-fregona.mp3`).
   * Si está, suena el clip en vez de la síntesis del navegador, y el modulador
   * se dibuja con la onda de verdad.
   */
  audio?: string;
};

export const poems: Poem[] = [
  {
    title: "Oda a la fregona",
    body: "Bailas sin pies,\nlimpias sin manos,\nte apoyas en la pared\ny nadie te da las gracias.",
    voice: "culow",
  },
  {
    title: "Tratado del taburete",
    body: "He estudiado la silla\ncuatro años enteros.\nSigo de pie.\nCreo que voy ganando.",
    voice: "pililarge",
  },
  {
    title: "Canción del microondas",
    body: "Un minuto y treinta.\nDentro gira algo tibio.\nFuera giro yo,\nque tampoco tengo prisa.",
    voice: "culow",
  },
  {
    title: "Nana para un ventilador",
    body: "Duerme, aspa mía,\nque ya no hace calor.\nSi te paras ahora\nnadie se entera.",
    voice: "pililarge",
  },
];

/** Frases de un clic para la sección "Hazlos hablar". */
export const phrases: { label: string; text: string }[] = [
  { label: "Saludo", text: "Hola criaturas. Hoy tampoco traemos nada útil." },
  { label: "Pregunta tonta", text: "Oye, ¿el agua está mojada, o solo lo parece?" },
  { label: "Queja de bar", text: "La lavadora me ha vuelto a hablar mal. Y encima tenía razón." },
  { label: "Duda existencial", text: "Si nadie me mira, ¿sigo siendo alto?" },
  { label: "Amenaza suave", text: "Como sigas así, te lo cuento todo a tu madre." },
  { label: "Despedida", text: "Nos vamos. Que os cunda la existencia." },
];

/**
 * El "Diálogo a dos": se recita alternando personaje. Culow suelta la barbaridad
 * y Pililarge se la cree; ese es el chiste, así que el orden importa.
 */
export const duet: { who: "culow" | "pililarge"; text: string; audio?: string }[] = [
  { who: "culow", text: "Pililarge, la fregona nos escucha. Lo sé porque me guiña." },
  { who: "pililarge", text: "¿Con qué ojo, Culow? Es que quiero saludarla bien." },
];

export const marquee = [
  "Culow no tiene brazos y aún así señala",
  "Pililarge lleva 4 años intentando sentarse",
  "Humor tonto con acabados de lujo",
  "Poemas absurdos y homenajes imposibles",
  "Una voz grave, una voz aguda, cero argumento",
] as const;

/** Secciones que se contabilizan en el panel de visitas. */
export const trackedSections = [
  { id: "inicio", label: "Entrada" },
  { id: "videos", label: "Proyecciones" },
  { id: "shorts", label: "Piezas breves" },
  { id: "hablar", label: "Audioguía" },
  { id: "vestidor", label: "Vestuario" },
  { id: "poemas", label: "Textos de sala" },
] as const;

/**
 * Miniatura oficial de YouTube a partir del ID del vídeo.
 *
 * `hqdefault` siempre devuelve un 16:9, así que con un vídeo vertical dentro
 * llega la imagen encajada en un marco con relleno a los lados: parece una
 * miniatura metida dentro de otra. `oardefault` devuelve el fotograma en su
 * proporción original —vertical si el vídeo es vertical—, que es lo que hay
 * que pedir para los shorts. Para los apaisados, `hq720` da el 16:9 grande.
 */
export const youtubeThumb = (id?: string, vertical?: boolean) =>
  id ? `https://i.ytimg.com/vi/${id}/${vertical ? "oardefault" : "hq720"}.jpg` : "";
