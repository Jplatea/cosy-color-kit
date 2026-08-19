import { LinkRule, Marco, Sala, SectionTitle, Thumb } from "./primitives";
import { loDelCanal, socials, youtubeThumb } from "@/config/cyp";

/**
 * Sala 2: las piezas breves.
 *
 * Antes esto eran dos salas —«Proyecciones» para los vídeos largos y «Piezas
 * breves» para los verticales—, y con este canal enseñaban exactamente lo
 * mismo: aquí todo se publica en vertical, así que las dos rejillas salían
 * idénticas una debajo de otra. Ahora es una sola pared con todo lo del canal,
 * de lo más nuevo a lo más viejo.
 *
 * El marco es apaisado aunque el vídeo sea vertical, y no es un descuido: la
 * escena de estos vídeos es ancha y el formato vertical es relleno negro por
 * arriba y por abajo. Cada foto se acerca con lo que se midió de ella al
 * sincronizar, hasta que los personajes quepan enteros y no sobre negro.
 */
export function Videos() {
  const piezas = loDelCanal();

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
              Todo lo que hay colgado, de lo más reciente a lo más antiguo. Cero explicación en
              ninguna de ellas.
            </p>
          </div>
          <LinkRule href={socials.youtubeVideos}>Ver el catálogo completo →</LinkRule>
        </div>

        <div className="grid gap-x-8 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
          {piezas.map((v, i) => {
            const img = v.image || youtubeThumb(v.youtubeId, v.vertical ?? true);
            const href = v.youtubeId
              ? v.vertical
                ? `https://www.youtube.com/shorts/${v.youtubeId}`
                : `https://www.youtube.com/watch?v=${v.youtubeId}`
              : socials.youtubeVideos;
            return (
              <a key={`${v.youtubeId || v.title}-${i}`} href={href} target="_blank" rel="noopener" className="group block">
                <Marco>
                  <div className="relative aspect-[16/10]">
                    <Thumb
                      src={img}
                      alt={v.title}
                      label="Sin miniatura"
                      encuadre={v}
                      caja={16 / 10}
                    />
                  </div>
                </Marco>
                <div className="mt-[14px] flex items-baseline gap-3">
                  <span className="cartela shrink-0 text-museo-laton">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-display text-[18px] leading-[1.25] text-museo-tinta">
                      {v.title}
                    </span>
                    {v.meta && (
                      <span className="cartela mt-[6px] block text-museo-tinta-tenue">{v.meta}</span>
                    )}
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
