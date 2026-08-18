import {
  DIAS, K, SECCIONES, VENTANA_ONLINE_MS, cmd, diaISO, hayAlmacen, hoy, pais,
  pipeline, visitante, type Peticion, type Respuesta,
} from "./_store";

/** Registra una visita y las secciones que ha llegado a ver. */
export default async function handler(req: Peticion, res: Respuesta) {
  if (req.method !== "POST") return res.status(405).json({ error: "método no permitido" });
  if (!hayAlmacen) return res.status(503).json({ error: "sin almacén configurado" });

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body as any) || {};
    const secciones: string[] = Array.isArray(body.sections) ? body.sections.slice(0, 20) : [];

    const hash = visitante(req);
    const ahora = Date.now();

    // NX: solo entra el primero del día. Ese es el contador de únicos.
    const primeraDelDia = await cmd<string | null>(
      "SET", K.seen(hash), "1", "NX", "EX", 86_400
    );

    const tareas: (string | number)[][] = [
      ["ZADD", K.online, ahora, hash],
      ["ZREMRANGEBYSCORE", K.online, 0, ahora - VENTANA_ONLINE_MS],
    ];

    if (primeraDelDia) {
      tareas.push(["INCR", K.total]);
      tareas.push(["HINCRBY", K.days, hoy(), 1]);
      const cc = pais(req);
      if (cc) tareas.push(["HINCRBY", K.countries, cc, 1]);
      // Los días que salen de la ventana se van borrando solos.
      tareas.push(["HDEL", K.days, diaISO(DIAS), diaISO(DIAS + 1), diaISO(DIAS + 2)]);
    }

    for (const id of secciones) {
      if (SECCIONES.has(id)) tareas.push(["HINCRBY", K.pages, id, 1]);
    }

    await pipeline(tareas);
    return res.status(204).end();
  } catch (err) {
    console.error("[visit]", err);
    return res.status(400).json({ error: "petición inválida" });
  }
}
