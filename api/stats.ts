import {
  DIAS, K, VENTANA_ONLINE_MS, aObjeto, diaISO, hayAlmacen, hoy, pipeline,
  type Peticion, type Respuesta,
} from "./_store";

/** Devuelve el panel de visitas. Lo consume `src/lib/stats.ts`. */
export default async function handler(req: Peticion, res: Respuesta) {
  if (req.method !== "GET") return res.status(405).json({ error: "método no permitido" });

  // Sin almacén, el frontend lo detecta y cuenta en el navegador.
  if (!hayAlmacen) return res.status(503).json({ error: "sin almacén configurado" });

  try {
    const corte = Date.now() - VENTANA_ONLINE_MS;
    const [total, days, pages, countries, online] = await pipeline([
      ["GET", K.total],
      ["HGETALL", K.days],
      ["HGETALL", K.pages],
      ["HGETALL", K.countries],
      ["ZCOUNT", K.online, corte, "+inf"],
    ]);

    const porDia = aObjeto(days);

    // La serie trae siempre los 14 días, rellenando con cero los que falten:
    // así la gráfica no cambia de anchura según haya visitas o no.
    const serie = [];
    for (let i = DIAS - 1; i >= 0; i--) {
      const date = diaISO(i);
      serie.push({ date, count: porDia[date] ?? 0 });
    }

    res.setHeader("cache-control", "no-store");
    return res.status(200).json({
      total: Number(total ?? 0),
      today: porDia[hoy()] ?? 0,
      online: Math.max(1, Number(online ?? 0)),
      pages: aObjeto(pages),
      days: serie,
      countries: aObjeto(countries),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[stats]", err);
    return res.status(500).json({ error: "no se pudo leer el contador" });
  }
}
