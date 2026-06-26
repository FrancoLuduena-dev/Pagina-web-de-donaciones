/**
 * Script de medición de rendimiento (RNF-002).
 *
 * Mide el tiempo de respuesta del endpoint público de listado de publicaciones
 * (`GET /publicaciones`) realizando una serie de peticiones y reportando
 * estadísticas: mínimo, promedio, percentil 50 (mediana), percentil 95 y máximo.
 *
 * No requiere dependencias externas: usa el `fetch` nativo de Node 18+.
 *
 * Requisitos:
 *   - El backend debe estar corriendo (por defecto en http://localhost:3000).
 *
 * Uso:
 *   node scripts/medir-rendimiento.mjs
 *
 * Variables de entorno opcionales:
 *   API_URL        URL base del backend (default http://localhost:3000)
 *   RUTA           Ruta a medir (default /publicaciones)
 *   ITERACIONES    Cantidad de peticiones medidas (default 50)
 *   CALENTAMIENTO  Peticiones previas no medidas (default 5)
 *   UMBRAL_MS      Umbral de aceptación en ms para el p95 (default 2000)
 */

const API_URL = (process.env.API_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);
const RUTA = process.env.RUTA ?? '/publicaciones';
const ITERACIONES = Number(process.env.ITERACIONES ?? 50);
const CALENTAMIENTO = Number(process.env.CALENTAMIENTO ?? 5);
const UMBRAL_MS = Number(process.env.UMBRAL_MS ?? 2000);

const URL_OBJETIVO = `${API_URL}${RUTA}`;

/**
 * Realiza una petición y devuelve el tiempo de respuesta en milisegundos.
 * Lanza un error si la respuesta no es exitosa.
 */
async function medirUnaPeticion() {
  const inicio = performance.now();
  const respuesta = await fetch(URL_OBJETIVO);
  // Consumimos el cuerpo para contabilizar el tiempo completo de respuesta.
  await respuesta.text();
  const fin = performance.now();

  if (!respuesta.ok) {
    throw new Error(`Respuesta no exitosa: HTTP ${respuesta.status}`);
  }

  return fin - inicio;
}

/**
 * Calcula el percentil indicado (0-100) de un arreglo de números.
 */
function percentil(valoresOrdenados, p) {
  if (valoresOrdenados.length === 0) return 0;
  const indice = Math.ceil((p / 100) * valoresOrdenados.length) - 1;
  const acotado = Math.min(Math.max(indice, 0), valoresOrdenados.length - 1);
  return valoresOrdenados[acotado];
}

function formatear(ms) {
  return `${ms.toFixed(1)} ms`;
}

async function main() {
  console.log('==========================================================');
  console.log(' Medición de rendimiento (RNF-002)');
  console.log('==========================================================');
  console.log(`Objetivo:      ${URL_OBJETIVO}`);
  console.log(`Calentamiento: ${CALENTAMIENTO} peticiones`);
  console.log(`Iteraciones:   ${ITERACIONES} peticiones`);
  console.log(`Umbral p95:    ${UMBRAL_MS} ms`);
  console.log('----------------------------------------------------------');

  try {
    await medirUnaPeticion();
  } catch (error) {
    console.error(
      `\nNo se pudo conectar con el backend en ${URL_OBJETIVO}.\n` +
        `Asegurate de que el backend esté corriendo (npm run dev:back).\n`,
    );
    console.error(`Detalle: ${error.message}`);
    process.exit(1);
  }

  for (let i = 0; i < CALENTAMIENTO; i++) {
    await medirUnaPeticion();
  }

  const tiempos = [];
  for (let i = 0; i < ITERACIONES; i++) {
    tiempos.push(await medirUnaPeticion());
  }

  const ordenados = [...tiempos].sort((a, b) => a - b);
  const suma = tiempos.reduce((acc, t) => acc + t, 0);
  const promedio = suma / tiempos.length;
  const min = ordenados[0];
  const max = ordenados[ordenados.length - 1];
  const p50 = percentil(ordenados, 50);
  const p95 = percentil(ordenados, 95);

  console.log('Resultados:');
  console.log(`  Mínimo:     ${formatear(min)}`);
  console.log(`  Promedio:   ${formatear(promedio)}`);
  console.log(`  Mediana p50:${formatear(p50)}`);
  console.log(`  p95:        ${formatear(p95)}`);
  console.log(`  Máximo:     ${formatear(max)}`);
  console.log('----------------------------------------------------------');

  const cumple = p95 <= UMBRAL_MS;
  console.log(
    cumple
      ? `RESULTADO: OK — el p95 (${formatear(p95)}) está por debajo del umbral de ${UMBRAL_MS} ms.`
      : `RESULTADO: ATENCIÓN — el p95 (${formatear(p95)}) supera el umbral de ${UMBRAL_MS} ms.`,
  );
  console.log('==========================================================');

  process.exit(cumple ? 0 : 2);
}

main();
