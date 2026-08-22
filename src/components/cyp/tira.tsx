import { useEffect, useRef, useState } from "react";
import { tinta } from "@/lib/color";

/**
 * Las miniaturas de un producto, en una sola línea que se desliza.
 *
 * Antes se envolvían en varias filas, y eso tenía un efecto feo: una prenda
 * con diez maquetas empujaba su tarjeta dos filas más abajo que la de al lado,
 * y la rejilla quedaba a distintas alturas. En una línea todas las tarjetas
 * miden lo mismo, se enseñen tres fotos o doce.
 *
 * El problema de una línea que se desliza es que **no se ve que se desliza**.
 * Aquí se resuelve con un degradado en cada borde que solo aparece cuando de
 * verdad queda algo por ese lado: si asoma sombra a la derecha, hay más fotos
 * a la derecha. Y como un degradado no se puede pulsar, va acompañado de dos
 * flechas —que además son lo único que puede usar quien no tenga rueda ni
 * pantalla táctil.
 */

type Props = {
  fotos: string[];
  activa: number;
  onElegir: (i: number) => void;
  nombre: string;
};

export function Tira({ fotos, activa, onElegir, nombre }: Props) {
  const carril = useRef<HTMLDivElement>(null);
  const [bordes, setBordes] = useState({ izquierda: false, derecha: false });

  const mirar = () => {
    const el = carril.current;
    if (!el) return;
    // El margen de dos píxeles evita que el redondeo del navegador deje una
    // sombra encendida cuando ya se ha llegado al final.
    setBordes({
      izquierda: el.scrollLeft > 2,
      derecha: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  };

  useEffect(() => {
    mirar();
    const el = carril.current;
    if (!el) return;
    // El ancho cambia al redimensionar la ventana y también al cambiar de
    // color, que altera cuántas fotos hay.
    const observador = new ResizeObserver(mirar);
    observador.observe(el);
    return () => observador.disconnect();
  }, [fotos.length]);

  /** Al elegir una foto se la trae a la vista, que puede estar fuera del carril. */
  useEffect(() => {
    const el = carril.current;
    const hijo = el?.children[activa] as HTMLElement | undefined;
    hijo?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [activa]);

  const deslizar = (hacia: 1 | -1) =>
    carril.current?.scrollBy({ left: hacia * 180, behavior: "smooth" });

  if (fotos.length < 2) return null;

  return (
    <div className="relative mt-2">
      <div
        ref={carril}
        onScroll={mirar}
        className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => onElegir(i)}
            aria-label={`Vista ${i + 1} de ${nombre}`}
            aria-pressed={activa === i}
            className="h-[54px] w-[54px] shrink-0 border bg-museo-peana p-[3px] transition-colors"
            style={{ borderColor: activa === i ? tinta() : tinta(0.16) }}
          >
            <img src={url} alt="" loading="lazy" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>

      {(["izquierda", "derecha"] as const).map((lado) => {
        const hay = bordes[lado];
        return (
          <div
            key={lado}
            className={`pointer-events-none absolute inset-y-0 flex w-14 items-center transition-opacity duration-200 ${
              lado === "izquierda" ? "left-0 justify-start" : "right-0 justify-end"
            } ${hay ? "opacity-100" : "opacity-0"}`}
            style={{
              background: `linear-gradient(to ${lado === "izquierda" ? "right" : "left"}, rgb(var(--cyp-pared)), rgb(var(--cyp-pared) / 0))`,
            }}
          >
            <button
              type="button"
              onClick={() => deslizar(lado === "izquierda" ? -1 : 1)}
              aria-label={lado === "izquierda" ? "Ver fotos anteriores" : "Ver más fotos"}
              tabIndex={hay ? 0 : -1}
              className={`pointer-events-auto grid h-[26px] w-[26px] place-items-center rounded-full border border-museo-linea bg-museo-papel text-[13px] leading-none text-museo-tinta shadow-[0_1px_4px_rgb(var(--cyp-tinta)/0.15)] transition-colors hover:bg-museo-tinta hover:text-museo-papel ${
                hay ? "" : "invisible"
              }`}
            >
              {lado === "izquierda" ? "‹" : "›"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
