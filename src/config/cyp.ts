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
  { label: "Vídeos", href: "#videos" },
  { label: "Shorts", href: "#shorts" },
  { label: "Ellos dos", href: "#personajes" },
  { label: "Hazlos hablar", href: "#hablar" },
  { label: "Vestidor", href: "#vestidor" },
  { label: "Poemas", href: "#poemas" },
  { label: "Visitas", href: "#visitas" },
] as const;

export type Video = {
  /** ID de YouTube: lo que va después de `v=`. Con esto la miniatura y el enlace salen solos. */
  youtubeId?: string;
  title: string;
  meta: string;
  /** Miniatura propia. Solo hace falta si no hay `youtubeId`. */
  image?: string;
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
    body: "He estudiado la silla\ncuatro años enteros.\nSigo de pie.\nLa silla ha ganado.",
    voice: "pililarge",
  },
  {
    title: "Canción del microondas",
    body: "Un minuto y treinta.\nDentro gira algo tibio.\nFuera giro yo,\nque tampoco tengo prisa.",
    voice: "culow",
  },
];

/** Frases de un clic para la sección "Hazlos hablar". */
export const phrases: { label: string; text: string }[] = [
  { label: "Hola criaturas", text: "Hola criaturas. Hoy no traemos nada útil." },
  { label: "Filosofía barata", text: "Si nadie te mira, ¿sigues siendo alto?" },
  { label: "Queja doméstica", text: "La lavadora ha vuelto a hablarme mal." },
  { label: "Despedida", text: "Nos vamos. Que os cunda la existencia." },
];

/** El "Diálogo a dos": se recita alternando personaje. */
export const duet: { who: "culow" | "pililarge"; text: string; audio?: string }[] = [
  { who: "culow", text: "Pililarge, ¿tú crees que la fregona nos escucha?" },
  { who: "pililarge", text: "Todo nos escucha, Culow. Ese es el problema." },
];

export const marquee = [
  "Culow no tiene brazos y aún así abraza",
  "Pililarge lleva 4 años intentando sentarse",
  "Poemas absurdos cada semana",
  "Homenajes imposibles",
] as const;

/** Secciones que se contabilizan en el panel de visitas. */
export const trackedSections = [
  { id: "inicio", label: "Inicio" },
  { id: "videos", label: "Vídeos" },
  { id: "shorts", label: "Shorts" },
  { id: "hablar", label: "Hazlos hablar" },
  { id: "vestidor", label: "Vestidor" },
  { id: "poemas", label: "Poemas" },
] as const;

/** Miniatura oficial de YouTube a partir del ID del vídeo. */
export const youtubeThumb = (id?: string) =>
  id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
