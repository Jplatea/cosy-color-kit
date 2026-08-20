import { useCallback, useEffect, useRef, useState } from "react";

/*
  Los únicos colores del sitio que no cambian de día a noche.

  Todo lo demás usa las variables de la sala, y aquí eso salía mal: de noche
  `tinta` es el color claro, así que el fondo del visor se volvía crema y abrir
  una foto era un fogonazo blanco con las luces bajadas. Justo lo contrario de
  lo que uno quiere.

  Así que el visor tiene su propia paleta, fija: telón oscuro y montura clara.
  Es además lo que le conviene a la mercancía —las maquetas de Printful están
  fotografiadas sobre blanco, y sobre una montura oscura se recortarían mal— y
  es lo que hace cualquier sala cuando ilumina una pieza: baja el resto.
*/
const TELON = "rgb(17 15 13 / 0.95)";
const MONTURA = "rgb(244 241 234)";
const CLARO = (alfa = 1) => `rgb(244 241 234 / ${alfa})`;
const BRILLO = "rgb(201 162 84)";

/**
 * La galería de una pieza de la tienda, a pantalla completa.
 *
 * En la rejilla las fotos caben a 230 px de alto, que sirve para reconocer el
 * producto y para poco más: el bordado del pecho es una mancha de dos
 * milímetros. Quien está a punto de gastarse cincuenta euros quiere verlo
 * grande, y esto es lo que hace — se abre encima, con las luces bajadas, como
 * cuando en un museo te acercas a la pieza.
 *
 * Se maneja con el teclado entero: flechas para pasar, Esc para salir. Y al
 * cerrar devuelve el foco al sitio desde el que se abrió, que si no quien va
 * con teclado aparece al principio de la página sin saber por qué.
 */

type Props = {
  fotos: string[];
  nombre: string;
  /** Por cuál se abre: la que estuviera mirando en la tarjeta. */
  inicial?: number;
  /** Por dónde va, para que la tarjeta de debajo se quede en la misma foto. */
  onIndice?: (i: number) => void;
  onClose: () => void;
};

export function Galeria({ fotos, nombre, inicial = 0, onIndice, onClose }: Props) {
  const [i, setI] = useState(Math.min(Math.max(inicial, 0), fotos.length - 1));

  /*
    El aviso al padre va por referencia y el efecto solo depende de `i`.

    Si dependiera de la función, como quien la pasa la escribe en línea y cambia
    de identidad en cada render, el efecto se dispararía siempre: avisaría al
    padre, el padre se repintaría, llegaría otra función nueva, y vuelta a
    empezar. Un bucle infinito por una lista de dependencias mal puesta.
  */
  const avisar = useRef(onIndice);
  avisar.current = onIndice;
  useEffect(() => {
    avisar.current?.(i);
  }, [i]);
  const cerrar = useRef<HTMLButtonElement>(null);
  /** Desde dónde se abrió, para devolverle el foco al salir. */
  const previo = useRef<Element | null>(null);

  const mover = useCallback(
    (paso: number) => setI((n) => (n + paso + fotos.length) % fotos.length),
    [fotos.length]
  );

  useEffect(() => {
    previo.current = document.activeElement;
    cerrar.current?.focus();

    // Sin esto la página de detrás sigue haciendo scroll mientras miras la
    // foto, que es de las cosas que más despistan de un visor.
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const teclado = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
      else if (ev.key === "ArrowRight") mover(1);
      else if (ev.key === "ArrowLeft") mover(-1);
      else return;
      ev.preventDefault();
    };
    window.addEventListener("keydown", teclado);

    return () => {
      window.removeEventListener("keydown", teclado);
      document.body.style.overflow = antes;
      (previo.current as HTMLElement | null)?.focus?.();
    };
  }, [mover, onClose]);

  if (!fotos.length) return null;
  const varias = fotos.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${nombre}`}
      // El fondo cierra, pero solo si el clic empieza y acaba en él: sin esa
      // condición, arrastrar el ratón desde la foto hacia fuera cerraba el
      // visor sin querer.
      onPointerDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 sm:p-8"
      style={{ background: TELON, backdropFilter: "blur(6px)" }}
    >
      <div className="flex w-full max-w-[900px] items-center justify-between gap-4">
        <p className="cartela" style={{ color: CLARO(0.72) }}>
          {nombre}
          {varias && (
            <span style={{ color: BRILLO }}>
              {"  ·  "}
              {i + 1} / {fotos.length}
            </span>
          )}
        </p>
        <button
          ref={cerrar}
          type="button"
          onClick={onClose}
          aria-label="Cerrar las fotos"
          className="shrink-0 border px-[14px] py-[7px] text-[13px] transition-colors"
          style={{ borderColor: CLARO(0.4), color: CLARO(0.86) }}
          onMouseEnter={(ev) => {
            ev.currentTarget.style.background = MONTURA;
            ev.currentTarget.style.color = TELON;
          }}
          onMouseLeave={(ev) => {
            ev.currentTarget.style.background = "transparent";
            ev.currentTarget.style.color = CLARO(0.86);
          }}
        >
          Cerrar ✕
        </button>
      </div>

      <div className="flex w-full max-w-[900px] flex-1 items-center gap-2 sm:gap-4">
        {varias && <Flecha hacia={-1} onClick={() => mover(-1)} />}
        <div
          className="flex min-h-0 flex-1 items-center justify-center rounded-[3px] p-3 sm:p-6"
          style={{ background: MONTURA }}
        >
          <img
            key={fotos[i]}
            src={fotos[i]}
            alt={`${nombre}, vista ${i + 1} de ${fotos.length}`}
            className="max-h-full min-h-0 w-auto max-w-full object-contain"
          />
        </div>
        {varias && <Flecha hacia={1} onClick={() => mover(1)} />}
      </div>

      {varias && (
        <div className="flex max-w-full flex-wrap justify-center gap-2 overflow-x-auto">
          {fotos.map((url, n) => (
            <button
              key={url}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Ver la vista ${n + 1}`}
              aria-pressed={n === i}
              className="h-[52px] w-[52px] shrink-0 border p-[3px] transition-colors"
              style={{
                background: MONTURA,
                borderColor: n === i ? BRILLO : CLARO(0.28),
              }}
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Flecha({ hacia, onClick }: { hacia: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hacia === 1 ? "Foto siguiente" : "Foto anterior"}
      className="shrink-0 self-center border px-[10px] py-[14px] text-[18px] leading-none transition-colors"
      style={{ borderColor: CLARO(0.3), color: CLARO(0.86) }}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.background = MONTURA;
        ev.currentTarget.style.color = TELON;
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.background = "transparent";
        ev.currentTarget.style.color = CLARO(0.86);
      }}
    >
      {hacia === 1 ? "›" : "‹"}
    </button>
  );
}
