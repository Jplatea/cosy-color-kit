/**
 * Quita el fondo blanco de una maqueta de Printful.
 *
 * Sus `preview_url` traen el blanco **pintado**, no transparente. Sobre el
 * papel crema de la tienda eso se ve como un rectángulo blanco detrás de la
 * prenda, y canta: el resto de fotos —las que descargas tú del generador—
 * vienen recortadas y dejan ver el fondo de la sala.
 *
 * No vale con borrar todo lo blanco, porque la camiseta blanca también lo es.
 * Lo que distingue al fondo no es su color, es **dónde está**: el fondo toca el
 * marco de la imagen y la prenda no. Así que se inunda desde los cuatro bordes
 * hacia dentro y se para en cuanto el píxel deja de ser casi blanco. La prenda
 * blanca sobrevive porque su contorno tiene sombra y pliegues, y ahí la
 * inundación se detiene.
 *
 * Los márgenes son estrechos a propósito, y eso está medido: con `borde` en 30
 * la inundación se colaba por los hombros de la camiseta blanca y se comía el
 * 88 % del lienzo, cuando las de color se quedaban en el 51 %. Bajándolo a 10,
 * la blanca cae al 49,9 % y todas quedan en el mismo rango. El fondo de una
 * maqueta es un 255 plano —es un render, no una foto— y la prenda blanca tiene
 * pliegues y sombra; diez niveles bastan para separarlos.
 *
 * Devuelve la fracción de lienzo que ha vuelto transparente, para que quien
 * llame pueda desconfiar: si se lleva casi toda la imagen, es que la prenda no
 * se distinguía del fondo y más vale dejar la foto como estaba.
 */
export function destapar(px, ancho, alto, { fondo = 2, borde = 10 } = {}) {
  /** Cuánto se aleja del blanco puro, de 0 a 255. */
  const lejos = (i) => 255 - Math.min(px[i], px[i + 1], px[i + 2]);

  const visto = new Uint8Array(ancho * alto);
  const cola = new Int32Array(ancho * alto);
  let fin = 0;

  const meter = (x, y) => {
    if (x < 0 || y < 0 || x >= ancho || y >= alto) return;
    const p = y * ancho + x;
    if (visto[p] || lejos(p * 4) > borde) return;
    visto[p] = 1;
    cola[fin++] = p;
  };

  for (let x = 0; x < ancho; x++) {
    meter(x, 0);
    meter(x, alto - 1);
  }
  for (let y = 0; y < alto; y++) {
    meter(0, y);
    meter(ancho - 1, y);
  }

  // Anchura primero, con la cola en un array tipado: en una imagen de 800×800
  // una recursión se come la pila.
  for (let cab = 0; cab < fin; cab++) {
    const p = cola[cab];
    const x = p % ancho;
    const y = (p / ancho) | 0;
    meter(x + 1, y);
    meter(x - 1, y);
    meter(x, y + 1);
    meter(x, y - 1);
  }

  let tocados = 0;
  for (let p = 0; p < ancho * alto; p++) {
    if (!visto[p]) continue;
    const i = p * 4;
    const d = lejos(i);
    // Entre `fondo` y `borde` se deja alfa proporcional. Cortando en seco, el
    // recorte sale con dientes de sierra alrededor de la prenda; con esta
    // franja de transición el canto queda suave.
    const alfa = d <= fondo ? 0 : Math.round(((d - fondo) / (borde - fondo)) * 255);
    if (alfa < px[i + 3]) {
      px[i + 3] = alfa;
      tocados++;
    }
  }
  return tocados / (ancho * alto);
}
