export const MOTIVOS_DENUNCIA = [
  { value: "CONTENIDO_INAPROPIADO", label: "Contenido inapropiado" },
  { value: "PUBLICACION_FALSA", label: "Publicación falsa o engañosa" },
  { value: "OBJETO_PROHIBIDO", label: "Objeto prohibido" },
  { value: "OTRO", label: "Otro motivo" },
] as const;

export type MotivoDenuncia = (typeof MOTIVOS_DENUNCIA)[number]["value"];

/**
 * Convierte el código de motivo en su etiqueta legible.
 * @param motivo Código del motivo de denuncia.
 * @returns Etiqueta asociada al motivo o el código si no se encuentra.
 */
export function labelMotivoDenuncia(motivo: string): string {
  return (
    MOTIVOS_DENUNCIA.find((item) => item.value === motivo)?.label ?? motivo
  );
}
