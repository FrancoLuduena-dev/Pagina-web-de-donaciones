import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import Usuario from 'src/usuario/entity/usuarioEntity';

import { CancelarSolicitudDto } from '../dtos/cancelarSolicitudDto';
import { CrearSolicitudDto } from '../dtos/crearSolicitudDto';
import { RechazarSolicitudDto } from '../dtos/rechazarSolicitudDto';
import { SolicitudResponseDto } from '../dtos/solicitudResponse';
import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { SolicitudService } from '../service/solicitudService';
import { SolicitudController } from './solicitudController';

type SolicitudServiceMock = jest.Mocked<
  Pick<
    SolicitudService,
    | 'crearSolicitud'
    | 'listarMisSolicitudes'
    | 'listarSolicitudesRecibidas'
    | 'finalizarEntregaPorPublicacion'
    | 'cancelarReservaPorPublicacion'
    | 'aceptarSolicitud'
    | 'rechazarSolicitud'
    | 'finalizarSolicitud'
    | 'cancelarSolicitud'
  >
>;

type MetodoController =
  | 'crearSolicitud'
  | 'listarMias'
  | 'listarRecibidas'
  | 'finalizarEntregaPublicacion'
  | 'cancelarReservaPublicacion'
  | 'aceptarSolicitud'
  | 'rechazarSolicitud'
  | 'finalizarSolicitud'
  | 'cancelarSolicitud';

describe('SolicitudController', () => {
  let controller: SolicitudController;
  let service: SolicitudServiceMock;

  beforeEach(() => {
    service = {
      crearSolicitud: jest.fn<
        ReturnType<SolicitudService['crearSolicitud']>,
        Parameters<SolicitudService['crearSolicitud']>
      >(),
      listarMisSolicitudes: jest.fn<
        ReturnType<SolicitudService['listarMisSolicitudes']>,
        Parameters<SolicitudService['listarMisSolicitudes']>
      >(),
      listarSolicitudesRecibidas: jest.fn<
        ReturnType<SolicitudService['listarSolicitudesRecibidas']>,
        Parameters<SolicitudService['listarSolicitudesRecibidas']>
      >(),
      finalizarEntregaPorPublicacion: jest.fn<
        ReturnType<SolicitudService['finalizarEntregaPorPublicacion']>,
        Parameters<SolicitudService['finalizarEntregaPorPublicacion']>
      >(),
      cancelarReservaPorPublicacion: jest.fn<
        ReturnType<SolicitudService['cancelarReservaPorPublicacion']>,
        Parameters<SolicitudService['cancelarReservaPorPublicacion']>
      >(),
      aceptarSolicitud: jest.fn<
        ReturnType<SolicitudService['aceptarSolicitud']>,
        Parameters<SolicitudService['aceptarSolicitud']>
      >(),
      rechazarSolicitud: jest.fn<
        ReturnType<SolicitudService['rechazarSolicitud']>,
        Parameters<SolicitudService['rechazarSolicitud']>
      >(),
      finalizarSolicitud: jest.fn<
        ReturnType<SolicitudService['finalizarSolicitud']>,
        Parameters<SolicitudService['finalizarSolicitud']>
      >(),
      cancelarSolicitud: jest.fn<
        ReturnType<SolicitudService['cancelarSolicitud']>,
        Parameters<SolicitudService['cancelarSolicitud']>
      >(),
    };

    controller = new SolicitudController(
      service as unknown as SolicitudService,
    );
  });

  describe('metadata del controller', () => {
    it('expone el path base correcto', () => {
      expect(obtenerMetadata(PATH_METADATA, SolicitudController)).toBe(
        'solicitudes',
      );
    });

    it('expone las rutas esperadas', () => {
      expect(obtenerRuta('crearSolicitud')).toEqual({
        path: '/',
        method: RequestMethod.POST,
      });

      expect(obtenerRuta('listarMias')).toEqual({
        path: 'mias',
        method: RequestMethod.GET,
      });

      expect(obtenerRuta('listarRecibidas')).toEqual({
        path: 'recibidas',
        method: RequestMethod.GET,
      });

      expect(obtenerRuta('finalizarEntregaPublicacion')).toEqual({
        path: 'publicacion/:publicacionId/entregar',
        method: RequestMethod.PATCH,
      });

      expect(obtenerRuta('cancelarReservaPublicacion')).toEqual({
        path: 'publicacion/:publicacionId/cancelar-reserva',
        method: RequestMethod.PATCH,
      });

      expect(obtenerRuta('aceptarSolicitud')).toEqual({
        path: ':id/aceptar',
        method: RequestMethod.PATCH,
      });

      expect(obtenerRuta('rechazarSolicitud')).toEqual({
        path: ':id/rechazar',
        method: RequestMethod.PATCH,
      });

      expect(obtenerRuta('finalizarSolicitud')).toEqual({
        path: ':id/finalizar',
        method: RequestMethod.PATCH,
      });

      expect(obtenerRuta('cancelarSolicitud')).toEqual({
        path: ':id/cancelar',
        method: RequestMethod.PATCH,
      });
    });
  });

  describe('crearSolicitud', () => {
    it('crea una solicitud usando el id del usuario autenticado', async () => {
      const dto: CrearSolicitudDto = {
        publicacionId: 'publicacion-1',
        mensaje: 'Me interesa esta publicación',
      };
      const respuesta = crearRespuesta({ id: 'solicitud-1' });

      service.crearSolicitud.mockResolvedValue(respuesta);

      await expect(
        controller.crearSolicitud(dto, crearRequest('usuario-solicitante')),
      ).resolves.toBe(respuesta);

      expect(service.crearSolicitud).toHaveBeenCalledTimes(1);
      expect(service.crearSolicitud).toHaveBeenCalledWith(
        dto,
        'usuario-solicitante',
      );
    });

    it('propaga errores del service al crear una solicitud', async () => {
      service.crearSolicitud.mockRejectedValue(new Error('No disponible'));

      await expect(
        controller.crearSolicitud(
          { publicacionId: 'publicacion-1' },
          crearRequest('usuario-1'),
        ),
      ).rejects.toThrow('No disponible');

      expect(service.crearSolicitud).toHaveBeenCalledWith(
        { publicacionId: 'publicacion-1' },
        'usuario-1',
      );
    });
  });

  describe('listados', () => {
    it('lista solicitudes hechas por el usuario autenticado', async () => {
      const respuesta = [crearRespuesta({ id: 'solicitud-mia' })];

      service.listarMisSolicitudes.mockResolvedValue(respuesta);

      await expect(
        controller.listarMias(crearRequest('usuario-1')),
      ).resolves.toBe(respuesta);

      expect(service.listarMisSolicitudes).toHaveBeenCalledWith('usuario-1');
      expect(service.listarSolicitudesRecibidas).not.toHaveBeenCalled();
    });

    it('lista solicitudes recibidas por el usuario autenticado', async () => {
      const respuesta = [crearRespuesta({ id: 'solicitud-recibida' })];

      service.listarSolicitudesRecibidas.mockResolvedValue(respuesta);

      await expect(
        controller.listarRecibidas(crearRequest('usuario-creador')),
      ).resolves.toBe(respuesta);

      expect(service.listarSolicitudesRecibidas).toHaveBeenCalledWith(
        'usuario-creador',
      );
      expect(service.listarMisSolicitudes).not.toHaveBeenCalled();
    });
  });

  describe('acciones por publicación', () => {
    it('finaliza la entrega a partir del id de publicación y usuario autenticado', async () => {
      const respuesta = crearRespuesta({ estado: EstadoSolicitud.FINALIZADA });

      service.finalizarEntregaPorPublicacion.mockResolvedValue(respuesta);

      await expect(
        controller.finalizarEntregaPublicacion(
          'publicacion-1',
          crearRequest('usuario-creador'),
        ),
      ).resolves.toBe(respuesta);

      expect(service.finalizarEntregaPorPublicacion).toHaveBeenCalledWith(
        'publicacion-1',
        'usuario-creador',
      );
    });

    it('cancela la reserva a partir del id de publicación, usuario autenticado y motivo', async () => {
      const dto: CancelarSolicitudDto = {
        motivo: 'No puedo concretar la entrega',
      };
      const respuesta = crearRespuesta({ estado: EstadoSolicitud.CANCELADA });

      service.cancelarReservaPorPublicacion.mockResolvedValue(respuesta);

      await expect(
        controller.cancelarReservaPublicacion(
          'publicacion-1',
          dto,
          crearRequest('usuario-creador'),
        ),
      ).resolves.toBe(respuesta);

      expect(service.cancelarReservaPorPublicacion).toHaveBeenCalledWith(
        'publicacion-1',
        'usuario-creador',
        dto,
      );
    });
  });

  describe('acciones por solicitud', () => {
    it('acepta una solicitud usando id de solicitud e id de usuario', async () => {
      const respuesta = crearRespuesta({ estado: EstadoSolicitud.ACEPTADA });

      service.aceptarSolicitud.mockResolvedValue(respuesta);

      await expect(
        controller.aceptarSolicitud(
          'solicitud-1',
          crearRequest('usuario-creador'),
        ),
      ).resolves.toBe(respuesta);

      expect(service.aceptarSolicitud).toHaveBeenCalledWith(
        'solicitud-1',
        'usuario-creador',
      );
    });

    it('rechaza una solicitud usando el motivo recibido', async () => {
      const dto: RechazarSolicitudDto = {
        motivo: 'Ya no está disponible',
      };
      const respuesta = crearRespuesta({ estado: EstadoSolicitud.RECHAZADA });

      service.rechazarSolicitud.mockResolvedValue(respuesta);

      await expect(
        controller.rechazarSolicitud(
          'solicitud-1',
          dto,
          crearRequest('usuario-creador'),
        ),
      ).resolves.toBe(respuesta);

      expect(service.rechazarSolicitud).toHaveBeenCalledWith(
        'solicitud-1',
        'usuario-creador',
        dto,
      );
    });

    it('finaliza una solicitud usando id de solicitud e id de usuario', async () => {
      const respuesta = crearRespuesta({ estado: EstadoSolicitud.FINALIZADA });

      service.finalizarSolicitud.mockResolvedValue(respuesta);

      await expect(
        controller.finalizarSolicitud(
          'solicitud-1',
          crearRequest('usuario-creador'),
        ),
      ).resolves.toBe(respuesta);

      expect(service.finalizarSolicitud).toHaveBeenCalledWith(
        'solicitud-1',
        'usuario-creador',
      );
    });

    it('cancela una solicitud usando el motivo recibido', async () => {
      const dto: CancelarSolicitudDto = {
        motivo: 'No puedo continuar',
      };
      const respuesta = crearRespuesta({ estado: EstadoSolicitud.CANCELADA });

      service.cancelarSolicitud.mockResolvedValue(respuesta);

      await expect(
        controller.cancelarSolicitud(
          'solicitud-1',
          dto,
          crearRequest('usuario-solicitante'),
        ),
      ).resolves.toBe(respuesta);

      expect(service.cancelarSolicitud).toHaveBeenCalledWith(
        'solicitud-1',
        'usuario-solicitante',
        dto,
      );
    });
  });

  function obtenerMetadata(clave: string, destino: object): unknown {
    return Reflect.getMetadata(clave, destino) as unknown;
  }

  function obtenerRuta(metodo: MetodoController): {
    path: unknown;
    method: unknown;
  } {
    const handler = SolicitudController.prototype[metodo] as object;

    return {
      path: obtenerMetadata(PATH_METADATA, handler),
      method: obtenerMetadata(METHOD_METADATA, handler),
    };
  }

  function crearRequest(usuarioId: string): RequestConUsuario {
    const usuario = new Usuario();
    usuario.id = usuarioId;

    return {
      user: usuario,
    } as RequestConUsuario;
  }

  function crearRespuesta(
    datos?: Partial<SolicitudResponseDto>,
  ): SolicitudResponseDto {
    return {
      id: 'solicitud-1',
      publicacionId: 'publicacion-1',
      solicitanteId: 'usuario-solicitante',
      creadorPublicacionId: 'usuario-creador',
      estado: EstadoSolicitud.PENDIENTE,
      mensaje: null,
      motivoRechazo: null,
      motivoCancelacion: null,
      createdAt: new Date('2026-06-24T09:00:00.000Z'),
      updatedAt: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    };
  }
});
