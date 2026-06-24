import {
  getImagenesPublicacion,
  mapPublicacionBackendToResumen,
  labelCondicion,
  labelEstadoPublicacionBackend,
} from "@/constants/publicacionesBackend";
import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";
import { EstadoDonacion } from "@/types/EstadoDonacion";
import { EstadoPublicacion } from "@/types/EstadoPublicacion";
import type { PublicacionBackend } from "@/types/PublicacionBackend";

describe("publicacionesBackend helpers", () => {
  const publicacionBackend: PublicacionBackend = {
    id: "11111111-1111-4111-8111-111111111111",
    creadorId: "22222222-2222-4222-8222-222222222222",
    titulo: "Silla",
    descripcion: "Silla cómoda para donar.",
    categoriaId: "550e8400-e29b-41d4-a716-446655440002",
    localidadId: "vl-olivos",
    condicion: "NUEVO",
    imagenUrls: ["http://localhost:3000/uploads/publicaciones/silla.jpg"],
    estado: "RESERVADA",
  };

  it("getImagenesPublicacion devuelve array vacío si no hay imágenes", () => {
    expect(getImagenesPublicacion({})).toEqual([]);
  });

  it("mapPublicacionBackendToResumen transforma estados y categorías", () => {
    const resumen = mapPublicacionBackendToResumen(publicacionBackend);

    expect(resumen).toEqual({
      idPublicacion: publicacionBackend.id,
      tituloPublicacion: "Silla",
      descripcionPublicacion: "Silla cómoda para donar.",
      urlFoto: publicacionBackend.imagenUrls![0],
      categoria: CategoriaPublicacion.MUEBLES,
      zonaRetiro: expect.any(String),
      estadoPublicacion: EstadoPublicacion.RESERVADO,
      estadoDonacion: EstadoDonacion.NUEVO,
    });
  });

  it("labelCondicion y labelEstadoPublicacionBackend formatean valores conocidos", () => {
    expect(labelCondicion("USADO_BUENO")).toBe("Usado (buen estado)");
    expect(labelEstadoPublicacionBackend("PAUSADA")).toBe("Pausada");
  });
});
