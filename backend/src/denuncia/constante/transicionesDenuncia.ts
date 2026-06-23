import { EstadoDenuncia } from '../enums/estadoDenuncia';

export const TRANSICIONES_DENUNCIA: Record<EstadoDenuncia, EstadoDenuncia[]> = {
  [EstadoDenuncia.PENDIENTE]: [EstadoDenuncia.EN_REVISION],

  [EstadoDenuncia.EN_REVISION]: [EstadoDenuncia.RESUELTA],

  [EstadoDenuncia.RESUELTA]: [],
};

export function puedeTransicionarDenuncia(
  estadoActual: EstadoDenuncia,
  nuevoEstado: EstadoDenuncia,
): boolean {
  return TRANSICIONES_DENUNCIA[estadoActual].includes(nuevoEstado);
}
