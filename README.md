# Museo Culow & Pililarge

La web del canal [@CulowPililarge](https://www.youtube.com/@CulowPililarge), montada como
una exposición: papel hueso, tinta negra, cartelas de catálogo y las dos piezas sobre su
peana. El contraste es el chiste — se trata una tontería con los modales de un museo serio.

React + Vite + TypeScript + Tailwind. Sin dependencias de UI: todo lo que se ve está en
`src/components/cyp/`.

## Arrancar

```bash
npm install
```

Dos procesos, cada uno en su terminal:

```bash
npm run dev
```

```bash
npm run server
```

El primero levanta la web en <http://localhost:5188>. El segundo es el contador de visitas
en el puerto 8787; Vite le redirige `/api`. Sin él la web funciona igual, pero el libro de
visitas solo cuenta lo de tu navegador y lo dice.

## Las salas

| Sala | Sección | Qué hace |
|---|---|---|
| 01 | Entrada | Las dos piezas con su cartela y las tres redes |
| 02 | Proyecciones | Los últimos vídeos del canal, sincronizados solos |
| 03 | Piezas breves | Los verticales |
| 04 | Las dos piezas | Quién es quién |
| 05 | Audioguía | Escribes algo y lo dice Culow o Pililarge |
| 06 | Vestuario | 19 disfraces, color y complementos |
| 07 | Textos de sala | Los poemas, recitados en voz alta |
| 08 | Tasación | Subasta de objetos sin ningún valor |
| 09 | Identificación | ¿Con cuál de los dos te identificas? |
| 10 | Otras sedes | YouTube, TikTok e Instagram |
| 11 | Libro de visitas | Contador real y mapa por países |
| 12 | Préstamos | Formulario de contacto |

## Día y noche

El museo abre de día —papel hueso, tinta negra— y de noche baja las luces:
mismo sitio, mismas piezas, con los focos puestos. El interruptor está en la
cabecera.

La primera vez manda la preferencia del sistema, así que quien tenga el móvil
en oscuro entra ya de noche. En cuanto alguien toca el interruptor, esa
decisión se recuerda y pasa por delante del sistema.

Toda la paleta son variables CSS en `src/index.css`: cambiar de día a noche es
cambiar esos números y nada más. Ningún componente conoce un color; usan los
nombres de `tailwind.config.ts` (`bg-museo-papel`, `text-museo-tinta`). Donde el
color hay que calcularlo —el mapa tiñe cada país según sus visitas— está
`src/lib/color.ts`, que escribe la misma variable desde JavaScript.

Las opacidades del texto secundario no son estéticas: por debajo del 60 % la
letra de cartela de 11 px no llega al mínimo de contraste sobre papel. Medido
sobre la página entera, en los dos modos, no queda ningún texto por debajo.

## Los vídeos se actualizan solos

```bash
npm run sync:youtube
```

Lee el feed público del canal, separa los verticales de los apaisados y escribe
`src/config/youtube.json`. A partir de ahí las miniaturas, los títulos y los enlaces salen
solos: no hay que copiar ningún ID a mano. Los títulos se limpian de hashtags al pasar.

Hay un workflow de GitHub Actions preparado para ejecutarlo cada día
(`.github/workflows/sync-youtube.yml` en el repositorio original).

## El contador de visitas es real

No hay ni un número inventado en toda la sección. `server/index.mjs` es un servidor de Node
sin dependencias con `GET /api/stats` y `POST /api/visit`, y guarda los datos en un JSON al
lado del propio fichero.

Privacidad, a propósito:

- **No se guarda ninguna IP.** Para saber si dos peticiones son del mismo visitante se usa
  un hash con sal que rota cada día, así que el dato deja de ser reversible mañana.
- **Del país solo se guarda el código** (`ES`, `MX`…), nunca ciudad ni coordenadas.
- **No se llama a ningún servicio de terceros.** El país sale de la cabecera que ya añade el
  hosting (Cloudflare, Vercel, Netlify…) y, si no la hay, de lo que declara el navegador a
  partir de su idioma o su zona horaria. Ninguna de las dos cosas mira la IP.

Si el backend no responde, la web cuenta en el navegador **empezando en cero** y avisa arriba
de que esos números son solo tuyos. Nunca rellena el hueco con tráfico falso.

Variables de entorno del servidor:

| Variable | Para qué |
|---|---|
| `PORT` | Puerto (8787 por defecto) |
| `CYP_DATA` | Ruta del JSON de datos |
| `CYP_STATS_SECRET` | Sal del hash de visitante (si falta se genera y se guarda) |
| `CYP_GEO_URL` | Geolocalización externa opcional, con `{ip}`. Apagada por defecto |
| `CYP_SERVE_DIST` | `1` para que el mismo proceso sirva también el build |

## Publicar

```bash
npm run build
```

```bash
npm start
```

`npm start` levanta el servidor sirviendo `dist/` y la API en el mismo puerto, que es la
forma más simple de tener la web y el contador funcionando de verdad. Si prefieres un
hosting estático (Vercel, Netlify), el contador global necesita que el backend viva en
algún sitio; sin él la web se ve entera pero el libro de visitas queda en local.

## Qué se toca para cambiar cosas

- **Textos, enlaces, poemas, frases:** `src/config/cyp.ts`. Es el único fichero de contenido.
- **Los disfraces:** `src/components/cyp/costumes.tsx`. Se añade una entrada a `COSTUMES` con
  su grupo y su color, y se le da su pinta en `CostumeParts`. Están dibujados con divs y
  `clip-path`, así que un disfraz más no pesa nada.
- **La anatomía de los dos:** `src/components/cyp/Character.tsx`. No lleva ni patas ni
  brazos a propósito: la silueta limpia es la marca.
- **Las voces:** `src/hooks/useSpeech.ts`. Culow va grave y atropellado; Pililarge, agudo y a
  trocitos. Si metes clips reales del canal en `public/voces/` y los apuntas en `cyp.ts`,
  suena el audio de verdad en vez de la síntesis.
- **La paleta y las tipografías:** `tailwind.config.ts` y `src/index.css`.

## El logo

`src/assets/logo-mark.svg` es el símbolo en vectorial puro: las dos esferas de Culow y la
barra de Pililarge. En la web se pinta en línea desde `src/components/cyp/Logo.tsx` para que
herede el color y se pueda poner en negro, crema o latón sin duplicar ficheros.
