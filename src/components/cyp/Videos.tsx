import { Bocadillo, LinkRule, Sala, SectionTitle, Thumb } from "./primitives";
import { FORMAS, Onomatopeya, RUIDOS, TRAMA, Vineta } from "./comic";
import { ICONOS, type RedId } from "./social-icons";
import { handles, loDelCanal, socials, youtubeThumb } from "@/config/cyp";

/**
 * Sala 2: las piezas breves.
 *
 * Montada como una página de cómic: seis viñetas de tamaños distintos, con sus
 * calles blancas y su cartucho de texto en cada una. Es lo que pide el
 * material —clips de quince segundos, uno detrás de otro— y de paso resuelve
 * dos cosas que la rejilla de antes hacía mal: catorce miniaturas iguales
 * cansaban antes de llegar abajo, y ninguna destacaba sobre las demás.
 *
 * Seis y se acaba. Lo que quiera ver más, que se vaya al canal: eso es lo que
 * dice el «Continuará» del final, que hace de última viñeta.
 *
 * Las viñetas salen todas en 4:3 aunque midan distinto. La cuenta: la rejilla
 * es de seis columnas por tres filas, y una viñeta pequeña ocupa dos columnas
 * por una fila. Para que eso dé 4:3, cada fila tiene que medir vez y media una
 * columna, y entonces la página entera queda en 4:3 también. Con eso, el
 * recorte de cada miniatura es el mismo cálculo para todas.
 */

const CUANTAS = 6;

/**
 * Dónde va cada viñeta. La primera manda, como en cualquier página de cómic:
 * ocupa cuatro columnas y dos filas, y las otras cinco se reparten el resto.
 * En móvil no hay página que valga —no cabe—, así que la grande va a todo lo
 * ancho y las demás de dos en dos.
 */
const VINETAS = [
  "col-span-2 sm:col-span-4 sm:row-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
];

const REDES: { id: RedId; nombre: string; handle: string; href: string }[] = [
  { id: "youtube", nombre: "YouTube", handle: handles.youtube, href: socials.youtube },
  { id: "tiktok", nombre: "TikTok", handle: handles.tiktok, href: socials.tiktok },
  { id: "instagram", nombre: "Instagram", handle: handles.instagram, href: socials.instagram },
];

export function Videos() {
  const piezas = loDelCanal().slice(0, CUANTAS);

  return (
    <section id="videos" className="bg-museo-pared px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-museo-linea pb-8">
          <div>
            <Sala n="02">Piezas breves</Sala>
            <SectionTitle className="mt-4">
              Quince segundos, <span className="italic text-museo-tinta-suave">una idea tonta</span>
            </SectionTitle>
            <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-museo-tinta-suave">
              Las seis últimas, colgadas como una página. Cero explicación en ninguna de ellas.
            </p>
          </div>
          <LinkRule href={socials.youtubeVideos}>Ver el catálogo completo →</LinkRule>
        </div>

        {/* La página: filete grueso alrededor y trama de puntos en las calles. */}
        <div
          className="border-[3px] border-museo-tinta p-[10px]"
          style={{ background: `${TRAMA}, rgb(var(--cyp-papel))` }}
        >
          <div className="grid grid-cols-2 gap-[10px] sm:aspect-[4/3] sm:grid-cols-6 sm:grid-rows-3">
            {piezas.map((v, i) => {
              const img = v.image || youtubeThumb(v.youtubeId, v.vertical ?? true);
              const href = v.youtubeId
                ? v.vertical
                  ? `https://www.youtube.com/shorts/${v.youtubeId}`
                  : `https://www.youtube.com/watch?v=${v.youtubeId}`
                : socials.youtubeVideos;

              const ruido = RUIDOS[i];

              return (
                <Vineta
                  key={`${v.youtubeId || v.title}-${i}`}
                  forma={FORMAS[i]}
                  className={`group aspect-[4/3] sm:aspect-auto ${VINETAS[i]}`}
                >
                  <a href={href} target="_blank" rel="noopener" className="absolute inset-0 block">
                    <Thumb
                      src={img}
                      alt={v.title}
                      label="Sin miniatura"
                      encuadre={v}
                      caja={4 / 3}
                    />

                    {ruido && (
                      <Onomatopeya
                        texto={ruido.texto}
                        className={ruido.className}
                        giro={ruido.giro}
                      />
                    )}

                    <Bocadillo
                      grande={i === 0}
                      className={
                        i === 0
                          ? "left-[20px] top-[20px] max-w-[58%]"
                          : "left-[12px] top-[12px] max-w-[74%]"
                      }
                    >
                      {v.title}
                    </Bocadillo>

                    {/* El número, en su cartucho de esquina como en los tebeos. */}
                    <span className="absolute bottom-0 right-0 z-[3] border-l-[3px] border-t-[3px] border-museo-tinta bg-museo-papel px-[9px] pb-[2px] pt-[4px] font-comic text-[15px] leading-none tracking-[0.06em] text-museo-tinta">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </a>
                </Vineta>
              );
            })}
          </div>
        </div>

        {/* La última viñeta, que en realidad es la puerta de salida. */}
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-6 border-[3px] border-museo-tinta px-6 py-5"
          style={{ background: `${TRAMA}, rgb(var(--cyp-papel))` }}
        >
          <div>
            <div className="font-comic text-[38px] leading-none tracking-[0.02em] text-museo-tinta">
              ¡Continuará!
            </div>
            <p className="mt-2 text-[14px] text-museo-tinta-suave">
              El resto está colgado en las tres casas. Aquí solo caben seis.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {REDES.map((r) => {
              const Icono = ICONOS[r.id];
              return (
                <a
                  key={r.id}
                  href={r.href}
                  target="_blank"
                  rel="noopener"
                  className="group flex items-center gap-[10px] border-2 border-museo-tinta bg-museo-papel px-[14px] py-[8px] transition-colors hover:bg-museo-tinta"
                >
                  <Icono className="h-[17px] w-[17px] text-museo-tinta transition-colors group-hover:text-museo-papel" />
                  <span className="font-comic text-[17px] leading-none tracking-[0.04em] text-museo-tinta transition-colors group-hover:text-museo-papel">
                    {r.nombre}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
