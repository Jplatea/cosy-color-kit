import { LinkRule, Marco, Sala, SectionTitle, Thumb } from "./primitives";
import { shorts, socials, youtubeThumb } from "@/config/cyp";

/**
 * Sala 3: las piezas breves.
 *
 * Los verticales, colgados como una serie: mismo marco, misma medida y el
 * número de orden delante, que es lo que convierte ocho chorradas en una
 * serie.
 *
 * El marco es apaisado aunque el vídeo sea vertical, y no es un descuido: la
 * escena de estos vídeos es ancha y el formato vertical es relleno negro por
 * arriba y por abajo. En un marco 4:5 ese relleno se veía entero. Los pocos
 * que sí llenan el cuadro salen como una foto pequeña centrada, con paspartú
 * a los lados, en lugar de recortados.
 */
export function Shorts() {
  return (
    <section id="shorts" className="px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-museo-linea pb-8">
          <div>
            <Sala n="03">Piezas breves</Sala>
            <SectionTitle className="mt-4">
              Quince segundos, <span className="italic text-museo-tinta-suave">una idea tonta</span>
            </SectionTitle>
          </div>
          <LinkRule href={socials.tiktok}>También en TikTok →</LinkRule>
        </div>

        <div className="grid gap-x-8 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
          {shorts.map((s, i) => {
            const img = s.image || youtubeThumb(s.youtubeId, s.vertical ?? true);
            const href =
              s.url || (s.youtubeId ? `https://www.youtube.com/shorts/${s.youtubeId}` : socials.tiktok);
            return (
              <a key={`${s.title}-${i}`} href={href} target="_blank" rel="noopener" className="group block">
                <Marco>
                  <div className="relative aspect-[16/10]">
                    <Thumb
                      src={img}
                      alt={s.title}
                      label="Sin miniatura"
                      encuadre={s}
                      caja={16 / 10}
                    />
                  </div>
                </Marco>
                <div className="mt-[14px] flex items-baseline gap-3">
                  <span className="cartela shrink-0 text-museo-laton">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[17px] leading-[1.25] text-museo-tinta">
                    {s.title}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
