/**
 * Motivos que puede declarar un usuario al crear una denuncia.
 */
export enum MotivoDenuncia {
  /**
   * La publicación contiene contenido inapropiado o no acorde a las reglas.
   */
  CONTENIDO_INAPROPIADO = 'CONTENIDO_INAPROPIADO',

  /**
   * La publicación presenta información falsa o engañosa.
   */
  PUBLICACION_FALSA = 'PUBLICACION_FALSA',

  /**
   * La publicación ofrece o promueve un objeto prohibido.
   */
  OBJETO_PROHIBIDO = 'OBJETO_PROHIBIDO',

  /**
   * Otro motivo no contemplado explícitamente.
   */
  OTRO = 'OTRO',
}
