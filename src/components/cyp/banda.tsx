import { useState } from "react";
import { Chip } from "./primitives";
import { tinta } from "@/lib/color";
import type { ColorPrenda } from "@/config/tienda";

/**
 * Una banda de la ficha: etiqueta arriba, opciones debajo, altura fija.
 *
 * La rejilla de la tienda solo se ve ordenada si la talla de una tarjeta está
 * a la misma altura que la talla de la de al lado. Eso obliga a dos cosas que
 * no son evidentes:
 *
 *  · **La banda existe aunque no haya nada que elegir.** Una bolsa tiene una
 *    sola talla y una sudadera siete, pero las dos reservan el mismo alto. Ese
 *    hueco no se deja en blanco: si solo hay una opción se escribe —«Única»,
 *    «Amarillo»—, que además es información que antes no se daba.
 *  · **Las opciones caben en una línea.** Nueve tallas no entran, y dejarlas
 *    envolver devolvería el desorden que esto viene a arreglar. Se enseñan las
 *    que caben y el resto se guarda tras un «+3».
 *
 * Al pulsar el «+3» las demás aparecen **encima**, flotando, no empujando: si
 * empujaran, la tarjeta crecería y volveríamos al principio.
 */

const ALTO_BANDA = "min-h-[62px]";

function Etiqueta({ children, valor }: { children: React.ReactNode; valor?: string }) {
  return (
    <span className="cartela text-museo-tinta-tenue">
      {children}
      {valor && <span className="ml-2 text-museo-tinta-suave">{valor}</span>}
    </span>
  );
}

/**
 * La fila de opciones, siempre del mismo alto.
 *
 * Una pastilla mide 26 píxeles y un texto suelto unos 21. Esos cinco de
 * diferencia bastaban para que la banda de color de una tarjeta quedara por
 * encima de la de al lado. Con el alto fijo da igual lo que lleve dentro.
 */
const FILA = "flex h-[28px] items-center gap-[7px]";

/** Lo que se enseña cuando no hay nada que elegir: el único valor, escrito. */
function Unico({ children }: { children: React.ReactNode }) {
  return (
    <div className={FILA}>
      <span className="text-[14px] text-museo-tinta-suave">{children}</span>
    </div>
  );
}

export function BandaTallas({
  tallas,
  activa,
  onElegir,
  nombreDe,
  visibles = 6,
}: {
  tallas: string[];
  activa: string;
  onElegir: (t: string) => void;
  nombreDe: (t: string) => string;
  visibles?: number;
}) {
  const [abierta, setAbierta] = useState(false);

  if (tallas.length < 2) {
    return (
      <div className={`grid content-start gap-[8px] ${ALTO_BANDA}`}>
        <Etiqueta>Talla</Etiqueta>
        <Unico>{tallas.length ? nombreDe(tallas[0]) : "Única"}</Unico>
      </div>
    );
  }

  // La elegida va siempre en la parte visible, aunque esté la decimoquinta:
  // ver «5XL» seleccionada y no encontrarla en la fila desconcierta.
  const delante = tallas.slice(0, visibles);
  const detras = tallas.slice(visibles);
  const primeras = detras.includes(activa)
    ? [...delante.slice(0, visibles - 1), activa]
    : delante;
  const resto = tallas.filter((t) => !primeras.includes(t));

  return (
    <div className={`relative grid content-start gap-[8px] ${ALTO_BANDA}`}>
      <Etiqueta valor={nombreDe(activa)}>Talla</Etiqueta>
      <div className={FILA}>
        {primeras.map((t) => (
          <Chip key={t} active={activa === t} onClick={() => onElegir(t)}>
            {nombreDe(t)}
          </Chip>
        ))}
        {resto.length > 0 && (
          <button
            type="button"
            onClick={() => setAbierta((v) => !v)}
            aria-expanded={abierta}
            aria-label={abierta ? "Ocultar las demás tallas" : `Ver ${resto.length} tallas más`}
            className="rounded-[2px] border px-[9px] text-[13px] leading-[26px] text-museo-tinta-suave transition-colors hover:border-museo-tinta hover:text-museo-tinta"
            style={{ borderColor: tinta(0.22) }}
          >
            {abierta ? "−" : `+${resto.length}`}
          </button>
        )}
      </div>

      {abierta && resto.length > 0 && (
        <div
          className="absolute left-0 top-full z-20 flex flex-wrap gap-[7px] rounded-[3px] border border-museo-linea bg-museo-papel p-[10px] shadow-[0_10px_28px_rgb(var(--cyp-tinta)/0.16)]"
          style={{ minWidth: "min(100%, 240px)" }}
        >
          {resto.map((t) => (
            <Chip
              key={t}
              active={activa === t}
              onClick={() => {
                onElegir(t);
                setAbierta(false);
              }}
            >
              {nombreDe(t)}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

export function BandaColores({
  colores,
  activo,
  onElegir,
}: {
  colores: ColorPrenda[];
  activo: string;
  onElegir: (id: string) => void;
}) {
  const puesto = colores.find((c) => c.id === activo) ?? colores[0];

  if (colores.length < 2) {
    return (
      <div className={`grid content-start gap-[8px] ${ALTO_BANDA}`}>
        <Etiqueta>Color</Etiqueta>
        <Unico>{puesto?.nombre ?? "Único"}</Unico>
      </div>
    );
  }

  return (
    <div className={`grid content-start gap-[8px] ${ALTO_BANDA}`}>
      <Etiqueta valor={puesto.nombre}>Color</Etiqueta>
      {/*
        Muestras del tejido, no nombres: «Bottle green» no le dice nada a nadie
        hasta que lo ve, y el hexadecimal lo da la imprenta. El nombre se lee
        arriba, junto a la etiqueta, para quien navegue con lector de pantalla
        o no distinga bien los tonos.
      */}
      <div className={`${FILA} gap-[10px]`}>
        {colores.map((c) => {
          const elegido = c.id === activo;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onElegir(c.id)}
              title={c.nombre}
              aria-label={c.nombre}
              aria-pressed={elegido}
              className="h-[26px] w-[26px] shrink-0 rounded-full border transition-transform hover:scale-110"
              style={{
                background: c.tela,
                borderColor: elegido ? tinta() : tinta(0.22),
                // El anillo despega la pastilla blanca del papel, que si no
                // parece un agujero en la tarjeta.
                boxShadow: elegido
                  ? `0 0 0 3px rgb(var(--cyp-papel)), 0 0 0 4px ${tinta()}`
                  : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
