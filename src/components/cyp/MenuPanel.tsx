import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ICONOS_CYP, type IconoCyp } from "./iconos-cyp";
import { LogoMark } from "./Logo";
import { directorio, menuSecundario, socials, handles } from "@/config/cyp";
import { ICONOS, type RedId } from "./social-icons";

/**
 * El panel del menú: el nivel 2.
 *
 * Aquí sí se puede jugar, porque ocupa la pantalla y no compite con nada. Seis
 * cosas con su dibujo, y debajo —en letra pequeña y sin icono— lo que hace
 * falta pero no se anuncia: textos de sala, tasación, libro de visitas, redes
 * y recados. Que compartan tamaño con la tienda es el error clásico.
 *
 * En el ordenador es una rejilla de tres; en el móvil, una lista de texto
 * grande con su flecha. No es el mismo panel encogido: con el pulgar lo que se
 * busca es leer rápido, y ahí un icono de 30 píxeles estorba más que ayuda.
 *
 * Se superpone a la sala en vez de sustituirla: la página sigue detrás,
 * atenuada, y por eso se entiende que cerrando se vuelve donde uno estaba. Un
 * folio opaco de pantalla completa parecía otra página distinta.
 *
 * **Se pinta en el `body` con un portal, y eso no es opcional.** Estaba dentro
 * de la cabecera, que lleva `transform` para esconderse al bajar, y un ancestro
 * con `transform` pasa a ser el bloque contenedor de todo lo que tenga dentro
 * en `position: fixed`. El resultado: `inset-0` daba los cuatro lados a cero
 * —se veía en el inspector— pero el panel medía 69 píxeles de alto en vez de la
 * pantalla entera, porque se anclaba a la cabecera. Sus 589 píxeles de
 * contenido quedaban recortados y por debajo asomaba la portada. Sacándolo al
 * `body` queda inmune a cualquier transformación que se le ponga a la cabecera
 * en el futuro.
 */

const REDES: { id: RedId; nombre: string; href: string }[] = [
  { id: "youtube", nombre: handles.youtube, href: socials.youtube },
  { id: "tiktok", nombre: handles.tiktok, href: socials.tiktok },
  { id: "instagram", nombre: handles.instagram, href: socials.instagram },
];

export function MenuPanel({ abierto, cerrar }: { abierto: boolean; cerrar: () => void }) {
  const panel = useRef<HTMLDivElement>(null);

  /*
    Con el panel abierto, la página de detrás no se mueve y el escape lo
    cierra. Y al abrirlo, el foco entra dentro: si no, quien navegue con
    teclado seguiría en la cabecera tabulando por debajo de un panel que le
    tapa la pantalla entera.
  */
  useEffect(() => {
    if (!abierto) return;
    const guardado = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", teclas);
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.body.style.overflow = guardado;
      window.removeEventListener("keydown", teclas);
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;

  return createPortal(
    <>
      {/*
        La sala de detrás, atenuada.

        Sin esto el panel era un folio opaco de pantalla completa y no parecía
        un menú: parecía que se había navegado a otra página. Dejando ver la
        sala por debajo se entiende que estás encima de ella y que cerrando
        vuelves donde estabas. Se cierra al pulsar aquí, que es lo que todo el
        mundo intenta antes de buscar la equis.
      */}
      <div
        className="fixed inset-0 z-[59] animate-cyp-velo bg-museo-tinta/45 backdrop-blur-[2px]"
        onClick={cerrar}
        aria-hidden
      />
      <div
        className="fixed inset-x-0 top-0 z-[60] max-h-[92vh] animate-cyp-panel overflow-y-auto border-b border-museo-linea bg-museo-papel shadow-[0_24px_60px_rgb(var(--cyp-tinta)/0.28)]"
        role="dialog"
        aria-modal="true"
        aria-label="Menú del museo"
        ref={panel}
      >
        <div className="flex flex-col pb-8">
        <div className="mx-auto flex w-full max-w-[1180px] items-start justify-between gap-6 px-6 py-[20px] lg:px-8">
          <div>
            <span className="cartela text-museo-laton">Plano del museo</span>
            <div className="mt-3 font-display text-[34px] leading-[1.05] text-museo-tinta sm:text-[44px]">
              Explora <span className="italic text-museo-tinta-suave">nuestro mundo</span>
            </div>
            <p className="mt-2 text-[14px] text-museo-tinta-tenue">
              Ocho salas y ningún recorrido obligatorio.
            </p>
          </div>
          <div className="hidden items-center gap-4 lg:flex">
            <LogoMark className="h-[38px] w-[48px] shrink-0 text-museo-laton" />
            <p className="max-w-[24ch] text-[13.5px] leading-[1.5] text-museo-tinta-suave">
              Dos personajes. Humor especial. Un caos que entendemos mejor entre los dos.
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar el menú"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[2px] border border-museo-linea text-museo-tinta transition-colors hover:border-museo-tinta"
          >
            <span className="relative block h-[15px] w-[15px]">
              <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        {/* ── Las ocho, en rejilla. En móvil, lista de texto grande. ── */}
        <div className="mx-auto w-full max-w-[1180px] flex-1 px-6 lg:px-8">
          {/*
            Sin cuadrícula: manda el dibujo.

            Las líneas servían cuando esto era un plano impreso dentro de la
            página, donde había que separarlo del texto de alrededor. Aquí, sobre
            una lámina que ya flota por sí sola, cada raya era un borde de más
            compitiendo con los ocho iconos —que es lo único que hay que mirar—.
            Quitadas, el icono crece de 38 a 54 y la retícula la sostiene el aire.

            El fondo al pasar por encima se queda: es lo que dice dónde acaba
            cada celda ahora que no hay líneas que lo digan.
          */}
          <div className="hidden gap-x-4 gap-y-6 sm:grid sm:grid-cols-3 lg:grid-cols-4">
            {directorio.map((sala) => {
              const Icono = ICONOS_CYP[sala.icono as IconoCyp];
              return (
                <a
                  key={sala.href}
                  href={sala.href}
                  onClick={cerrar}
                  className="group flex flex-col rounded-[3px] p-[18px] transition-colors duration-200 hover:bg-museo-pared focus-visible:bg-museo-pared focus-visible:outline-none"
                >
                  <Icono className="h-[54px] w-[54px] text-museo-laton transition-[color,transform] duration-200 ease-out group-hover:-translate-y-[2px] group-hover:text-museo-tinta" />
                  <div className="cartela mt-[20px] text-museo-tinta">{sala.titulo}</div>
                  <p className="mt-[7px] text-[13px] leading-[1.5] text-museo-tinta-tenue">
                    {sala.pie}
                  </p>
                </a>
              );
            })}
          </div>

          {/* En el pulgar manda el texto, no el dibujo. */}
          <div className="grid sm:hidden">
            {directorio.map((sala) => (
              <a
                key={sala.href}
                href={sala.href}
                onClick={cerrar}
                className="flex items-center gap-[14px] border-b border-museo-linea-fina py-[15px] font-display text-[23px] leading-none text-museo-tinta"
              >
                {(() => {
                  const Icono = ICONOS_CYP[sala.icono as IconoCyp];
                  return <Icono className="h-[26px] w-[26px] shrink-0 text-museo-laton" />;
                })()}
                {sala.titulo}
                <span aria-hidden className="ml-auto text-[16px] text-museo-tinta-tenue">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Al pie, lo administrativo. Pequeño y sin dibujo, a propósito. ── */}
        <div className="mt-9 border-t border-museo-linea">
          <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {menuSecundario.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={cerrar}
                  className="cartela text-museo-tinta-tenue transition-colors hover:text-museo-tinta"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4">
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
        </div>
      </div>
    </>,
    document.body
  );
}
