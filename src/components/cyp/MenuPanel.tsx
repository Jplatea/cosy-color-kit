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
    <div
      className="fixed inset-0 z-[60] animate-cyp-panel bg-museo-papel"
      role="dialog"
      aria-modal="true"
      aria-label="Menú del museo"
      ref={panel}
    >
      <div className="flex h-full flex-col overflow-y-auto">
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
          <div className="hidden border-l border-t border-museo-linea sm:grid sm:grid-cols-3 lg:grid-cols-4">
            {directorio.map((sala, i) => {
              const Icono = ICONOS_CYP[sala.icono as IconoCyp];
              return (
                <a
                  key={sala.href}
                  href={sala.href}
                  onClick={cerrar}
                  className="group flex min-h-[178px] flex-col border-b border-r border-museo-linea p-[20px] transition-colors duration-200 hover:bg-museo-pared focus-visible:bg-museo-pared focus-visible:outline-none sm:p-[24px]"
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
                    Sin ella una rejilla de texto no parece pulsable, y arriba
                    competiría con el número.
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

          {/* En el pulgar manda el texto, no el dibujo. */}
          <div className="grid sm:hidden">
            {directorio.map((sala) => (
              <a
                key={sala.href}
                href={sala.href}
                onClick={cerrar}
                className="flex items-center justify-between border-b border-museo-linea py-[16px] font-display text-[25px] leading-none text-museo-tinta"
              >
                {sala.titulo}
                <span aria-hidden className="text-[16px] text-museo-tinta-tenue">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Al pie, lo administrativo. Pequeño y sin dibujo, a propósito. ── */}
        <div className="mt-10 border-t border-museo-linea">
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
    </div>,
    document.body
  );
}
