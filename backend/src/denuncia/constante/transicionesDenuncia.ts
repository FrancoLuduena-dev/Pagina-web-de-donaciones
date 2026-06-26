import { EstadoDenuncia } from '../enums/estadoDenuncia';

/**
 * Definición de las transiciones permitidas entre estados de una denuncia.
 */
export const TRANSICIONES_DENUNCIA: Record<EstadoDenuncia, EstadoDenuncia[]> = {
  [EstadoDenuncia.PENDIENTE]: [EstadoDenuncia.EN_REVISION],

  [EstadoDenuncia.EN_REVISION]: [EstadoDenuncia.RESUELTA],

  [EstadoDenuncia.RESUELTA]: [],
};

/**
 * Determina si una denuncia puede pasar de un estado a otro.
 *
 * @param estadoActual Estado vigente de la denuncia.
 * @param nuevoEstado Estado solicitado para la denuncia.
 * @returns Verdadero cuando la transición está permitida.
 */
export function puedeTransicionarDenuncia(
  estadoActual: EstadoDenuncia,
  nuevoEstado: EstadoDenuncia,
): boolean {
  return TRANSICIONES_DENUNCIA[estadoActual].includes(nuevoEstado);
}
