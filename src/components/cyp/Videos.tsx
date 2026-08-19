import { LinkRule, Marco, Sala, SectionTitle, Thumb } from "./primitives";
import { socials, videos, youtubeThumb } from "@/config/cyp";

/**
 * Sala 2: las proyecciones.
 *
 * Cada vídeo del canal se cuelga como un cuadro: pasepartú, filete y la
 * cartela debajo. El recorte depende del formato de lo que publique el canal,
 * porque a un vídeo vertical hay que pedirle la miniatura vertical: la 16:9
 * llega con relleno negro a los lados y parece una miniatura metida dentro de
 * otra.
 */
export function Videos() {
  const verticalManda = videos.filter((v) => v.vertical).length * 2 >= videos.length;

  return (
    <section id="videos" className="bg-museo-pared px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-museo-linea pb-8">
          <div>
            <Sala n="02">Proyecciones</Sala>
            <SectionTitle className="mt-4">Lo último del canal</SectionTitle>
          </div>
          <LinkRule href={socials.youtubeVideos}>Ver el catálogo completo →</LinkRule>
        </div>

        {/*
          Marcos apaisados aunque el vídeo sea vertical.
          Medidos uno a uno, en estos fotogramas la luz vive en una franja
          estrecha centrada en el 58 % de la altura; todo lo de arriba y lo de
          abajo es negro. Recortando a 16:10 en vez de a 4:5 el marco mide la
          mitad de alto y el negro sobrante se queda fuera, sin perder nada de
          lo que se ve. El ancho no se toca: tres por fila.
        */}
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => {
            const img = v.image || youtubeThumb(v.youtubeId, verticalManda);
            const href = v.youtubeId
              ? `https://www.youtube.com/watch?v=${v.youtubeId}`
              : socials.youtubeVideos;
            return (
              <a key={`${v.title}-${i}`} href={href} target="_blank" rel="noopener" className="group block">
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
                    <span className="block font-display text-[19px] leading-[1.2] text-museo-tinta">
                      {v.title}
                    </span>
                    <span className="cartela mt-[6px] block text-museo-tinta-45">{v.meta}</span>
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
