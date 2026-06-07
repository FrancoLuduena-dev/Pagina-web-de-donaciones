import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";
import { EstadoDonacion } from "@/types/EstadoDonacion";
import { EstadoPublicacion } from "@/types/EstadoPublicacion";
import type { PublicacionResumen } from "@/types/PublicacionResumen";

export const publicacionesDestacadas: PublicacionResumen[] = [
  {
    idPublicacion: "1",
    tituloPublicacion: "Ropa de invierno para familia",
    descripcionPublicacion:
      "Abrigos, bufandas y camperas en buen estado. Retiro por Palermo.",
    urlFoto: "https://picsum.photos/id/1011/1200/800",
    urlFotos: [
      "https://picsum.photos/id/1011/1200/800",
      "https://picsum.photos/id/1012/1200/800",
      "https://picsum.photos/id/1013/1200/800",
      "https://picsum.photos/id/1014/1200/800",
      "https://picsum.photos/id/1015/1200/800",
    ],
    categoria: CategoriaPublicacion.INDUMENTARIA,
    zonaRetiro: "Palermo, CABA",
    estadoPublicacion: EstadoPublicacion.DISPONIBLE,
    estadoDonacion: EstadoDonacion.USADO,
  },
  {
    idPublicacion: "2",
    tituloPublicacion: "Mesa y sillas de comedor",
    descripcionPublicacion:
      "Juego de comedor de madera. Se retira por zona norte.",
    urlFoto: "https://picsum.photos/id/1025/1200/800",
    urlFotos: [
      "https://picsum.photos/id/1025/1200/800",
      "https://picsum.photos/id/1026/1200/800",
      "https://picsum.photos/id/1027/1200/800",
      "https://picsum.photos/id/1028/1200/800",
      "https://picsum.photos/id/1029/1200/800",
    ],
    categoria: CategoriaPublicacion.MUEBLES,
    zonaRetiro: "Vicente López, GBA",
    estadoPublicacion: EstadoPublicacion.DISPONIBLE,
    estadoDonacion: EstadoDonacion.USADO,
  },
  {
    idPublicacion: "3",
    tituloPublicacion: "Alimentos no perecederos",
    descripcionPublicacion:
      "Arroz, fideos, leche en polvo y conservas. Entrega coordinada.",
    urlFoto: "https://picsum.photos/id/1035/1200/800",
    urlFotos: [
      "https://picsum.photos/id/1035/1200/800",
      "https://picsum.photos/id/1036/1200/800",
      "https://picsum.photos/id/1037/1200/800",
      "https://picsum.photos/id/1038/1200/800",
      "https://picsum.photos/id/1039/1200/800",
    ],
    categoria: CategoriaPublicacion.ALIMENTOS,
    zonaRetiro: "La Plata, Buenos Aires",
    estadoPublicacion: EstadoPublicacion.DISPONIBLE,
    estadoDonacion: EstadoDonacion.NUEVO,
  },
  {
    idPublicacion: "4",
    tituloPublicacion: "Kit escolar completo",
    descripcionPublicacion:
      "Mochila, cuadernos, lápices y cartucheras. Ideal para inicio de clases.",
    /* no urlFoto to test placeholder */
    categoria: CategoriaPublicacion.OTROS,
    zonaRetiro: "Rosario, Santa Fe",
    estadoPublicacion: EstadoPublicacion.RESERVADO,
    estadoDonacion: EstadoDonacion.NUEVO,
  },
];
