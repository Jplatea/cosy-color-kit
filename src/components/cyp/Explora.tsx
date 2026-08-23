import { Sala, SectionTitle } from "./primitives";
import { LogoMark } from "./Logo";
import { ICONOS_CYP, type IconoCyp } from "./iconos-cyp";
import { ICONOS, type RedId } from "./social-icons";
import { directorio, menuSecundario, socials, handles } from "@/config/cyp";

/**
 * El directorio, en la propia página.
 *
 * El panel del botón de menú sirve para saltar desde cualquier punto, pero no
 * invita a nada: hay que saber que está y hay que abrirlo. Esto es lo otro —el
 * plano en la pared de la entrada— y se ve sin pedirlo, que es lo que hace que
 * alguien recién llegado descubra que hay una audioguía o un vestuario.
 *
 * Va justo debajo de la portada porque ahí es donde el visitante decide si se
 * queda. Y ocho celdas, no doce: las seis del menú más las dos salas de
 * contenido que se quedaban fuera. Lo administrativo sigue abajo, en letra
 * pequeña, como debe.
 *
 * Comparte los datos con el panel, así que las dos cosas no pueden
 * desmentirse. Añadir una sala es una línea en la configuración y aparece en
 * los dos sitios a la vez.
 *
 * Se dibuja como una rejilla reglada —líneas de un píxel, sin sombras, sin
 * esquinas redondas— porque un plano impreso no tiene relieve. En cuanto se le
 * ponen tarjetas flotantes deja de parecer un museo y parece un panel de
 * ajustes.
 */

const REDES: { id: RedId; nombre: string; href: string }[] = [
  { id: "youtube", nombre: handles.youtube, href: socials.youtube },
  { id: "tiktok", nombre: handles.tiktok, href: socials.tiktok },
  { id: "instagram", nombre: handles.instagram, href: socials.instagram },
];

export function Explora() {
  return (
    <section id="plano" className="border-y border-museo-linea bg-museo-pared px-6 py-[72px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        {/* Cabecera: a la izquierda el rótulo, a la derecha quiénes son. */}
        <div className="mb-9 grid gap-8 border-b border-museo-linea pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Sala n="01">Plano del museo</Sala>
            <SectionTitle className="mt-4">
              Explora <span className="italic text-museo-tinta-suave">nuestro mundo</span>
            </SectionTitle>
            <p className="mt-3 text-[15px] leading-[1.6] text-museo-tinta-tenue">
              Ocho salas y ningún recorrido obligatorio.
            </p>
          </div>
          <div className="flex items-center gap-5 md:justify-end">
            <LogoMark className="h-[46px] w-[58px] shrink-0 text-museo-laton" />
            <p className="max-w-[26ch] text-[14px] leading-[1.55] text-museo-tinta-suave">
              Dos personajes. Humor especial. Un caos que entendemos mejor entre los dos.
            </p>
          </div>
        </div>

        {/*
          La rejilla y sus líneas.

          El borde va fuera y las divisiones dentro, en vez de dárselo a cada
          celda: así las líneas no se duplican donde dos celdas se tocan, que es
          lo que hace que una tabla se vea sucia de cerca.
        */}
        <div className="grid grid-cols-2 border-l border-t border-museo-linea sm:grid-cols-3 lg:grid-cols-4">
          {directorio.map((sala, i) => {
            const Icono = ICONOS_CYP[sala.icono as IconoCyp];
            return (
              <a
                key={sala.href}
                href={sala.href}
                className="group flex min-h-[186px] flex-col border-b border-r border-museo-linea p-[20px] transition-colors duration-200 hover:bg-museo-papel focus-visible:bg-museo-papel focus-visible:outline-none sm:p-[24px]"
              >
                <span className="cartela text-museo-laton">{String(i + 1).padStart(2, "0")}</span>

                <Icono className="mt-[16px] h-[38px] w-[38px] text-museo-laton transition-colors duration-200 group-hover:text-museo-tinta" />

                <div className="mt-auto pt-[18px]">
                  <div className="cartela text-museo-tinta">{sala.titulo}</div>
                  <p className="mt-[7px] text-[13px] leading-[1.5] text-museo-tinta-tenue">
                    {sala.pie}
                  </p>
                </div>

                {/*
                  La flecha, la única señal de que la celda entera se pulsa.
                  Sin ella una rejilla de texto no parece pulsable, y con ella
                  arriba competiría con el número.
                */}
                <span
                  aria-hidden
                  className="mt-[14px] text-[15px] leading-none text-museo-tinta-tenue transition-transform duration-200 group-hover:translate-x-[4px] group-hover:text-museo-tinta"
                >
                  →
                </span>
              </a>
            );
          })}
        </div>

        {/* Al pie, lo administrativo: pequeño, sin dibujo y sin competir. */}
        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {menuSecundario.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="cartela text-museo-tinta-tenue transition-colors hover:text-museo-tinta"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="cartela text-museo-tinta-tenue">Síguenos</span>
            {REDES.map((r) => {
              const Icono = ICONOS[r.id];
              return (
                <a
                  key={r.id}
                  href={r.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={r.nombre}
                  className="text-museo-tinta-tenue transition-colors hover:text-museo-tinta"
                >
                  <Icono className="h-[17px] w-[17px]" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
