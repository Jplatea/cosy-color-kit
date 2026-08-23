import { useEffect, useRef, useState } from "react";
import { Interruptor } from "./Interruptor";
import { LogoMark } from "./Logo";
import { menuPrincipal } from "@/config/cyp";
import { MenuPanel } from "./MenuPanel";

/**
 * La cabecera del museo.
 *
 * Una sola línea: el rótulo, dos palabras y la tienda. Encima había una banda
 * con el horario y el «prohibido tocar», que era un buen chiste de museo pero
 * ocupaba una franja entera de pantalla en cada visita para decir algo que solo
 * tiene gracia la primera vez.
 *
 * Arriba solo hay **dos palabras y la tienda**. Antes había siete enlaces —y
 * la web tiene doce salas, así que a cinco no se llegaba— y en una cabecera
 * donde todo pesa lo mismo no destaca nada. Cuando una web crece, el menú
 * horizontal no crece con ella: se agrupa. Lo demás vive detrás del botón de
 * menú, que abre la pantalla entera y ahí sí hay sitio para enseñarlo con
 * dibujos.
 *
 * La barra se esconde al bajar y vuelve **en cuanto se empieza a subir**, no
 * al llegar arriba del todo. En una página tan larga como esta, esperar a que
 * el visitante suba mil píxeles para devolverle el menú es hacerle trabajar.
 */

/** La tienda sale del listado: tiene su propio botón y estaría dos veces. */
const ES_TIENDA = (href: string) => href === "#tienda";
const NIVEL1 = menuPrincipal.filter((item) => !ES_TIENDA(item.href));
const TIENDA = menuPrincipal.find((item) => ES_TIENDA(item.href));

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
  const [abierto, setAbierto] = useState(false);
  const [oculta, setOculta] = useState(false);
  const ultimoY = useRef(0);

  /*
    La barra desaparece al bajar y vuelve al subir.

    Se mira el **sentido** del desplazamiento y no la posición, que es lo que
    hace que vuelva enseguida: basta con empezar a subir. Y hay un margen de
    seis píxeles porque sin él, el temblor de un ratón de rueda fina o el
    rebote del móvil la hacen parpadear.

    Por encima de los primeros 120 píxeles no se esconde nunca: arriba del todo
    la cabecera no le quita sitio a nada.
  */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - ultimoY.current) > 6) {
        setOculta(y > 120 && y > ultimoY.current);
        ultimoY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Con el panel abierto la barra se queda quieta y a la vista. */
  useEffect(() => {
    if (abierto) setOculta(false);
  }, [abierto]);

  return (
    <header
      className={`sticky top-0 z-[60] border-b border-museo-linea bg-museo-papel/90 backdrop-blur-[10px] transition-transform duration-300 ease-out ${
        oculta ? "-translate-y-full" : "translate-y-0"
      }`}
    >
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

        {/*
          Nivel 1: dos palabras.

          «Las piezas» lleva a los personajes y «El museo» a todo lo demás. No
          son secciones nuevas: son la puerta de dos grupos, y el visitante
          entiende de un vistazo qué hay aquí sin leerse doce enlaces.
        */}
        <nav className="hidden items-center gap-6 lg:flex">
          {NIVEL1.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-[14px] text-museo-tinta-suave transition-colors hover:text-museo-tinta"
            >
              {item.label}
              <span
                aria-hidden
                className="absolute -bottom-[5px] left-0 h-px w-0 bg-museo-tinta transition-[width] duration-200 ease-out hover:w-full"
              />
            </a>
          ))}
        </nav>

        <BotonTienda />

        <Interruptor />

        {/*
          El botón de menú, ahora en todos los tamaños.

          Antes solo salía en el móvil y en el ordenador había un desplegable
          distinto: dos menús que mantener y dos sitios donde mirar. Ahora es
          el mismo, y lo que cambia es lo que se abre —rejilla con dibujos o
          lista de texto grande—, que es donde de verdad se diferencian.
        */}
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir el menú"
          aria-expanded={abierto}
          className="flex h-9 shrink-0 items-center gap-[9px] rounded-[2px] border border-museo-linea px-[12px] text-museo-tinta transition-colors hover:border-museo-tinta"
        >
          <span className="grid gap-[4px]">
            <span className="block h-px w-[15px] bg-current" />
            <span className="block h-px w-[15px] bg-current" />
            <span className="block h-px w-[15px] bg-current" />
          </span>
          <span className="cartela hidden sm:block">Menú</span>
        </button>
      </div>

      <MenuPanel abierto={abierto} cerrar={() => setAbierto(false)} />
    </header>
  );
}
