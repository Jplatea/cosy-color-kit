import { Character } from "./Character";
import { Cartela, Peana } from "./primitives";
import { useNarrow } from "@/hooks/useNarrow";
import { ICONOS, type RedId } from "./social-icons";
import { handles, marquee, socials } from "@/config/cyp";

/**
 * Sala 1: la entrada.
 *
 * Las dos piezas expuestas sobre su peana, cada una con su cartela debajo, y
 * nada más. El chiste no se cuenta en ningún sitio: está en tratar dos formas
 * de poliestireno con el respeto con que se trata un Brancusi.
 */

const FICHAS = [
  {
    char: "culow" as const,
    titulo: "«Culow»",
    filas: [
      ["Año", "2024"],
      ["Técnica", "Poliestireno mate sobre peana"],
      ["Medidas", "230 × 150 cm"],
      ["Voz", "Grave"],
      ["Estado", "No se vende"],
    ] as [string, string][],
  },
  {
    char: "pililarge" as const,
    titulo: "«Pililarge»",
    filas: [
      ["Año", "2024"],
      ["Técnica", "Poliestireno mate sobre peana"],
      ["Medidas", "132 × 372 cm"],
      ["Voz", "Aguda"],
      ["Estado", "Sigue de pie"],
    ] as [string, string][],
  },
];

const REDES: { id: RedId; nombre: string; handle: string; href: string }[] = [
  { id: "youtube", nombre: "YouTube", handle: handles.youtube, href: socials.youtube },
  { id: "tiktok", nombre: "TikTok", handle: handles.tiktok, href: socials.tiktok },
  { id: "instagram", nombre: "Instagram", handle: handles.instagram, href: socials.instagram },
];

export function Hero() {
  const narrow = useNarrow();

  return (
    <section id="inicio" className="px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        {/* Cabecera de exposición: título, fechas y comisariado. */}
        <div className="grid gap-8 border-b border-museo-linea py-[54px] md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="cartela mb-5 text-museo-laton">Colección permanente · Sala 1</div>
            <h1 className="max-w-[15ch] font-display text-[52px] leading-[0.98] tracking-[-0.02em] text-museo-tinta sm:text-[76px] lg:text-[96px]">
              Dos formas blancas
              <span className="block italic text-museo-tinta-70">haciendo el ridículo</span>
            </h1>
          </div>
          <Cartela
            className="md:w-[280px]"
            filas={[
              ["Autores", "Culow y Pililarge"],
              ["Desde", "2024 — sigue abierta"],
              ["Duración", "Quince segundos por pieza"],
              ["Entrada", "Gratuita, como todo esto"],
            ]}
          />
        </div>

        {/* Las dos piezas, cada una en su vitrina. */}
        <div className="grid gap-[26px] py-[54px] md:grid-cols-2">
          {FICHAS.map((f) => (
            <figure key={f.titulo} className="animate-cyp-rise">
              <Peana className="h-[380px] rounded-[3px] px-8 pb-[46px] pt-10 sm:h-[440px]">
                <Character
                  char={f.char}
                  scale={
                    f.char === "culow"
                      ? narrow
                        ? 0.78
                        : 1
                      : narrow
                        ? 0.58
                        : 0.78
                  }
                  bob
                />
              </Peana>
              <figcaption className="mt-5 border-t border-museo-tinta pt-4">
                <div className="mb-[10px] font-display text-[26px] leading-none text-museo-tinta">
                  {f.titulo}
                </div>
                <Cartela filas={f.filas} />
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Cinta de sala: los rótulos que van pegados a la pared del pasillo. */}
        <div className="overflow-hidden border-y border-museo-linea py-[13px]">
          <div className="flex w-max animate-cyp-marquee gap-8 whitespace-nowrap">
            {[0, 1].map((pass) =>
              marquee.map((line) => (
                <span
                  key={`${pass}-${line}`}
                  aria-hidden={pass === 1 ? true : undefined}
                  className="cartela text-museo-tinta-45"
                >
                  {line}
                  <span className="px-6 text-museo-laton">◆</span>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Las tres sedes. El logo va delante porque se reconoce antes que el
            nombre escrito, y aquí lo que interesa es que se vea de un vistazo
            en cuántos sitios están. */}
        <div className="grid gap-x-10 gap-y-6 py-9 sm:grid-cols-3">
          {REDES.map((r) => {
            const Icono = ICONOS[r.id];
            return (
              <a
                key={r.id}
                href={r.href}
                target="_blank"
                rel="noopener"
                className="group flex items-center gap-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-museo-linea text-museo-tinta transition-colors group-hover:border-museo-tinta group-hover:bg-museo-tinta group-hover:text-museo-papel">
                  <Icono className="h-[19px] w-[19px]" />
                </span>
                <span className="min-w-0">
                  <span className="cartela block text-museo-tinta-45">{r.nombre}</span>
                  <span className="block truncate font-display text-[21px] leading-tight text-museo-tinta transition-colors group-hover:text-museo-laton">
                    {r.handle}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
