import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';

import { StatusGuard } from 'src/compartidos/guards/statusGuard';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { AuthGuard } from 'src/usuario/auth/authGuard';
import Usuario from 'src/usuario/entity/usuarioEntity';

import { ListadoNotificacionesResponseDto } from '../dtos/listadoNotificacionesResponseDto';
import { NotificacionResponseDto } from '../dtos/notificacionResponseDto';
import { PaginacionNotificacionDto } from '../dtos/paginacionNotificacionDto';
import { TipoNotificacion } from '../enum/tipoNotificacion';
import { NotificacionService } from '../service/notificacionService';
import { NotificacionController } from './notificacionController';

type NotificacionServiceMock = jest.Mocked<
  Pick<
    NotificacionService,
    | 'listarPropias'
    | 'contarNoLeidas'
    | 'marcarTodasComoLeidas'
    | 'marcarComoLeida'
  >
>;

type MetodoController =
  | 'listarPropias'
  | 'contarNoLeidas'
  | 'marcarTodasComoLeidas'
  | 'marcarComoLeida';

describe('NotificacionController', () => {
  let controller: NotificacionController;
  let service: NotificacionServiceMock;

  beforeEach(() => {
    service = {
      listarPropias: jest.fn<
        ReturnType<NotificacionService['listarPropias']>,
        Parameters<NotificacionService['listarPropias']>
      >(),
      contarNoLeidas: jest.fn<
        ReturnType<NotificacionService['contarNoLeidas']>,
        Parameters<NotificacionService['contarNoLeidas']>
      >(),
      marcarTodasComoLeidas: jest.fn<
        ReturnType<NotificacionService['marcarTodasComoLeidas']>,
        Parameters<NotificacionService['marcarTodasComoLeidas']>
      >(),
      marcarComoLeida: jest.fn<
        ReturnType<NotificacionService['marcarComoLeida']>,
        Parameters<NotificacionService['marcarComoLeida']>
      >(),
    };

    controller = new NotificacionController(
      service as unknown as NotificacionService,
    );
  });

  describe('metadata del controller', () => {
    it('usa AuthGuard y StatusGuard a nivel controller', () => {
      expect(obtenerMetadata(GUARDS_METADATA, NotificacionController)).toEqual([
        AuthGuard,
        StatusGuard,
      ]);
    });

    it('expone el path base correcto', () => {
      expect(obtenerMetadata(PATH_METADATA, NotificacionController)).toBe(
        'notificaciones',
      );
    });

    it('expone las rutas esperadas', () => {
      expect(obtenerRuta('listarPropias')).toEqual({
        path: '/',
        method: RequestMethod.GET,
      });

      expect(obtenerRuta('contarNoLeidas')).toEqual({
        path: 'no-leidas/cantidad',
        method: RequestMethod.GET,
      });

      expect(obtenerRuta('marcarTodasComoLeidas')).toEqual({
        path: 'marcar-todas-leidas',
        method: RequestMethod.PATCH,
      });

      expect(obtenerRuta('marcarComoLeida')).toEqual({
        path: ':id/marcar-leida',
        method: RequestMethod.PATCH,
      });
    });
  });

  describe('listarPropias', () => {
    it('lista notificaciones propias usando el id del usuario autenticado y la paginación recibida', async () => {
      const req = crearRequest('usuario-1');
      const paginacion: PaginacionNotificacionDto = {
        pagina: '2',
        limite: '10',
      };

      const respuesta = crearListado({
        notificaciones: [
          crearRespuestaNotificacion({ id: 'notificacion-1' }),
          crearRespuestaNotificacion({
            id: 'notificacion-2',
            tipo: TipoNotificacion.PUBLICACION_PAUSADA,
            titulo: 'Publicación pausada',
          }),
        ],
        total: 2,
        pagina: 2,
        limite: 10,
        totalPaginas: 1,
      });

      service.listarPropias.mockResolvedValue(respuesta);

      await expect(controller.listarPropias(req, paginacion)).resolves.toBe(
        respuesta,
      );

      expect(service.listarPropias).toHaveBeenCalledTimes(1);
      expect(service.listarPropias).toHaveBeenCalledWith(
        'usuario-1',
        paginacion,
      );

      expect(service.contarNoLeidas).not.toHaveBeenCalled();
      expect(service.marcarComoLeida).not.toHaveBeenCalled();
      expect(service.marcarTodasComoLeidas).not.toHaveBeenCalled();
    });

    it('delega la paginación vacía al service sin inventar valores en el controller', async () => {
      const paginacion: PaginacionNotificacionDto = {};
      const respuesta = crearListado();

      service.listarPropias.mockResolvedValue(respuesta);

      await expect(
        controller.listarPropias(crearRequest('usuario-1'), paginacion),
      ).resolves.toBe(respuesta);

      expect(service.listarPropias).toHaveBeenCalledWith(
        'usuario-1',
        paginacion,
      );
    });

    it('propaga errores del service al listar notificaciones propias', async () => {
      service.listarPropias.mockRejectedValue(new Error('Error al listar'));

      await expect(
        controller.listarPropias(crearRequest('usuario-1'), {}),
      ).rejects.toThrow('Error al listar');

      expect(service.listarPropias).toHaveBeenCalledWith('usuario-1', {});
    });
  });

  describe('contarNoLeidas', () => {
    it('devuelve la cantidad de no leídas del usuario autenticado', async () => {
      service.contarNoLeidas.mockResolvedValue(5);

      await expect(
        controller.contarNoLeidas(crearRequest('usuario-1')),
      ).resolves.toEqual({
        cantidad: 5,
      });

      expect(service.contarNoLeidas).toHaveBeenCalledTimes(1);
      expect(service.contarNoLeidas).toHaveBeenCalledWith('usuario-1');
      expect(service.listarPropias).not.toHaveBeenCalled();
    });

    it('devuelve cero cuando el usuario no tiene notificaciones no leídas', async () => {
      service.contarNoLeidas.mockResolvedValue(0);

      await expect(
        controller.contarNoLeidas(crearRequest('usuario-1')),
      ).resolves.toEqual({
        cantidad: 0,
      });

      expect(service.contarNoLeidas).toHaveBeenCalledWith('usuario-1');
    });

    it('propaga errores del service al contar no leídas', async () => {
      service.contarNoLeidas.mockRejectedValue(new Error('Error al contar'));

      await expect(
        controller.contarNoLeidas(crearRequest('usuario-1')),
      ).rejects.toThrow('Error al contar');

      expect(service.contarNoLeidas).toHaveBeenCalledWith('usuario-1');
    });
  });

  describe('marcarTodasComoLeidas', () => {
    it('marca todas las notificaciones como leídas para el usuario autenticado', async () => {
      service.marcarTodasComoLeidas.mockResolvedValue(undefined);

      await expect(
        controller.marcarTodasComoLeidas(crearRequest('usuario-1')),
      ).resolves.toBeUndefined();

      expect(service.marcarTodasComoLeidas).toHaveBeenCalledTimes(1);
      expect(service.marcarTodasComoLeidas).toHaveBeenCalledWith('usuario-1');
      expect(service.marcarComoLeida).not.toHaveBeenCalled();
    });

    it('propaga errores del service al marcar todas como leídas', async () => {
      service.marcarTodasComoLeidas.mockRejectedValue(
        new Error('Error al marcar todas'),
      );

      await expect(
        controller.marcarTodasComoLeidas(crearRequest('usuario-1')),
      ).rejects.toThrow('Error al marcar todas');

      expect(service.marcarTodasComoLeidas).toHaveBeenCalledWith('usuario-1');
    });
  });

  describe('marcarComoLeida', () => {
    it('marca una notificación propia como leída usando id de notificación e id de usuario', async () => {
      const respuesta = crearRespuestaNotificacion({
        id: 'notificacion-99',
        leida: true,
        leidaEn: new Date('2026-06-24T10:00:00.000Z'),
      });

      service.marcarComoLeida.mockResolvedValue(respuesta);

      await expect(
        controller.marcarComoLeida(
          'notificacion-99',
          crearRequest('usuario-1'),
        ),
      ).resolves.toBe(respuesta);

      expect(service.marcarComoLeida).toHaveBeenCalledTimes(1);
      expect(service.marcarComoLeida).toHaveBeenCalledWith(
        'notificacion-99',
        'usuario-1',
      );
      expect(service.marcarTodasComoLeidas).not.toHaveBeenCalled();
    });

    it('no confunde el id de la notificación con el id del usuario', async () => {
      const respuesta = crearRespuestaNotificacion({
        id: 'notificacion-distinta',
      });

      service.marcarComoLeida.mockResolvedValue(respuesta);

      await controller.marcarComoLeida(
        'notificacion-distinta',
        crearRequest('usuario-distinto'),
      );

      expect(service.marcarComoLeida).toHaveBeenCalledWith(
        'notificacion-distinta',
        'usuario-distinto',
      );
    });

    it('propaga errores del service al marcar una notificación como leída', async () => {
      service.marcarComoLeida.mockRejectedValue(
        new Error('Notificación no encontrada'),
      );

      await expect(
        controller.marcarComoLeida('notificacion-1', crearRequest('usuario-1')),
      ).rejects.toThrow('Notificación no encontrada');

      expect(service.marcarComoLeida).toHaveBeenCalledWith(
        'notificacion-1',
        'usuario-1',
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
    const handler = NotificacionController.prototype[metodo] as object;

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

  function crearListado(
    datos?: Partial<ListadoNotificacionesResponseDto>,
  ): ListadoNotificacionesResponseDto {
    return {
      notificaciones: [],
      total: 0,
      pagina: 1,
      limite: 20,
      totalPaginas: 0,
      ...datos,
    };
  }

  function crearRespuestaNotificacion(
    datos?: Partial<NotificacionResponseDto>,
  ): NotificacionResponseDto {
    return {
      id: 'notificacion-1',
      tipo: TipoNotificacion.SOLICITUD_CREADA,
      titulo: 'Nueva solicitud',
      mensaje: 'Recibiste una nueva solicitud.',
      leida: false,
      leidaEn: null,
      solicitudId: null,
      publicacionId: null,
      denunciaId: null,
      creadaEn: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    };
  }
});
