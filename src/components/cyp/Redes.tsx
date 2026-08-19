import { ArrowRight, Instagram, Music2, Youtube } from "lucide-react";
import { Eyebrow, SectionTitle } from "./primitives";
import { socials } from "@/config/cyp";

/**
 * Las tres plataformas, una tarjeta cada una.
 *
 * Recupera la sección "Redes" que tenía la web anterior —mismos textos— pero
 * con el acabado del rediseño: tarjeta oscura, y el color de cada marca como
 * un resplandor difuminado en la esquina en vez de teñir el borde. Sustituye a
 * la rejilla de seis fotos de Instagram, que no se puede rellenar sola: la API
 * de Instagram exige darse de alta en Meta y renovar un token cada dos meses.
 */

const PLATAFORMAS = [
  {
    id: "youtube",
    nombre: "YouTube",
    Icono: Youtube,
    texto: "Shorts animados en 3D, sketches, poemas absurdos y homenajes surrealistas.",
    cta: "Ver canal",
    href: socials.youtube,
    marca: "linear-gradient(135deg, #ff2d2d, #ff6b6b)",
    halo: "rgba(255,45,45,.32)",
  },
  {
    id: "tiktok",
    nombre: "TikTok",
    Icono: Music2,
    texto: "Micro-animaciones virales, humor absurdo servido en menos de 30 segundos.",
    cta: "Seguir en TikTok",
    href: socials.tiktok,
    marca: "linear-gradient(135deg, #00f2ea, #ffffff 55%, #ff0050)",
    halo: "rgba(255,0,80,.28)",
  },
  {
    id: "instagram",
    nombre: "Instagram",
    Icono: Instagram,
    texto: "Fotogramas, storyboards, memes y el detrás del render de cada escena.",
    cta: "Seguir en Instagram",
    href: socials.instagram,
    marca: "linear-gradient(135deg, #feda75, #fa7e1e 35%, #d62976 70%, #4f5bd5)",
    halo: "rgba(214,41,118,.32)",
  },
];

export function Redes() {
  return (
       <section
      id="redes"
      className="border-t border-cyp-cream/10 px-6 py-[100px] lg:px-10"
    >
      <div className="mx-auto max-w-[1200px]">
        <Eyebrow>Donde sucede todo</Eyebrow>
        <SectionTitle className="mb-[6px] mt-3">Síguelos en todas partes</SectionTitle>
        <p className="mb-[34px] max-w-[640px] text-[17px] text-cyp-cream/60">
          Tres sitios, el mismo disparate.
        </p>

        <div className="grid gap-[22px] md:grid-cols-3">
          {PLATAFORMAS.map(({ id, nombre, Icono, texto, cta, href, marca, halo }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener"
              className="group relative overflow-hidden rounded-[24px] border border-cyp-cream/[0.09] bg-cyp-card p-8 transition-colors hover:border-cyp-cream/25"
            >
              {/* El color de la marca, difuminado en la esquina: se intensifica al pasar por encima. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-40 blur-3xl transition-opacity duration-300 group-hover:opacity-75"
                style={{ background: halo }}
              />
              <div className="relative grid gap-5">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                  style={{ background: marca }}
                >
                  <Icono size={26} />
                </div>
                <h3 className="font-bagel text-[30px] leading-none text-cyp-cream-hi">{nombre}</h3>
                <p className="min-h-[4.5rem] text-[16px] leading-[1.6] text-cyp-cream/[0.68]">
                  {texto}
                </p>
                <span className="inline-flex items-center gap-2 text-[14.5px] font-bold text-cyp-cream transition-all group-hover:gap-3 group-hover:text-cyp-gold">
                  {cta} <ArrowRight size={16} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
