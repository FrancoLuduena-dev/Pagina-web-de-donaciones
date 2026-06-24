export const MOTIVOS_DENUNCIA = [
  { value: "CONTENIDO_INAPROPIADO", label: "Contenido inapropiado" },
  { value: "PUBLICACION_FALSA", label: "Publicación falsa o engañosa" },
  { value: "OBJETO_PROHIBIDO", label: "Objeto prohibido" },
  { value: "OTRO", label: "Otro motivo" },
] as const;

export type MotivoDenuncia = (typeof MOTIVOS_DENUNCIA)[number]["value"];

export function labelMotivoDenuncia(motivo: string): string {
  return (
    MOTIVOS_DENUNCIA.find((item) => item.value === motivo)?.label ?? motivo
  );
}
