import { useState } from "react";
import { Chip, GoldButton, Peana, Sala, SectionTitle } from "./primitives";
import { Prenda } from "./prendas";
import { Galeria } from "./galeria";
import { DISENOS, type DisenoId } from "./disenos";
import { useCesta } from "@/hooks/useCesta";
import { tinta } from "@/lib/color";
import {
  ENVIO,
  NOMBRE_TALLA,
  PRODUCTOS,
  hayImprenta,
  claveVariante,
  euros,
  precioDe,
  type Producto,
  type TallaId,
} from "@/config/tienda";

/**
 * Sala 6: la tienda del museo.
 *
 * Toda tienda de museo vende la broma de la exposición impresa en algo. Esta
 * también, y el catálogo se dibuja entero: cada prenda es una silueta en SVG
 * con el estampado encima, así que lo que se ve en pantalla es exactamente el
 * diseño que se manda a imprimir, no la foto de un modelo de un proveedor.
 *
 * Lo que se pide se fabrica y se envía por encargo —nadie guarda cajas de
 * camisetas en su casa—, y hasta que la imprenta no sabe fabricar una
 * combinación concreta, esa combinación no se puede pagar. Es mejor decir que
 * algo no está listo que cobrarlo y no poder mandarlo.
 */

/** Estado del mostrador: qué se está configurando ahora mismo. */
type Eleccion = { color: string; talla: TallaId; diseno: DisenoId };

const porDefecto = (p: Producto): Eleccion => ({
  color: p.colores[0].id,
  talla: p.tallas.includes("M") ? "M" : p.tallas[0],
  diseno: p.disenos[0],
});

export function Tienda() {
  /** Qué foto de la galería se está mirando, por producto. */
  const [foto, setFoto] = useState<Record<string, number>>({});
  /** Qué producto se está mirando a pantalla completa, y por qué foto. */
  const [lupa, setLupa] = useState<{ id: string; i: number } | null>(null);
  const [eleccion, setEleccion] = useState<Record<string, Eleccion>>({});
  const [estado, setEstado] = useState<"quieto" | "yendo" | "cerrada" | "error">("quieto");
  const cesta = useCesta();

  const elegido = (p: Producto) => eleccion[p.id] ?? porDefecto(p);
  const cambiar = (p: Producto, cambio: Partial<Eleccion>) =>
    setEleccion((e) => ({ ...e, [p.id]: { ...elegido(p), ...cambio } }));

  const pagar = async () => {
    setEstado("yendo");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lineas: cesta.detalle.map((d) => ({
            variante: d.variante,
            cantidad: d.linea.cantidad,
            producto: d.producto.id,
            color: d.linea.color,
            talla: d.linea.talla,
            diseno: d.linea.diseno,
          })),
        }),
      });
      // 503 = la función existe pero no hay clave de cobro. 404 = todavía no
      // hay función (en local, o antes de desplegarla). Las dos cosas son lo
      // mismo para quien mira: la tienda no está abierta.
      if (res.status === 503 || res.status === 404) {
        setEstado("cerrada");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = await res.json();
      if (!url) throw new Error("sin url de pago");
      window.location.href = url;
    } catch {
      setEstado("error");
    }
  };

  return (
    <section id="tienda" className="bg-museo-pared px-6 py-[86px] lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-museo-linea pb-8">
          <div>
            <Sala n="06">Tienda del museo</Sala>
            <SectionTitle className="mt-4">
              Llévese la broma <span className="italic text-museo-tinta-suave">puesta</span>
            </SectionTitle>
            <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-museo-tinta-suave">
              Lo único de aquí que sí se vende. Se fabrica por encargo cuando alguien lo pide,
              así que no hay stock, no hay saldos y no sobra nada.
            </p>
            {!hayImprenta && (
              <p className="cartela mt-4 text-museo-laton">
                Escaparate de muestra · La imprenta todavía no está conectada
              </p>
            )}
          </div>
          {cesta.unidades > 0 && (
            <a
              href="#cesta"
              className="border border-museo-tinta px-[16px] py-[11px] text-[14px] text-museo-tinta transition-colors hover:bg-museo-tinta hover:text-museo-papel"
            >
              Cesta · {cesta.unidades} {cesta.unidades === 1 ? "pieza" : "piezas"} ·{" "}
              {euros(cesta.total)}
            </a>
          )}
        </div>

        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTOS.map((p) => {
            const e = elegido(p);
            const color = p.colores.find((c) => c.id === e.color) ?? p.colores[0];
            const diseno = DISENOS[e.diseno];
            const variante = p.variantes[claveVariante(e.color, e.talla, e.diseno)];

            return (
              <article key={p.id} className="flex flex-col">
                {/*
                  Las fotos de Printful mandan sobre el dibujo: son la imagen
                  real de lo que se recibe, y en una tienda eso pesa más que la
                  coherencia del estilo. El dibujo se queda de reserva para lo
                  que aún no tenga foto.
                */}
                <Peana className="rounded-[3px] border border-museo-linea p-4">
                  {p.fotos.length ? (
                    /*
                      La foto abre la galería a pantalla completa. A 230 px de
                      alto el bordado del pecho es una mancha; quien va a
                      gastarse cincuenta euros quiere verlo de cerca.
                    */
                    <button
                      type="button"
                      onClick={() => setLupa({ id: p.id, i: Math.min(foto[p.id] ?? 0, p.fotos.length - 1) })}
                      className="block w-full cursor-zoom-in"
                      aria-label={`Ver ${p.fotos.length === 1 ? "la foto" : `las ${p.fotos.length} fotos`} de ${p.nombre}`}
                    >
                      <img
                        src={p.fotos[Math.min(foto[p.id] ?? 0, p.fotos.length - 1)]}
                        alt={`${p.nombre} en ${color.nombre}`}
                        loading="lazy"
                        className="h-[230px] w-full object-contain transition-transform duration-300 hover:scale-[1.03]"
                      />
                    </button>
                  ) : (
                    <Prenda
                      prenda={p.prenda}
                      color={color.tela}
                      sombra={color.sombra}
                      titulo={`${p.nombre} en ${color.nombre}, con el estampado «${diseno.nombre}»`}
                      className="h-[230px] w-full"
                      estampado={(z) => diseno.dibujar(z, color.tinta)}
                    />
                  )}
                </Peana>

                {/*
                  Las demás vistas, debajo. Con una sola no hay nada que elegir.
                  Se envuelven en varias filas porque de un producto puede haber
                  una docena de maquetas y en una sola fila se saldrían.
                */}
                {p.fotos.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.fotos.map((url, i) => {
                      const activa = (foto[p.id] ?? 0) === i;
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setFoto((v) => ({ ...v, [p.id]: i }))}
                          aria-label={`Vista ${i + 1} de ${p.nombre}`}
                          aria-pressed={activa}
                          className="h-[54px] w-[54px] shrink-0 border bg-museo-peana p-[3px] transition-colors"
                          style={{ borderColor: activa ? tinta() : tinta(0.16) }}
                        >
                          <img
                            src={url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 flex-1 border-t border-museo-tinta pt-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-[22px] leading-tight text-museo-tinta">
                      {p.nombre}
                    </h3>
                    {/* En latón: es el dato que se busca de un vistazo. */}
                    <span className="shrink-0 font-display text-[21px] text-museo-laton">
                      {euros(precioDe(p, e.color, e.talla, e.diseno))}
                    </span>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-[1.55] text-museo-tinta-suave">{p.ficha}</p>
                </div>

                {/*
                  Los selectores van a la vista, sin desplegable.
                  Antes estaban detrás de un botón «Elegir y añadir», y aunque
                  funcionaban no los encontraba nadie: la talla es lo único que
                  hay que decidir aquí, así que esconderla era esconder la
                  compra entera.

                  Estampado y color vienen dados por el producto de Printful
                  —cada uno es un diseño sobre un tejido concreto—, así que solo
                  aparecen si de verdad hay entre qué elegir. Ofrecer una opción
                  única es pedir que elijan entre una cosa, y encima sugiere que
                  cambiarla cambia lo que se fabrica.
                */}
                <div className="mt-4 grid gap-[14px]">
                  {p.tallas.length > 1 && (
                    <div className="grid gap-[8px]">
                      <span className="cartela text-museo-tinta-tenue">Talla</span>
                      <div className="flex flex-wrap gap-[7px]">
                        {p.tallas.map((tl) => (
                          <Chip
                            key={tl}
                            active={e.talla === tl}
                            onClick={() => cambiar(p, { talla: tl })}
                          >
                            {NOMBRE_TALLA(tl)}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.colores.length > 1 && (
                    <div className="grid gap-[8px]">
                      <span className="cartela text-museo-tinta-tenue">Color</span>
                      <div className="flex flex-wrap gap-[7px]">
                        {p.colores.map((c) => (
                          <Chip
                            key={c.id}
                            active={e.color === c.id}
                            onClick={() => cambiar(p, { color: c.id })}
                          >
                            {c.nombre}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.disenos.length > 1 && (
                    <div className="grid gap-[8px]">
                      <span className="cartela text-museo-tinta-tenue">Estampado</span>
                      <div className="flex flex-wrap gap-[7px]">
                        {p.disenos.map((d) => (
                          <Chip
                            key={d}
                            active={e.diseno === d}
                            onClick={() => cambiar(p, { diseno: d })}
                          >
                            {DISENOS[d].nombre}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  <GoldButton
                    onClick={() => cesta.anadir({ producto: p.id, ...e, cantidad: 1 })}
                    className="w-full px-4 py-[13px] text-[14px]"
                  >
                    Añadir a la cesta
                  </GoldButton>

                  {!variante && (
                    <p className="cartela text-museo-laton">
                      Esta combinación aún no está dada de alta en la imprenta
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* El mostrador. Solo aparece cuando hay algo que cobrar. */}
        {cesta.unidades > 0 && (
          <div id="cesta" className="mt-14 border-t border-museo-tinta pt-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h3 className="font-display text-[32px] leading-none text-museo-tinta">La cesta</h3>
              <button
                type="button"
                onClick={cesta.vaciar}
                className="cartela text-museo-tinta-tenue transition-colors hover:text-museo-tinta"
              >
                Vaciar
              </button>
            </div>

            <ul className="grid">
              {cesta.detalle.map(({ linea, producto, importe, variante }) => {
                const color = producto.colores.find((c) => c.id === linea.color) ?? producto.colores[0];
                return (
                  <li
                    key={`${linea.producto}-${linea.color}-${linea.talla}-${linea.diseno}`}
                    className="flex flex-wrap items-center gap-4 border-b border-museo-linea py-4"
                  >
                    {producto.fotos.length ? (
                      <img
                        src={producto.fotos[0]}
                        alt={producto.nombre}
                        loading="lazy"
                        className="h-[54px] w-[54px] shrink-0 object-contain"
                      />
                    ) : (
                      <Prenda
                        prenda={producto.prenda}
                        color={color.tela}
                        sombra={color.sombra}
                        titulo={producto.nombre}
                        className="h-[54px] w-[54px] shrink-0"
                        estampado={(z) => DISENOS[linea.diseno].dibujar(z, color.tinta)}
                      />
                    )}
                    <div className="min-w-[160px] flex-1">
                      <div className="text-[15px] text-museo-tinta">{producto.nombre}</div>
                      <div className="cartela mt-[5px] text-museo-tinta-tenue">
                        {DISENOS[linea.diseno].nombre} · {color.nombre}
                        {linea.talla !== "UNICA" ? ` · ${linea.talla}` : ""}
                        {!variante ? " · sin fabricar" : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <button
                        type="button"
                        aria-label="Uno menos"
                        onClick={() => cesta.cambiarCantidad(linea, linea.cantidad - 1)}
                        className="h-8 w-8 border border-museo-linea text-museo-tinta transition-colors hover:border-museo-tinta"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-[15px] text-museo-tinta">
                        {linea.cantidad}
                      </span>
                      <button
                        type="button"
                        aria-label="Uno más"
                        onClick={() => cesta.cambiarCantidad(linea, linea.cantidad + 1)}
                        className="h-8 w-8 border border-museo-linea text-museo-tinta transition-colors hover:border-museo-tinta"
                      >
                        +
                      </button>
                    </div>
                    <div className="w-[86px] text-right font-display text-[19px] text-museo-tinta">
                      {euros(importe)}
                    </div>
                    <button
                      type="button"
                      onClick={() => cesta.quitar(linea)}
                      className="cartela text-museo-tinta-tenue transition-colors hover:text-museo-tinta"
                    >
                      Quitar
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_320px]">
              <p className="text-[13.5px] leading-[1.6] text-museo-tinta-tenue">
                {ENVIO.texto} Se fabrica al recibir el pedido, así que tarda unos días más que una
                tienda con almacén. El pago lo cobra Stripe; aquí no se guarda ninguna tarjeta.
              </p>

              <div className="grid gap-[10px]">
                <div className="flex justify-between text-[14px] text-museo-tinta-suave">
                  <span>Subtotal</span>
                  <span>{euros(cesta.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[14px] text-museo-tinta-suave">
                  <span>Envío</span>
                  <span>{cesta.envio === 0 ? "Incluido" : euros(cesta.envio)}</span>
                </div>
                <div className="flex justify-between border-t border-museo-tinta pt-[10px] font-display text-[24px] text-museo-tinta">
                  <span>Total</span>
                  <span>{euros(cesta.total)}</span>
                </div>

                <GoldButton
                  onClick={pagar}
                  className="mt-2 w-full py-[14px] text-[15px]"
                >
                  {estado === "yendo" ? "Un momento…" : "Pagar"}
                </GoldButton>

                {cesta.sinVariante.length > 0 && (
                  <p className="cartela text-museo-laton">
                    Hay {cesta.sinVariante.length} pieza(s) que la imprenta aún no puede fabricar
                  </p>
                )}
                {estado === "cerrada" && (
                  <p className="text-[13px] leading-[1.55] text-museo-tinta-suave">
                    La tienda todavía no está abierta: falta conectar el cobro. Tu cesta se queda
                    guardada donde está.
                  </p>
                )}
                {estado === "error" && (
                  <p className="text-[13px] leading-[1.55] text-museo-tinta-suave">
                    No se ha podido abrir el pago. Inténtalo otra vez en un minuto.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/*
        El visor va aquí abajo, fuera de la rejilla, porque se pinta encima de
        todo con `position: fixed`. Al cerrarlo se queda seleccionada en la
        tarjeta la foto en la que lo dejaste, que es lo que uno espera.
      */}
      {lupa &&
        (() => {
          const p = PRODUCTOS.find((x) => x.id === lupa.id);
          if (!p?.fotos.length) return null;
          return (
            <Galeria
              fotos={p.fotos}
              nombre={p.nombre}
              inicial={lupa.i}
              onIndice={(i) => setFoto((v) => (v[p.id] === i ? v : { ...v, [p.id]: i }))}
              onClose={() => setLupa(null)}
            />
          );
        })()}
    </section>
  );
}
