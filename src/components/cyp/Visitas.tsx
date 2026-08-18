import { Eyebrow, SectionTitle } from "./primitives";
import { MapaVisitas } from "./MapaVisitas";
import { useStats } from "@/hooks/useVisitas";
import { trackedSections } from "@/config/cyp";

const fmt = (n: number | undefined) => (n || 0).toLocaleString("es-ES");

function Card({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-[20px] border border-cyp-cream/[0.09] bg-cyp-card p-[26px]">
      <div className="text-[13px] uppercase tracking-[0.1em] text-cyp-cream/45">{label}</div>
      <div
        className={`mt-2 font-bagel text-[42px] ${gold ? "text-cyp-gold" : "text-cyp-cream-hi"}`}
      >
        {value}
      </div>
    </div>
  );
}

export function Visitas() {
  const { stats, live } = useStats();

  const maxDay = stats ? Math.max(...stats.days.map((d) => d.count), 1) : 1;
  const pageMax = stats
    ? Math.max(...trackedSections.map((s) => stats.pages[s.id] || 0), 1)
    : 1;
  const topPage = stats
    ? [...trackedSections].sort(
        (a, b) => (stats.pages[b.id] || 0) - (stats.pages[a.id] || 0)
      )[0]
    : null;

  return (
    <section id="visitas" className="px-6 py-[100px] lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[34px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Contador</Eyebrow>
            <SectionTitle className="mt-3">Quién ha pasado por aquí</SectionTitle>
          </div>
          <div className="flex items-center gap-[9px] rounded-full border border-cyp-cream/[0.16] px-[15px] py-[9px] text-[13px] text-cyp-cream/65">
            <span className="h-2 w-2 rounded-full bg-cyp-gold" />
            <span>
              {!stats
                ? "Cargando…"
                : live
                  ? "Datos en vivo del backend"
                  : "Contando en el navegador (demo)"}
            </span>
          </div>
        </div>

        <div className="mb-5 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Visitas totales" value={stats ? fmt(stats.total) : "—"} />
          <Card label="Hoy" value={stats ? fmt(stats.today) : "—"} />
          <Card label="Ahora mismo" value={stats ? fmt(stats.online) : "—"} gold />
          <div className="rounded-[20px] border border-cyp-cream/[0.09] bg-cyp-card p-[26px]">
            <div className="text-[13px] uppercase tracking-[0.1em] text-cyp-cream/45">
              Sección más vista
            </div>
            <div className="mt-3 font-bagel text-[28px] text-cyp-cream-hi">
              {topPage ? topPage.label : "—"}
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-[22px] border border-cyp-cream/[0.09] bg-cyp-card p-7">
          <div className="mb-[18px] flex items-baseline justify-between gap-5">
            <div className="text-[13px] uppercase tracking-[0.1em] text-cyp-cream/45">
              De dónde nos ven
            </div>
            <div className="text-[12.5px] text-cyp-cream/35">Pasa el ratón por un punto</div>
          </div>
          <MapaVisitas countries={stats?.countries} live={live} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[22px] border border-cyp-cream/[0.09] bg-cyp-card p-7">
            <div className="mb-[22px] text-[13px] uppercase tracking-[0.1em] text-cyp-cream/45">
              Últimos 14 días
            </div>
            <div className="flex h-[170px] items-end gap-2">
              {(stats?.days ?? []).map((d, i, arr) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count}`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="text-[11px] text-cyp-cream/40">{d.count}</div>
                  <div
                    className="w-full rounded-md"
                    style={{
                      height: Math.max(4, (d.count / maxDay) * 118),
                      background: i === arr.length - 1 ? "#e8b25c" : "rgba(242,236,226,.16)",
                    }}
                  />
                  <div className="text-[10.5px] text-cyp-cream/30">{d.date.slice(8)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-cyp-cream/[0.09] bg-cyp-card p-7">
            <div className="mb-[22px] text-[13px] uppercase tracking-[0.1em] text-cyp-cream/45">
              Visitas por sección
            </div>
            <div className="grid gap-[14px]">
              {trackedSections.map((s) => (
                <div key={s.id} className="grid gap-[6px]">
                  <div className="flex justify-between text-[13.5px] text-cyp-cream/75">
                    <span>{s.label}</span>
                    <span className="font-bold text-cyp-gold">
                      {fmt(stats?.pages[s.id])}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-cyp-cream/[0.08]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((stats?.pages[s.id] || 0) / pageMax) * 100}%`,
                        background: "linear-gradient(90deg,#e8b25c,#f6c877)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-[18px] text-[13px] leading-[1.6] text-cyp-cream/[0.38]">
          Este panel pide los datos a <code className="text-cyp-cream/60">/api/stats</code>. Si el
          backend no responde todavía, cuenta las visitas en el navegador para que el panel siga
          vivo, y avisa arriba de qué fuente está usando. El mapa espera{" "}
          <code className="text-cyp-cream/60">countries</code> en esa misma respuesta, con código
          de país (ES, MX…) y número de visitas; mientras no exista, muestra datos de ejemplo.
        </p>
      </div>
    </section>
  );
}
