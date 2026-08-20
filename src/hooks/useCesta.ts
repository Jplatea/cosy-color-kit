import { useCallback, useEffect, useState } from "react";
import type { DisenoId } from "@/components/cyp/disenos";
import { ENVIO, PRODUCTOS, claveVariante, precioDe, type TallaId } from "@/config/tienda";

/**
 * La cesta.
 *
 * Vive en el navegador y no en ningún servidor: hasta que alguien pulsa pagar,
 * aquí no hay nada que guardar de nadie. Lo que se apunta es lo mínimo —qué
 * producto, en qué color, talla y estampado—; el precio y el nombre se vuelven
 * a leer del catálogo cada vez que se pinta.
 *
 * Eso último es a propósito: si el precio viajara dentro de la cesta, quien
 * dejara la pestaña abierta una semana compraría a precio de la semana pasada,
 * y encima habría dos sitios que dicen cuánto cuesta una camiseta. Manda el
 * catálogo, siempre.
 */

export type Linea = {
  producto: string;
  color: string;
  talla: TallaId;
  diseno: DisenoId;
  cantidad: number;
};

const CLAVE = "cyp:cesta";

/** Dos líneas son la misma si coinciden en todo menos en la cantidad. */
const mismaLinea = (a: Linea, b: Linea) =>
  a.producto === b.producto && a.color === b.color && a.talla === b.talla && a.diseno === b.diseno;

function leer(): Linea[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    if (!Array.isArray(v)) return [];
    // Se descarta lo que ya no exista en el catálogo: un producto retirado no
    // puede quedarse en la cesta de quien lo tenía abierto.
    return (v as Linea[]).filter(
      (l) =>
        l &&
        typeof l.cantidad === "number" &&
        l.cantidad > 0 &&
        PRODUCTOS.some((p) => p.id === l.producto)
    );
  } catch {
    return [];
  }
}

export function useCesta() {
  const [lineas, setLineas] = useState<Linea[]>([]);

  useEffect(() => setLineas(leer()), []);

  const guardar = useCallback((siguiente: Linea[]) => {
    setLineas(siguiente);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(siguiente));
    } catch {
      /* sin almacenamiento la cesta vale para esta visita */
    }
  }, []);

  const anadir = useCallback(
    (linea: Linea) => {
      const actual = leer();
      const i = actual.findIndex((l) => mismaLinea(l, linea));
      if (i >= 0) {
        actual[i] = { ...actual[i], cantidad: actual[i].cantidad + linea.cantidad };
        guardar([...actual]);
      } else {
        guardar([...actual, linea]);
      }
    },
    [guardar]
  );

  const cambiarCantidad = useCallback(
    (linea: Linea, cantidad: number) => {
      const actual = leer();
      const siguiente = actual
        .map((l) => (mismaLinea(l, linea) ? { ...l, cantidad } : l))
        .filter((l) => l.cantidad > 0);
      guardar(siguiente);
    },
    [guardar]
  );

  const quitar = useCallback(
    (linea: Linea) => guardar(leer().filter((l) => !mismaLinea(l, linea))),
    [guardar]
  );

  const vaciar = useCallback(() => guardar([]), [guardar]);

  const detalle = lineas.map((l) => {
    const producto = PRODUCTOS.find((p) => p.id === l.producto)!;
    const variante = producto.variantes[claveVariante(l.color, l.talla, l.diseno)];
    // El precio va por variante: una 5XL no cuesta lo mismo que una S.
    const unidad = precioDe(producto, l.color, l.talla, l.diseno);
    return { linea: l, producto, variante, unidad, importe: unidad * l.cantidad };
  });

  const unidades = detalle.reduce((n, d) => n + d.linea.cantidad, 0);
  const subtotal = detalle.reduce((n, d) => n + d.importe, 0);
  const envio = subtotal === 0 || subtotal >= ENVIO.gratisDesde ? 0 : ENVIO.precio;
  const total = subtotal + envio;
  /** Qué hay en la cesta que la imprenta todavía no sabe fabricar. */
  const sinVariante = detalle.filter((d) => !d.variante);

  return {
    lineas,
    detalle,
    unidades,
    subtotal,
    envio,
    total,
    sinVariante,
    anadir,
    cambiarCantidad,
    quitar,
    vaciar,
  };
}
