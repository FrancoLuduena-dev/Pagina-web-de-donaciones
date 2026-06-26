/**
 * Tipos de resolución que puede aplicar un moderador a una denuncia.
 */
export enum TipoResolucion {
  /**
   * La denuncia se descarta sin ejecutar ninguna acción adicional.
   */
  DESCARTADA = 'DESCARTADA',

  /**
   * La publicación denunciada queda pausada temporalmente.
   */
  PUBLICACION_PAUSADA = 'PUBLICACION_PAUSADA',

  /**
   * La publicación denunciada es eliminada del sistema.
   */
  PUBLICACION_ELIMINADA = 'PUBLICACION_ELIMINADA',

  /**
   * El usuario creador de la publicación queda bloqueado.
   */
  USUARIO_BLOQUEADO = 'USUARIO_BLOQUEADO',
}
