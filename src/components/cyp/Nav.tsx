import { useEffect, useRef, useState } from "react";
import { Interruptor } from "./Interruptor";
import { LogoMark } from "./Logo";
import { useLuces } from "@/hooks/useLuces";
import { nav, socials } from "@/config/cyp";

/**
 * La cabecera del museo.
 *
 * Arriba del todo, una línea de horario y entrada como la de cualquier
 * institución seria; debajo, el rótulo y el acceso a las salas. Cuando se baja,
 * la línea de arriba desaparece y solo queda el rótulo pegado, para no robarle
 * sitio a la sala que se esté mirando.
 *
 * Las salas van dentro de un desplegable y no en fila. Eran siete enlaces
 * seguidos compitiendo entre ellos, y en una cabecera donde todo pesa lo mismo
 * no destaca nada. Guardados, queda sitio para lo único que hay que ver: la
 * tienda.
 */

/** La tienda sale del listado: tiene su propio botón y estaría dos veces. */
const ES_TIENDA = (href: string) => href === "#tienda";
const SALAS = nav.filter((item) => !ES_TIENDA(item.href));
const TIENDA = nav.find((item) => ES_TIENDA(item.href));

/**
 * El botón de la tienda: una placa de latón.
 *
 * Es lo único de la web que se vende, así que es lo único que se pinta con el
 * color de acento. El texto va en `papel`, que suena raro sobre dorado hasta
 * que uno cae en que los dos colores giran juntos al bajar las luces: de día
 * el latón es oscuro y el papel crema, de noche al revés. Sale legible en los
 * dos sin escribir ninguna excepción.
 *
 * El brillo que cruza al pasar por encima es un reflejo, no una animación de
 * adorno: una placa de metal hace eso cuando la giras hacia la luz.
 */
function BotonTienda({ compacto = false }: { compacto?: boolean }) {
  if (!TIENDA) return null;
  return (
    <a
      href={TIENDA.href}
      className={`group relative overflow-hidden rounded-[2px] bg-museo-laton font-medium text-museo-papel shadow-[0_1px_0_rgb(var(--cyp-tinta)/0.25)] transition-transform duration-200 hover:-translate-y-px ${
        compacto ? "px-[13px] py-[8px] text-[12px]" : "px-[20px] py-[10px] text-[13px]"
      }`}
    >
      {/*
        Una veladura de tinta encima del latón.

        Es de contraste antes que de estética: el latón de día con el texto en
        papel se quedaba en 4,49 sobre 1, un pelo por debajo del mínimo legible.
        Y funciona en los dos modos sin excepciones, porque la tinta gira con la
        sala: de día oscurece el dorado y de noche lo aclara, que es justo lo
        que hace falta en cada caso. De paso le da el fondo desigual de una
        placa de metal en vez de un rectángulo de color plano.
      */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-museo-tinta/[0.16]" />
      <span className="relative z-10 tracking-[0.02em]">{TIENDA.label}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-museo-papel/30 transition-[left] duration-500 ease-out group-hover:left-[150%]"
      />
    </a>
  );
}

export function Nav() {
  const { esDeNoche } = useLuces();
  const [abierto, setAbierto] = useState(false);
  const [salas, setSalas] = useState(false);
  const [bajado, setBajado] = useState(false);
  const desplegable = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setBajado(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Un desplegable que no se cierra al pinchar fuera se queda ahí molestando. */
  useEffect(() => {
    if (!salas) return;
    const fuera = (ev: MouseEvent) => {
      if (!desplegable.current?.contains(ev.target as Node)) setSalas(false);
    };
    const escape = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setSalas(false);
    };
    document.addEventListener("mousedown", fuera);
    window.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      window.removeEventListener("keydown", escape);
    };
  }, [salas]);

  return (
    <header className="sticky top-0 z-[60] border-b border-museo-linea bg-museo-papel/90 backdrop-blur-[10px]">
      {/* Banda de horario: lo primero que se lee en la puerta de un museo. */}
      <div
        className={`overflow-hidden border-b border-museo-linea-fina transition-[max-height,opacity] duration-300 ${
          bajado ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-[9px] lg:px-8">
          <span className="cartela text-museo-tinta-tenue">
            Abierto todos los días · Entrada gratuita
          </span>
          <span className="cartela hidden text-museo-tinta-tenue sm:block">
            {esDeNoche ? "Luces bajadas · Prohibido tocar (se puede)" : "Prohibido tocar las piezas (se puede)"}
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-6 py-[14px] sm:gap-5 lg:px-8">
        <a href="#inicio" className="mr-auto flex items-center gap-[14px]">
          <LogoMark className="h-[26px] w-[33px] text-museo-tinta" />
          {/*
            Las dos líneas, con sitio para la cola de la «g».

            Iban con `leading-[1.05]`, y a ese interlineado la caja del nombre
            acaba justo donde empieza la cartela: cero píxeles de hueco. La
            letra no cabe en su caja —la «g» de Pililarge baja por debajo— así
            que su cola se metía dentro de «Colección permanente» y se veía
            pisado. Es de las cosas que solo se notan con esa palabra concreta,
            porque es la única con descendente.

            Se arregla con interlineado normal y un hueco explícito, no
            estirando el interlineado a ojo: así el espacio entre las dos
            líneas es un número que se ve en el código y no el resto de una
            resta entre la caja de la fuente y su altura.
          */}
          <span className="grid gap-[3px]">
            <span className="block font-display text-[19px] leading-[1.16] tracking-[-0.01em] text-museo-tinta sm:text-[21px]">
              Culow &amp; Pililarge
            </span>
            <span className="cartela block leading-[1.2] text-museo-tinta-tenue">
              Colección permanente
            </span>
          </span>
        </a>

        {/* El plano de salas, guardado en un cajón. */}
        <div ref={desplegable} className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setSalas((v) => !v)}
            aria-expanded={salas}
            className="cartela flex items-center gap-[7px] rounded-[2px] border border-museo-linea px-[14px] py-[9px] text-museo-tinta-suave transition-colors hover:border-museo-tinta hover:text-museo-tinta"
          >
            Salas
            <span
              aria-hidden
              className={`text-[9px] transition-transform duration-200 ${salas ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {salas && (
            <div className="absolute right-0 top-[calc(100%+9px)] w-[260px] rounded-[3px] border border-museo-linea bg-museo-papel p-[6px] shadow-[0_12px_34px_rgb(var(--cyp-tinta)/0.14)]">
              {SALAS.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setSalas(false)}
                  className="flex items-baseline gap-3 rounded-[2px] px-[12px] py-[9px] text-[14px] text-museo-tinta transition-colors hover:bg-museo-peana"
                >
                  <span className="cartela w-5 shrink-0 text-museo-laton">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <BotonTienda />

        <Interruptor />

        <a
          href={socials.youtube}
          target="_blank"
          rel="noopener"
          className="hidden rounded-[2px] border border-museo-tinta px-[16px] py-[9px] text-[13px] font-medium text-museo-tinta transition-colors hover:bg-museo-tinta hover:text-museo-papel lg:inline-block"
        >
          Suscribirse
        </a>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? "Cerrar el plano" : "Ver el plano de salas"}
          aria-expanded={abierto}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[2px] border border-museo-linea text-museo-tinta lg:hidden"
        >
          <span className="grid gap-[4px]">
            <span className={`block h-px w-[15px] bg-current transition-transform ${abierto ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`block h-px w-[15px] bg-current transition-opacity ${abierto ? "opacity-0" : ""}`} />
            <span className={`block h-px w-[15px] bg-current transition-transform ${abierto ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {abierto && (
        <div className="border-t border-museo-linea-fina px-6 pb-5 pt-3 lg:hidden">
          <div className="cartela mb-3 text-museo-tinta-tenue">Plano de salas</div>
          <div className="grid">
            {SALAS.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setAbierto(false)}
                className="flex items-baseline gap-4 border-b border-museo-linea-fina py-[11px] text-[16px] text-museo-tinta"
              >
                <span className="cartela w-6 text-museo-laton">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            ))}
          </div>
          <a
            href={socials.youtube}
            target="_blank"
            rel="noopener"
            className="mt-4 block rounded-[2px] border border-museo-tinta py-[11px] text-center text-[14px] font-medium text-museo-tinta"
          >
            Suscribirse en YouTube
          </a>
        </div>
      )}
    </header>
  );
}
