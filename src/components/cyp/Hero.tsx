import { Instagram, Music2, Youtube } from "lucide-react";
import { Character } from "./Character";
import { useNarrow } from "@/hooks/useNarrow";
import { handles, marquee, socials } from "@/config/cyp";

const SOCIAL_LINKS = [
  { name: "YouTube", handle: handles.youtube, href: socials.youtube, Icono: Youtube, color: "#ff2d2d" },
  { name: "TikTok", handle: handles.tiktok, href: socials.tiktok, Icono: Music2, color: "#00f2ea" },
  { name: "Instagram", handle: handles.instagram, href: socials.instagram, Icono: Instagram, color: "#d62976" },
];

export function Hero() {
  const narrow = useNarrow();

  return (
    <section id="inicio" className="relative overflow-hidden px-6 pb-10 lg:px-10">
      {/* El foco del estudio, latiendo despacio por encima de todo. */}
      <div
        className="pointer-events-none absolute -top-[260px] left-1/2 h-[900px] w-[1100px] -translate-x-1/2 animate-cyp-spot"
        style={{
          background:
            "radial-gradient(50% 45% at 50% 30%, rgba(255,238,208,.30), rgba(255,220,170,.08) 55%, transparent 72%)",
        }}
      />

      <div className="relative mx-auto grid min-h-[640px] max-w-[1200px] items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div className="py-[60px]">
          <div className="inline-flex items-center gap-[9px] rounded-full border border-cyp-gold/35 bg-cyp-gold/[0.08] px-[14px] py-[7px] text-[12.5px] font-semibold uppercase tracking-[0.12em] text-cyp-gold">
            Animación 3D · Humor absurdo
          </div>

          <h1 className="mt-[22px] font-bagel text-[32px] leading-[0.98] tracking-[-0.01em] text-cyp-cream-hi [text-wrap:balance] sm:text-[46px] md:text-[62px] lg:text-[76px]">
            Dos formas blancas
            <br />
            haciendo el ridículo
            <br />
            con mucha ternura.
          </h1>

          <p className="mt-[22px] max-w-[520px] text-[19px] leading-[1.62] text-cyp-cream/70 [text-wrap:pretty]">
            Culow es bajito y redondo. Pililarge es alto y no se dobla. Juntos convierten lo
            cotidiano —una fregona, un ventilador, la cola del banco— en surrealismo puro. Aquí
            está todo: vídeos, shorts, poemas y dos juguetes para jugar con ellos.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#hablar"
              className="rounded-[14px] bg-cyp-cream-hi px-[26px] py-[15px] text-[15.5px] font-bold text-cyp-ink transition-colors hover:bg-white"
            >
              Hazlos hablar
            </a>
            <a
              href="#vestidor"
              className="rounded-[14px] border border-cyp-cream/[0.24] px-[26px] py-[15px] text-[15.5px] font-bold text-cyp-cream transition-colors hover:border-cyp-gold hover:text-cyp-gold"
            >
              Vestirlos (juego)
            </a>
          </div>

          <div className="mt-11 flex flex-wrap gap-x-6 gap-y-4 border-t border-cyp-cream/10 pt-[26px] sm:gap-x-[30px]">
            {SOCIAL_LINKS.map(({ name, handle, href, Icono, color }) => (
              <a key={name} href={href} target="_blank" rel="noopener" className="group grid gap-[3px]">
                <span className="flex items-center gap-2 font-bagel text-[22px] text-cyp-cream-hi">
                  {/* El icono toma el color de la marca al pasar por encima; en reposo va crema
                      para no romper la paleta del estudio. */}
                  <Icono
                    size={20}
                    className="shrink-0 transition-colors"
                    style={{ color: "rgba(242,236,226,.55)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = color)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(242,236,226,.55)")}
                  />
                  {name}
                </span>
                <span className="text-[13px] text-cyp-cream/55">{handle}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Los dos, flotando sobre el suelo del estudio.
            A tamaño completo ocupan 418px de ancho: en móvil se dibujan más
            pequeños para no empujar la página. */}
        <div className="relative flex h-[420px] items-end justify-center gap-8 pb-[70px] sm:h-[600px] sm:gap-14">
          <div
            className="absolute bottom-[52px] left-1/2 h-[130px] w-[560px] -translate-x-1/2 blur-[6px]"
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(255,235,205,.14), transparent 70%)",
            }}
          />
          <Character char="culow" scale={narrow ? 0.6 : 1} bob />
          <Character char="pililarge" scale={narrow ? 0.6 : 1} bob />
        </div>
      </div>

      {/* Cinta de eslóganes. El contenido va duplicado: el bucle desplaza justo la mitad. */}
      <div className="relative mx-auto max-w-[1200px] overflow-hidden border-y border-cyp-cream/10 py-[14px]">
        <div className="flex w-max animate-cyp-marquee gap-10 whitespace-nowrap font-bagel text-[16px] text-cyp-cream/[0.42]">
          {[0, 1].map((pass) =>
            marquee.map((line) => (
              <span key={`${pass}-${line}`} aria-hidden={pass === 1 ? true : undefined}>
                {line} <span className="px-4">·</span>
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
