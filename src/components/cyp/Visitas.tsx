import { Sala, SectionTitle } from "./primitives";
import { MapaVisitas } from "./MapaVisitas";
import { useStats } from "@/hooks/useVisitas";
import { trackedSections } from "@/config/cyp";

/**
 * Sala 11: el libro de visitas.
 *
 * Todas las cifras de esta sección son reales. No hay datos de ejemplo en
 * ningún sitio: si el contador de verdad (`npm run server`) está levantado,
 * manda él; si no, lo que se ve son las visitas de este navegador contadas
 * desde cero, y el panel lo dice arriba con todas las letras. Un contador que
 * enseña números inventados no es un contador.
 */

const fmt = (n: number | undefined) => (n || 0).toLocaleString("es-ES");

function Cifra({ label, value, nota }: { label: string; value: string; nota?: string }) {
  return (
    <div className="border-t border-museo-tinta pt-4">
      <div className="cartela text-museo-tinta-45">{label}</div>
      <div className="mt-2 font-display text-[46px] leading-none text-museo-tinta">{value}</div>
      {nota && <div className="cartela mt-2 text-museo-tinta-45">{nota}</div>}
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
    ? [...trackedSections].sort((a, b) => (stats.pages[b.id] || 0) - (stats.pages[a.id] || 0))[0]
    : null;
  const sinNada = stats ? stats.total === 0 : false;

  return (
    <section id="visitas" className="bg-museo-pared px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-museo-linea pb-8">
          <div>
            <Sala n="11">Libro de visitas</Sala>
            <SectionTitle className="mt-4">
              Quién ha pasado <span className="italic text-museo-tinta-70">por aquí</span>
            </SectionTitle>
          </div>
          <div className="flex items-center gap-[9px] border border-museo-linea px-[14px] py-[9px]">
            <span
              className="h-[6px] w-[6px] rounded-full"
              style={{ background: live ? "#9a7b3f" : "rgba(20,18,15,.3)" }}
            />
            <span className="cartela text-museo-tinta-70">
              {!stats
                ? "Abriendo el libro…"
                : live
                  ? "Registro del contador"
                  : "Solo este navegador"}
            </span>
          </div>
        </div>

        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Cifra label="Visitas totales" value={stats ? fmt(stats.total) : "—"} />
          <Cifra label="Hoy" value={stats ? fmt(stats.today) : "—"} />
          <Cifra
            label="Ahora mismo"
            value={stats ? fmt(stats.online) : "—"}
            nota={live ? undefined : "Usted"}
          />
          <div className="border-t border-museo-tinta pt-4">
            <div className="cartela text-museo-tinta-45">Sala más visitada</div>
            <div className="mt-2 font-display text-[30px] leading-tight text-museo-tinta">
              {sinNada ? "—" : topPage ? topPage.label : "—"}
            </div>
          </div>
        </div>

        <div className="mb-12 border-t border-museo-linea pt-8">
          <div className="mb-6 flex items-baseline justify-between gap-5">
            <span className="cartela text-museo-tinta-45">De dónde nos ven</span>
            <span className="cartela text-museo-tinta-45">Pase el ratón por un país</span>
          </div>
          <MapaVisitas countries={stats?.countries} live={live} />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="border-t border-museo-linea pt-8">
            <div className="cartela mb-6 text-museo-tinta-45">Últimos 14 días</div>
            {sinNada ? (
              <p className="text-[14px] text-museo-tinta-45">
                Sin visitas registradas todavía. La primera es la suya.
              </p>
            ) : (
              <div className="flex h-[160px] items-end gap-[6px]">
                {(stats?.days ?? []).map((d, i, arr) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count}`}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="cartela text-museo-tinta-45">{d.count || ""}</div>
                    <div
                      className="w-full"
                      style={{
                        height: Math.max(1, (d.count / maxDay) * 110),
                        background: i === arr.length - 1 ? "#9a7b3f" : "rgba(20,18,15,.2)",
                      }}
                    />
                    <div className="cartela text-museo-tinta-45">{d.date.slice(8)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-museo-linea pt-8">
            <div className="cartela mb-6 text-museo-tinta-45">Visitas por sala</div>
            <div className="grid gap-[14px]">
              {trackedSections.map((s) => (
                <div key={s.id} className="grid gap-[6px]">
                  <div className="flex justify-between text-[13.5px] text-museo-tinta-70">
                    <span>{s.label}</span>
                    <b className="text-museo-tinta">{fmt(stats?.pages[s.id])}</b>
                  </div>
                  <div className="h-[5px] overflow-hidden bg-museo-tinta/10">
                    <div
                      className="h-full bg-museo-tinta"
                      style={{ width: `${((stats?.pages[s.id] || 0) / pageMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-10 max-w-[80ch] border-t border-museo-linea pt-5 text-[13px] leading-[1.65] text-museo-tinta-45">
          {live ? (
            <>
              Estas cifras vienen del contador propio, en{" "}
              <code className="text-museo-tinta-70">/api/stats</code>. No guarda ninguna IP: para
              distinguir visitantes usa un hash con sal que cambia cada día, y del país solo
              archiva el código de dos letras.
            </>
          ) : (
            <>
              El contador de verdad no está respondiendo, así que lo que ve son sus propias
              visitas contadas en este navegador, empezando en cero. Para el recuento global hay
              que levantarlo con <code className="text-museo-tinta-70">npm run server</code> —o
              publicarlo con <code className="text-museo-tinta-70">npm start</code>—; aquí no se
              rellena el hueco con números inventados.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
