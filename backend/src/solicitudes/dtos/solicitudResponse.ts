import { Publicacion } from '../../publicacion/entity/publicacionEntity';
import Usuario from '../../usuario/entity/usuarioEntity';
import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';

class PublicacionSolicitudDto {
  id!: string;
  titulo!: string;
}

class UsuarioSolicitudDto {
  id!: string;
  nombre!: string;
  email?: string;
  telefono?: string;
}

export class SolicitudResponseDto {
  id!: string;
  publicacionId!: string;
  solicitanteId!: string;
  creadorPublicacionId!: string;
  estado!: EstadoSolicitud;
  mensaje!: string | null;
  motivoRechazo!: string | null;
  motivoCancelacion!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  publicacion?: PublicacionSolicitudDto;
  solicitante?: UsuarioSolicitudDto;
  creadorPublicacion?: UsuarioSolicitudDto;

  static desdeEntidad(
    solicitud: Solicitud,
    usuarioActualId: string,
  ): SolicitudResponseDto {
    const mostrarContacto =
      solicitud.estado === EstadoSolicitud.ACEPTADA &&
      (solicitud.solicitanteId === usuarioActualId ||
        solicitud.creadorPublicacionId === usuarioActualId);

    return {
      id: solicitud.id,
      publicacionId: solicitud.publicacionId,
      solicitanteId: solicitud.solicitanteId,
      creadorPublicacionId: solicitud.creadorPublicacionId,
      estado: solicitud.estado,
      mensaje: solicitud.mensaje ?? null,
      motivoRechazo: solicitud.motivoRechazo ?? null,
      motivoCancelacion: solicitud.motivoCancelacion ?? null,
      createdAt: solicitud.createdAt,
      updatedAt: solicitud.updatedAt,
      publicacion: solicitud.publicacion
        ? this.mapearPublicacion(solicitud.publicacion)
        : undefined,
      solicitante: solicitud.solicitante
        ? this.mapearUsuario(solicitud.solicitante, mostrarContacto)
        : undefined,
      creadorPublicacion: solicitud.creadorPublicacion
        ? this.mapearUsuario(solicitud.creadorPublicacion, mostrarContacto)
        : undefined,
    };
  }

  private static mapearPublicacion(
    publicacion: Publicacion,
  ): PublicacionSolicitudDto {
    return {
      id: publicacion.id,
      titulo: publicacion.titulo,
    };
  }

  private static mapearUsuario(
    usuario: Usuario,
    mostrarContacto: boolean,
  ): UsuarioSolicitudDto {
    const usuarioMapeado: UsuarioSolicitudDto = {
      id: usuario.id,
      nombre: usuario.nombreCompleto,
    };

    if (mostrarContacto) {
      usuarioMapeado.email = usuario.correo;
      usuarioMapeado.telefono = usuario.numeroTelefono;
    }

    return usuarioMapeado;
  }
}
