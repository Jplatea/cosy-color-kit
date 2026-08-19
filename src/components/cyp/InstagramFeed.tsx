import { Character, type CharacterId, type CostumeId } from "./Character";
import { Eyebrow, SectionTitle } from "./primitives";
import { handles, socials } from "@/config/cyp";

/**
 * "Fotos de ellos quietos": la rejilla de Instagram.
 *
 * Instagram no publica ningún feed abierto —su API exige alta en Meta y un
 * token que caduca cada dos meses—, así que en vez de seis huecos grises
 * esperando imágenes que nadie va a subir, se dibujan los propios personajes,
 * cada uno con un disfraz del vestidor. El chiste del título se sostiene: en
 * los vídeos se mueven, aquí están posando.
 *
 * Si algún día hay fotos reales, cada `pose` admite una `image` y se pinta esa.
 */

type Pose = {
  char: CharacterId;
  costume: CostumeId;
  color: string;
  /** Foto real, si la hay. Manda sobre el personaje dibujado. */
  image?: string;
};

const POSES: Pose[] = [
  { char: "culow", costume: "larva", color: "#7c3aed" },
  { char: "pililarge", costume: "esponja", color: "#f2c500" },
  { char: "culow", costume: "astro", color: "#e7ecf2" },
  { char: "pililarge", costume: "vaquero", color: "#b4552f" },
  { char: "culow", costume: "cerdita", color: "#f39ec0" },
  { char: "pililarge", costume: "amarillos", color: "#f5cf3d" },
];

export function InstagramFeed() {
  return (
    <section id="insta" className="bg-cyp-ink-soft px-6 py-[100px] lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-[34px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Instagram</Eyebrow>
            <SectionTitle className="mt-3">Fotos de ellos quietos</SectionTitle>
          </div>
          <a
            href={socials.instagram}
            target="_blank"
            rel="noopener"
            className="rounded-xl border border-cyp-cream/[0.22] px-[22px] py-[13px] text-[14.5px] font-bold transition-colors hover:border-cyp-gold hover:text-cyp-gold"
          >
            {handles.instagram}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-6">
          {POSES.map((pose, i) => (
            <a
              key={i}
              href={socials.instagram}
              target="_blank"
              rel="noopener"
              aria-label={`Ver el perfil de Instagram ${handles.instagram}`}
              className="group relative block aspect-square overflow-hidden rounded-[16px] border border-cyp-cream/[0.09] transition-colors hover:border-cyp-gold/50"
              style={{
                background:
                  "radial-gradient(70% 60% at 50% 15%, rgba(255,236,205,.10), transparent 72%), #141010",
              }}
            >
              {pose.image ? (
                <img
                  src={pose.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                // Posan quietos, sin flotar: es una foto, no un vídeo.
                <div className="absolute inset-0 flex items-end justify-center pb-[18%] transition-transform duration-300 group-hover:scale-105">
                  <Character
                    char={pose.char}
                    scale={pose.char === "culow" ? 0.4 : 0.3}
                    dress
                    costume={pose.costume}
                    color={pose.color}
                  />
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
