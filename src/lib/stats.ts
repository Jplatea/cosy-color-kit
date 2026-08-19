/**
 * Cliente del libro de visitas.
 *
 * Los datos son siempre reales: aquí no se inventa ni un número. El panel pide
 * `/api/stats` al backend (`npm run server`), que es quien lleva la cuenta de
 * verdad. Si ese backend no responde —porque el sitio está publicado como
 * estático o porque en local no está levantado— se sigue contando, pero solo
 * lo que pasa en este navegador, empezando en cero, y el panel lo dice en voz
 * alta en lugar de disfrazarlo de tráfico global.
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

/**
 * De qué país es quien está mirando.
 *
 * Se saca de la región del idioma del navegador (`es-ES` → `ES`) y, si el
 * idioma viene sin región, de la zona horaria. Ninguna de las dos cosas sale
 * del navegador ni toca la IP: no hay llamada a ningún servicio de terceros,
 * no hay cookie y no se guarda nada más que las dos letras. El backend solo lo
 * usa cuando el hosting no le ha dicho ya el país por cabecera.
 */
const PAIS_POR_ZONA: Record<string, string> = {
  "Europe/Madrid": "ES", "Atlantic/Canary": "ES", "Europe/Lisbon": "PT",
  "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Paris": "FR",
  "Europe/Berlin": "DE", "Europe/Rome": "IT", "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE", "Europe/Zurich": "CH", "Europe/Vienna": "AT",
  "Europe/Warsaw": "PL", "Europe/Prague": "CZ", "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO", "Europe/Copenhagen": "DK", "Europe/Helsinki": "FI",
  "Europe/Athens": "GR", "Europe/Bucharest": "RO", "Europe/Budapest": "HU",
  "Europe/Moscow": "RU", "Europe/Kyiv": "UA", "Europe/Istanbul": "TR",
  "America/Mexico_City": "MX", "America/Monterrey": "MX", "America/Tijuana": "MX",
  "America/Bogota": "CO", "America/Lima": "PE", "America/Santiago": "CL",
  "America/Argentina/Buenos_Aires": "AR", "America/Montevideo": "UY",
  "America/Asuncion": "PY", "America/La_Paz": "BO", "America/Caracas": "VE",
  "America/Guayaquil": "EC", "America/Panama": "PA", "America/Costa_Rica": "CR",
  "America/Guatemala": "GT", "America/El_Salvador": "SV", "America/Tegucigalpa": "HN",
  "America/Managua": "NI", "America/Santo_Domingo": "DO", "America/Havana": "CU",
  "America/Puerto_Rico": "PR", "America/Sao_Paulo": "BR", "America/Fortaleza": "BR",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Phoenix": "US", "America/Anchorage": "US",
  "Pacific/Honolulu": "US", "America/Toronto": "CA", "America/Vancouver": "CA",
  "Africa/Casablanca": "MA", "Africa/Algiers": "DZ", "Africa/Tunis": "TN",
  "Africa/Cairo": "EG", "Africa/Lagos": "NG", "Africa/Johannesburg": "ZA",
  "Asia/Jerusalem": "IL", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
  "Asia/Karachi": "PK", "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Bangkok": "TH", "Asia/Jakarta": "ID", "Asia/Manila": "PH",
  "Asia/Shanghai": "CN", "Asia/Hong_Kong": "HK", "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR", "Asia/Singapore": "SG", "Asia/Taipei": "TW",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
};

function paisDelVisitante(): string | undefined {
  try {
    for (const lang of navigator.languages || [navigator.language]) {
      const region = new Intl.Locale(lang).region;
      if (region && /^[A-Z]{2}$/.test(region)) return region;
    }
  } catch {
    /* Intl.Locale no está en navegadores viejos: se prueba con la zona horaria */
  }
  try {
    const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return PAIS_POR_ZONA[zona];
  } catch {
    return undefined;
  }
}

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

type Local = Stats & { lastVisit: string | null };

function readLocal(): Local | null {
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

/** Los 14 días de la ventana, a cero. Es el punto de partida honrado. */
function enBlanco(): Local {
  const days: DayCount[] = [];
  for (let i = 13; i >= 0; i--) {
    days.push({
      date: new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10),
      count: 0,
    });
  }
  return { total: 0, today: 0, online: 1, pages: {}, days, countries: {}, lastVisit: null };
}

/** Contabiliza esta visita en el navegador y devuelve el panel resultante. */
export function localStats(): Stats {
  const today = todayISO();
  const stored = readLocal();
  const s = stored && Array.isArray(stored.days) && stored.days.length ? stored : enBlanco();

  if (s.lastVisit !== today || !sessionStorage.getItem(SESSION_KEY)) {
    sessionStorage.setItem(SESSION_KEY, "1");
    s.total += 1;
    s.pages.inicio = (s.pages.inicio || 0) + 1;
    const pais = paisDelVisitante();
    if (pais) s.countries[pais] = (s.countries[pais] || 0) + 1;

    const last = s.days[s.days.length - 1];
    if (last && last.date === today) last.count += 1;
    else s.days = s.days.slice(1).concat([{ date: today, count: 1 }]);
    s.lastVisit = today;
    writeLocal(s);
  }

  const last = s.days[s.days.length - 1];
  return {
    total: s.total,
    today: last ? last.count : 0,
    // Sin backend no hay forma de saber cuántos hay ahora mismo: hay uno, tú.
    online: 1,
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
 * vería el contador sin su propia visita.
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
    body: JSON.stringify({ sections: ["inicio"], pais: paisDelVisitante() }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    })
    // Si no hay backend no se cuenta nada aquí: de eso se encarga `localStats`.
    .catch(() => undefined);

  return visitPromise;
}

export async function fetchStats(): Promise<StatsResult> {
  try {
    await registerVisit();
    const res = await fetch("/api/stats", { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { stats: normalize(await res.json()), live: true };
  } catch {
    return { stats: localStats(), live: false };
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
