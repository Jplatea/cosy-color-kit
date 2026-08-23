import { useEffect, useRef } from "react";
import { ICONOS_CYP, type IconoCyp } from "./iconos-cyp";
import { menuDestacado, menuSecundario, socials, handles } from "@/config/cyp";
import { ICONOS, type RedId } from "./social-icons";
import { MuestraMenu } from "./muestra-menu";

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

  return (
    <div
      className="fixed inset-0 z-[60] animate-cyp-panel bg-museo-papel"
      role="dialog"
      aria-modal="true"
      aria-label="Menú del museo"
      ref={panel}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-[18px] lg:px-8">
          <span className="cartela text-museo-tinta-tenue">¿Por dónde empezamos?</span>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar el menú"
            className="grid h-10 w-10 place-items-center rounded-[2px] border border-museo-linea text-museo-tinta transition-colors hover:border-museo-tinta"
          >
            <span className="relative block h-[15px] w-[15px]">
              <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        {/* ── Las seis, en rejilla. En móvil, lista de texto grande. ── */}
        <div className="mx-auto w-full max-w-[1180px] flex-1 px-6 lg:px-8">
          <div className="hidden border border-museo-linea sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {menuDestacado.map((item) => {
              const Icono = ICONOS_CYP[item.icono as IconoCyp];
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={cerrar}
                  className="group flex flex-col border-b border-r border-museo-linea transition-colors duration-200 hover:bg-museo-pared focus-visible:bg-museo-pared focus-visible:outline-none"
                >
                  {/*
                    La imagen manda y el icono baja a marca.

                    Con los dos del mismo tamaño competían: el dibujo de línea
                    dice de qué va la sala y la fotografía enseña lo que hay
                    dentro, y para decidir rápido sirve más lo segundo. El
                    icono se queda en 18 píxeles al lado del título, que es
                    donde sigue haciendo su trabajo —dar identidad— sin robarle
                    sitio a lo que de verdad se mira.
                  */}
                  <MuestraMenu muestra={item.muestra as never} />
                  <div className="p-[22px]">
                    <div className="flex items-center gap-[9px]">
                      <Icono className="h-[18px] w-[18px] shrink-0 text-museo-laton transition-colors duration-200 group-hover:text-museo-tinta" />
                      <span className="font-display text-[22px] leading-[1.15] text-museo-tinta">
                        {item.titulo}
                      </span>
                    </div>
                    <p className="mt-[6px] text-[13.5px] leading-[1.5] text-museo-tinta-tenue">
                      {item.pie}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          {/* En el pulgar manda el texto, no el dibujo. */}
          <div className="grid sm:hidden">
            {menuDestacado.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={cerrar}
                className="flex items-center justify-between border-b border-museo-linea py-[18px] font-display text-[27px] leading-none text-museo-tinta"
              >
                {item.titulo}
                <span aria-hidden className="text-[17px] text-museo-tinta-tenue">
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
    </div>
  );
}
