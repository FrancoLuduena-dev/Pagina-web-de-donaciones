/**
 * Estados posibles de una denuncia dentro del flujo de moderación.
 */
export enum EstadoDenuncia {
  /**
   * La denuncia fue registrada y espera ser revisada.
   */
  PENDIENTE = 'PENDIENTE',

  /**
   * La denuncia ya fue asignada a un moderador para su revisión.
   */
  EN_REVISION = 'EN_REVISION',

  /**
   * La denuncia fue resuelta por el moderador.
   */
  RESUELTA = 'RESUELTA',
}
