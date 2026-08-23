import { Character } from "./Character";
import { videos, youtubeThumb } from "@/config/cyp";
import printful from "@/config/printful.json";

/**
 * La imagen que encabeza cada tarjeta del menú.
 *
 * Un icono dice de qué va la sala; una imagen enseña lo que hay dentro. En un
 * menú que quiere facilitar la navegación eso no es adorno: el visitante
 * decide antes de leer, y con seis opciones a la vez, decidir rápido es todo.
 *
 * Se usa material propio y ninguna foto de banco. Hay de dos clases y las dos
 * son reales:
 *
 *  · **Lo que existe de verdad.** La miniatura del último vídeo del canal y la
 *    foto de portada de un producto de la tienda. Cambian solas cuando cambia
 *    el canal o el catálogo, porque salen de la misma configuración que las
 *    secciones — no hay una copia que se quede vieja.
 *  · **Los personajes.** Para las salas que no tienen fotografía posible
 *    —audioguía, test— se dibujan Culow y Pililarge, que son la imagen de la
 *    casa. Vestido de ninja en el vestuario, porque enseñar el vestuario con
 *    la figura desnuda no enseña el vestuario.
 *
 * Van sobre el degradado de peana, el mismo de las vitrinas de toda la web:
 * así la tarjeta se lee como una pieza expuesta y no como un banner.
 */

type Muestra =
  | { tipo: "duo"; separados?: boolean }
  | { tipo: "video" }
  | { tipo: "producto" }
  | { tipo: "personaje"; quien: "culow" | "pililarge"; disfraz?: string; habla?: boolean };

/** La miniatura del primer vídeo que haya sincronizado, si lo hay. */
const VIDEO = videos.find((v) => v.youtubeId);

/**
 * La foto de portada de un producto con prenda vestible.
 *
 * Se busca una camiseta o sudadera a propósito: la alfombrilla y las bolsas
 * son productos legítimos pero no dicen «ropa» de un vistazo, y la tienda es
 * sobre todo ropa. Si no hubiera ninguna, vale la primera que haya.
 */
const PRODUCTO =
  (printful?.productos ?? []).find((p) => /camiset|sudadera/i.test(p.nombre) && p.fotos?.length) ??
  (printful?.productos ?? []).find((p) => p.fotos?.length);

const MARCO =
  "relative flex h-[122px] items-end justify-center overflow-hidden border-b border-museo-linea";
const FONDO = {
  background:
    "linear-gradient(176deg, var(--cyp-peana-1) 0%, var(--cyp-peana-2) 62%, var(--cyp-peana-3) 100%)",
};

export function MuestraMenu({ muestra }: { muestra: Muestra }) {
  if (muestra.tipo === "video" && VIDEO?.youtubeId) {
    return (
      <div className={MARCO} style={FONDO}>
        <img
          src={youtubeThumb(VIDEO.youtubeId, VIDEO.vertical)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  if (muestra.tipo === "producto" && PRODUCTO?.fotos?.length) {
    return (
      <div className={MARCO} style={FONDO}>
        <img
          src={PRODUCTO.fotos[0]}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-[10px] transition-transform duration-[220ms] ease-out group-hover:scale-[1.05]"
        />
      </div>
    );
  }

  /*
    Los personajes se dibujan tocando el borde de abajo, como si estuvieran de
    pie sobre la línea de la tarjeta. Flotando en el centro parecerían pegatinas.
  */
  if (muestra.tipo === "personaje") {
    return (
      <div className={MARCO} style={FONDO}>
        <div className="translate-y-[6px] transition-transform duration-[220ms] ease-out group-hover:-translate-y-[1px]">
          <Character
            char={muestra.quien}
            scale={muestra.quien === "culow" ? 0.42 : 0.3}
            dress={!!muestra.disfraz}
            costume={(muestra.disfraz as never) ?? "none"}
            bob
          />
        </div>
      </div>
    );
  }

  /*
    Los dos. En el test van separados, que de eso trata: hay que elegir.

    Es también el respaldo de todo lo demás: si un día no hay vídeo
    sincronizado o la tienda se queda vacía, esas dos tarjetas caen aquí y
    enseñan a los personajes en vez de un hueco. Por eso `separados` se mira
    aparte y no se da por hecho el tipo.
  */
  const separados = muestra.tipo === "duo" && muestra.separados;
  return (
    <div className={MARCO} style={FONDO}>
      <div
        className={`flex translate-y-[6px] items-end transition-[gap,transform] duration-[220ms] ease-out ${
          separados
            ? "gap-[34px] group-hover:gap-[46px]"
            : "gap-[10px] group-hover:-translate-y-[1px]"
        }`}
      >
        <Character char="culow" scale={0.36} bob />
        <Character char="pililarge" scale={0.26} bob />
      </div>
    </div>
  );
}
