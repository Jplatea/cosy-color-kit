import { Sala, SectionTitle, Thumb } from "./primitives";
import { ICONOS, type RedId } from "./social-icons";
import { handles, instagramPosts, socials } from "@/config/cyp";

/**
 * Sala 10: las otras sedes.
 *
 * Antes aquí había una rejilla de seis huecos esperando fotos de Instagram que
 * no llegaban nunca: Instagram no deja leer un perfil sin token, así que la
 * rejilla se quedaba vacía siempre. Ahora manda lo que sí se puede enseñar
 * —dónde está cada cosa y qué se encuentra en cada sitio— y la rejilla solo
 * aparece si alguien ha puesto miniaturas de verdad en `instagramPosts`.
 */

const SEDES: { id: RedId; n: string; nombre: string; handle: string; href: string; que: string }[] = [
  {
    id: "youtube",
    n: "I",
    nombre: "YouTube",
    handle: handles.youtube,
    href: socials.youtube,
    que: "La sede central. Los vídeos enteros y todos los verticales, sin cortes ni algoritmo de por medio.",
  },
  {
    id: "tiktok",
    n: "II",
    nombre: "TikTok",
    handle: handles.tiktok,
    href: socials.tiktok,
    que: "Lo mismo en vertical y con más prisa. Es la sala donde se les va del todo y nadie los vigila.",
  },
  {
    id: "instagram",
    n: "III",
    nombre: "Instagram",
    handle: handles.instagram,
    href: socials.instagram,
    que: "El archivo fotográfico: ellos dos quietos, mirando cosas. Documentación de una colección que no la necesita.",
  },
];

export function Redes() {
  const conFotos = instagramPosts.filter((p) => p.image);

  return (
    <section id="redes" className="px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 border-b border-museo-linea pb-8">
          <Sala n="10">Otras sedes</Sala>
          <SectionTitle className="mt-4">
            La misma colección, <span className="italic text-museo-tinta-suave">en tres edificios</span>
          </SectionTitle>
        </div>

        <div className="grid gap-x-8 gap-y-10 md:grid-cols-3">
          {SEDES.map((s) => {
            const Icono = ICONOS[s.id];
            return (
            <a key={s.id} href={s.href} target="_blank" rel="noopener" className="group block border-t border-museo-tinta pt-5">
              <div className="mb-4 flex items-center gap-3 text-museo-tinta">
                <span className="cartela text-museo-laton">{s.n}</span>
                <Icono className="h-5 w-5" />
              </div>
              <div className="font-display text-[30px] leading-none text-museo-tinta transition-colors group-hover:text-museo-laton">
                {s.nombre}
              </div>
              <div className="cartela mt-[10px] text-museo-tinta-tenue">{s.handle}</div>
              <p className="mt-4 text-[15px] leading-[1.65] text-museo-tinta-suave">{s.que}</p>
              <span className="cartela mt-4 inline-block border-b border-museo-linea pb-[3px] text-museo-tinta transition-colors group-hover:border-museo-laton group-hover:text-museo-laton">
                Visitar →
              </span>
            </a>
            );
          })}
        </div>

        {conFotos.length > 0 && (
          <div className="mt-12 grid grid-cols-3 gap-4 lg:grid-cols-6">
            {conFotos.map((p, i) => (
              <a
                key={i}
                href={p.url || socials.instagram}
                target="_blank"
                rel="noopener"
                className="relative block aspect-square overflow-hidden border border-museo-linea bg-museo-peana"
              >
                <Thumb src={p.image} alt={`Publicación ${i + 1} de Instagram`} />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
