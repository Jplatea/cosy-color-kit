# Rediseño de culowypililarge.com

La página (`src/pages/Index.tsx`) es el rediseño completo salido de Claude Design:
esculturas mate blancas sobre estudio oscuro cálido, con dos juguetes
interactivos y un panel de visitas.

## Poner en marcha

```sh
npm i
npm run dev        # la web en http://localhost:8080
npm run server     # el contador de visitas en http://localhost:8787
```

Los dos comandos son independientes: si el backend no está levantado, el panel
de visitas cuenta en el navegador y lo dice. Vite redirige `/api` al backend, así
que no hace falta configurar nada más.

Para probarlo todo junto como en producción:

```sh
npm run build && npm start   # web + API en http://localhost:8787
```

Otros comandos: `npm run typecheck`, `npm run lint`, `npm run sync:youtube`.

## Secciones

| Sección | Componente | Notas |
| --- | --- | --- |
| Inicio / hero | `Hero.tsx` | Foco, personajes flotando y cinta de eslóganes |
| Últimos vídeos | `Videos.tsx` | Miniaturas automáticas desde el ID de YouTube |
| Shorts y TikTok | `Shorts.tsx` | Verticales 9:16 |
| Ellos dos | `Personajes.tsx` | Biografías |
| Hazlos hablar | `HazlosHablar.tsx` | Voz + modulador reactivo |
| El vestidor | `Vestidor.tsx` | 7 disfraces, 8 colores, 4 complementos |
| Poemas | `Poemas.tsx` | Cada uno se puede recitar |
| Instagram | `InstagramFeed.tsx` | Rejilla de 6 |
| Quién ha pasado por aquí | `Visitas.tsx` + `MapaVisitas.tsx` | Panel y mapa mundial |
| Contacto | `Contacto.tsx` | Abre el cliente de correo |

Los dos personajes se dibujan enteros en CSS en `Character.tsx`, que es también
donde viven los disfraces y los complementos. La misma pieza sirve para el hero,
las biografías y los dos juguetes: `dress={false}` los deja desnudos y sin cara.

## Rellenar los vídeos

```sh
npm run sync:youtube
```

Lee el feed público del canal, separa los verticales de los vídeos largos y
escribe `src/config/youtube.json`. A partir de ahí las miniaturas, los títulos y
los enlaces salen solos. Revisa el resultado y haz commit.

Opciones: `--handle @OtroCanal`, `--videos 3`, `--shorts 4`, `--dry` (enseña lo
que haría sin escribir).

Si prefieres hacerlo a mano, o para TikTok e Instagram —que no tienen miniatura
derivable del enlace—, edita las listas de `src/config/cyp.ts` y deja las
imágenes en `public/`.

## Las voces

Hay dos caminos, y la sección no distingue entre ellos:

1. **Clips reales.** Deja los recortes del canal en `public/voces/` y apúntalos
   en el campo `audio` del poema o de la línea de diálogo, en
   `src/config/cyp.ts`. Suena el audio de verdad y el modulador se dibuja con su
   onda real, tomada con un `AnalyserNode`. Es la forma de que suenen como los
   actores.
2. **Voz del navegador.** Sin clip, se sintetiza. Para que no suene a robot
   leyendo, cada personaje coge una voz distinta del sistema y la frase se
   trocea en cláusulas con prosodia propia: Culow atropella y se acelera,
   Pililarge se para entre frase y frase y cierra grave. Los parámetros están en
   `VOICES`, en `src/hooks/useSpeech.ts`.

La síntesis del navegador no puede imitar una voz concreta: eso solo lo dan los
clips reales.

## El contador de visitas

`server/index.mjs` es un servidor de Node sin dependencias que expone:

- `GET /api/stats` → `{ total, today, online, pages, days, countries }`
- `POST /api/visit` con `{ sections: string[] }`

Guarda los datos en `server/data/stats.json`. `load` y `persist` son los dos
únicos puntos que hay que tocar para llevarlo a Postgres o Redis.

Si el backend no responde, el frontend cuenta en el navegador y avisa arriba de
qué fuente está usando; el mapa muestra datos de ejemplo y lo indica.

### Privacidad

Esto es deliberado, no un descuido:

- **No se guarda ninguna IP.** Para saber si dos peticiones son del mismo
  visitante se usa un hash con sal que rota cada día, así que el dato deja de ser
  reversible al día siguiente.
- Del país solo se guarda el código (`ES`, `MX`…), nunca ciudad ni coordenadas.
- **Por defecto no se llama a ningún servicio externo.** Se aprovechan las
  cabeceras que ya añade el hosting (`cf-ipcountry` en Cloudflare,
  `x-vercel-ip-country` en Vercel, y equivalentes). Para activar una consulta de
  geolocalización hay que pedirlo explícitamente con `CYP_GEO_URL`.

### Variables de entorno

| Variable | Para qué |
| --- | --- |
| `PORT` | Puerto del backend (8787) |
| `CYP_DATA` | Ruta del JSON de datos |
| `CYP_STATS_SECRET` | Sal del hash de visitante. Ponla en producción para que sobreviva a los despliegues |
| `CYP_GEO_URL` | Geolocalización externa, con `{ip}`. Ej: `https://ipapi.co/{ip}/json/` |
| `CYP_SERVE_DIST` | `1` para servir también el build de `dist/` |
| `CYP_API_URL` | Destino del proxy `/api` en desarrollo |

Si despliegas la web como estático (Lovable, Netlify, Vercel), el panel funciona
igual contando en el navegador. Para tener datos de verdad hay que levantar
`server/index.mjs` en algún sitio y apuntar `/api` hacia él.
