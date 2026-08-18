/**
 * Cliente del panel de visitas.
 *
 * Pide los datos a `/api/stats`. Si el backend no responde —porque el sitio
 * está desplegado como estático, o porque el servidor aún no está levantado—
 * cuenta las visitas en el navegador para que el panel siga vivo, y avisa de
 * qué fuente está usando.
 */

export type DayCount = { date: string; count: number };

export type Stats = {
  total: number;
  today: number;
  online: number;
  /** Vistas por sección, indexadas por el id de la sección. */
  pages: Record<string, number>;
  /** Los últimos 14 días, del más antiguo al más reciente. */
  days: DayCount[];
  /** Visitas por país: código ISO-3166 alfa-2 (`ES`) o numérico (`724`). */
  countries: Record<string, number>;
};

export type StatsResult = { stats: Stats; live: boolean };

const LOCAL_KEY = "cyp:stats";
const SESSION_KEY = "cyp:seen";
const SECTION_KEY = "cyp:sections";

const todayISO = () => new Date().toISOString().slice(0, 10);

function normalize(raw: Partial<Stats> | null | undefined): Stats {
  return {
    total: raw?.total || 0,
    today: raw?.today || 0,
    online: raw?.online || 1,
    pages: raw?.pages || {},
    days: raw?.days || [],
    countries: raw?.countries || {},
  };
}

function readLocal(): (Stats & { lastVisit: string | null }) | null {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
  } catch {
    return null;
  }
}

function writeLocal(value: unknown) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado: el panel funciona igual, sin persistir */
  }
}

/**
 * Datos de demostración deterministas para la primera carga sin backend.
 * No pretenden ser reales: solo dan forma al panel hasta que haya datos.
 */
function seedLocal(sectionIds: string[]) {
  const days: DayCount[] = [];
  for (let i = 13; i >= 0; i--) {
    days.push({
      date: new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10),
      count: 40 + Math.round(Math.abs(Math.sin(i * 1.7)) * 90),
    });
  }
  const pages: Record<string, number> = {};
  sectionIds.forEach((id, i) => {
    pages[id] = 120 + Math.round(Math.abs(Math.cos(i * 1.3)) * 380);
  });
  return {
    total: days.reduce((a, b) => a + b.count, 0),
    days,
    pages,
    countries: {} as Record<string, number>,
    lastVisit: null as string | null,
  };
}

/** Contabiliza esta visita en el navegador y devuelve el panel resultante. */
export function localStats(sectionIds: string[]): Stats {
  const today = todayISO();
  const stored = readLocal();
  const s = stored && stored.days ? stored : seedLocal(sectionIds);

  if (s.lastVisit !== today || !sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, "1");
    s.total += 1;
    s.pages.inicio = (s.pages.inicio || 0) + 1;
    const last = s.days[s.days.length - 1];
    if (last && last.date === today) last.count += 1;
    else s.days = s.days.slice(1).concat([{ date: today, count: 1 }]);
    s.lastVisit = today;
    writeLocal(s);
  }

  const last = s.days[s.days.length - 1];
  return {
    total: s.total,
    today: last ? last.count : 1,
    online: 1 + (s.total % 7),
    pages: s.pages,
    days: s.days,
    countries: s.countries || {},
  };
}

/** Suma una vista de sección al contador local. */
export function localTrackSection(id: string) {
  const s = readLocal();
  if (!s) return;
  s.pages = s.pages || {};
  s.pages[id] = (s.pages[id] || 0) + 1;
  writeLocal(s);
}

let visitPromise: Promise<void> | null = null;

/**
 * Registra esta visita en el backend antes de leer el panel.
 *
 * El orden importa: si se leyera primero, alguien que entra por primera vez
 * vería el contador a cero incluyendo su propia visita.
 */
function registerVisit(): Promise<void> {
  if (visitPromise) return visitPromise;

  // "inicio" queda marcada aquí para que el observador no la vuelva a enviar.
  try {
    const seen: string[] = JSON.parse(sessionStorage.getItem(SECTION_KEY) || "[]");
    if (!seen.includes("inicio")) {
      sessionStorage.setItem(SECTION_KEY, JSON.stringify(seen.concat(["inicio"])));
    }
  } catch {
    /* sin sessionStorage el servidor deduplica igual por visitante */
  }

  visitPromise = fetch("/api/visit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sections: ["inicio"] }),
  })
    .then(() => undefined)
    // Si no hay backend no se cuenta nada aquí: de eso se encarga `localStats`.
    .catch(() => undefined);

  return visitPromise;
}

export async function fetchStats(sectionIds: string[]): Promise<StatsResult> {
  try {
    await registerVisit();
    const res = await fetch("/api/stats", { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { stats: normalize(await res.json()), live: true };
  } catch {
    return { stats: localStats(sectionIds), live: false };
  }
}

/**
 * Avisa al backend de las secciones que este visitante ha llegado a ver.
 * Cada sección se envía una sola vez por sesión. Sin backend, cuenta local.
 */
export async function trackSections(ids: string[]): Promise<void> {
  let seen: string[] = [];
  try {
    seen = JSON.parse(sessionStorage.getItem(SECTION_KEY) || "[]");
  } catch {
    seen = [];
  }
  const fresh = ids.filter((id) => !seen.includes(id));
  if (!fresh.length) return;

  try {
    sessionStorage.setItem(SECTION_KEY, JSON.stringify(seen.concat(fresh)));
  } catch {
    /* sin sessionStorage se reenviará; el servidor deduplica por visitante */
  }

  try {
    const res = await fetch("/api/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sections: fresh }),
      keepalive: true,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch {
    fresh.forEach(localTrackSection);
  }
}
