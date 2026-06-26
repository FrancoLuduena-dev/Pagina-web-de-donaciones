export const MUNICIPIO_VICENTE_LOPEZ = "Vicente López";

export type LocalidadVicenteLopez = {
  id: string;
  nombre: string;
};

/** Localidades del partido de Vicente López (GBA). */
export const LOCALIDADES_VICENTE_LOPEZ: LocalidadVicenteLopez[] = [
  { id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", nombre: "Olivos" },
  { id: "550e8400-e29b-41d4-a716-446655441001", nombre: "La Lucila" },
  { id: "550e8400-e29b-41d4-a716-446655441002", nombre: "Martínez" },
  { id: "550e8400-e29b-41d4-a716-446655441003", nombre: "Vicente López" },
  { id: "550e8400-e29b-41d4-a716-446655441004", nombre: "Florida" },
  { id: "550e8400-e29b-41d4-a716-446655441005", nombre: "Florida Oeste" },
  { id: "550e8400-e29b-41d4-a716-446655441006", nombre: "Munro" },
  { id: "550e8400-e29b-41d4-a716-446655441007", nombre: "Carapachay" },
  { id: "550e8400-e29b-41d4-a716-446655441008", nombre: "Villa Martelli" },
];

export const LOCALIDAD_ID_DEFAULT = LOCALIDADES_VICENTE_LOPEZ[0].id;

export function labelLocalidadId(localidadId: string): string {
  return (
    LOCALIDADES_VICENTE_LOPEZ.find((localidad) => localidad.id === localidadId)
      ?.nombre ?? "Localidad desconocida"
  );
}

export function zonaRetiroDesdeLocalidadId(localidadId: string): string {
  const nombre = labelLocalidadId(localidadId);
  if (nombre === "Localidad desconocida") {
    return MUNICIPIO_VICENTE_LOPEZ;
  }
  return `${nombre}, ${MUNICIPIO_VICENTE_LOPEZ}`;
}
