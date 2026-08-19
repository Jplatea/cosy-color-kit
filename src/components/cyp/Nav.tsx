import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";
import { nav, socials } from "@/config/cyp";

/**
 * La cabecera del museo.
 *
 * Arriba del todo, una línea de horario y entrada como la de cualquier
 * institución seria; debajo, el rótulo y el plano de salas. Cuando se baja, la
 * línea de arriba desaparece y solo queda el rótulo pegado, para no robarle
 * sitio a la sala que se esté mirando.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [bajado, setBajado] = useState(false);

  useEffect(() => {
    const onScroll = () => setBajado(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-[60] border-b border-museo-linea bg-museo-papel/90 backdrop-blur-[10px]">
      {/* Banda de horario: lo primero que se lee en la puerta de un museo. */}
      <div
        className={`overflow-hidden border-b border-museo-linea-fina transition-[max-height,opacity] duration-300 ${
          bajado ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-[9px] lg:px-8">
          <span className="cartela text-museo-tinta-45">
            Abierto todos los días · Entrada gratuita
          </span>
          <span className="cartela hidden text-museo-tinta-45 sm:block">
            Prohibido tocar las piezas (se puede)
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1180px] items-center gap-6 px-6 py-[14px] lg:px-8">
        <a href="#inicio" className="mr-auto flex items-center gap-[14px]">
          <LogoMark className="h-[26px] w-[33px] text-museo-tinta" />
          <span className="leading-[1.05]">
            <span className="block font-display text-[21px] tracking-[-0.01em] text-museo-tinta">
              Culow &amp; Pililarge
            </span>
            <span className="cartela block text-museo-tinta-45">Colección permanente</span>
          </span>
        </a>

        <nav className="hidden items-center gap-[26px] lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="cartela text-museo-tinta-70 transition-colors hover:text-museo-laton"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={socials.youtube}
          target="_blank"
          rel="noopener"
          className="hidden rounded-[2px] bg-museo-tinta px-[18px] py-[10px] text-[13px] font-medium text-museo-papel transition-colors hover:bg-museo-laton sm:inline-block"
        >
          Suscribirse
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar el plano" : "Ver el plano de salas"}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-[2px] border border-museo-linea text-museo-tinta lg:hidden"
        >
          <span className="grid gap-[4px]">
            <span className={`block h-px w-[15px] bg-current transition-transform ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`block h-px w-[15px] bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-[15px] bg-current transition-transform ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-museo-linea-fina px-6 pb-5 pt-3 lg:hidden">
          <div className="cartela mb-3 text-museo-tinta-45">Plano de salas</div>
          <div className="grid">
            {nav.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-museo-linea-fina py-[11px] text-[16px] text-museo-tinta"
              >
                <span className="cartela w-6 text-museo-laton">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
