import { Logger } from '@nestjs/common';

import { EventoDominio } from 'src/compartidos/evento/eventoDominio';
import { PublicacionModeradaEvento } from 'src/publicacion/evento/publicacionModeradaEvento';

import { NotificacionResponseDto } from '../dtos/notificacionResponseDto';
import { TipoNotificacion } from '../enum/tipoNotificacion';
import { NotificacionService } from '../service/notificacionService';
import { NotificacionPublicacionListener } from './notificacionPublicacionListener';

type NotificacionServiceMock = jest.Mocked<Pick<NotificacionService, 'crear'>>;

type MetodoListener =
  | 'alPausarPublicacion'
  | 'alReactivarPublicacion'
  | 'alEliminarPublicacion';

type MetadataEvento = {
  event: EventoDominio;
  options?: {
    async?: boolean;
  };
};

describe('NotificacionPublicacionListener', () => {
  let listener: NotificacionPublicacionListener;
  let service: NotificacionServiceMock;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    service = {
      crear: jest.fn<
        ReturnType<NotificacionService['crear']>,
        Parameters<NotificacionService['crear']>
      >(),
    };

    service.crear.mockResolvedValue(crearRespuestaNotificacion());

    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    listener = new NotificacionPublicacionListener(
      service as unknown as NotificacionService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('metadata de eventos', () => {
    it.each([
      {
        metodo: 'alPausarPublicacion' as const,
        evento: EventoDominio.PUBLICACION_PAUSADA_MODERACION,
      },
      {
        metodo: 'alReactivarPublicacion' as const,
        evento: EventoDominio.PUBLICACION_REACTIVADA_MODERACION,
      },
      {
        metodo: 'alEliminarPublicacion' as const,
        evento: EventoDominio.PUBLICACION_ELIMINADA_MODERACION,
      },
    ])('escucha $evento de forma async en $metodo', ({ metodo, evento }) => {
      const metadata = obtenerMetadataEventos(metodo);

      expect(metadata).toHaveLength(1);
      expect(metadata[0]).toEqual({
        event: evento,
        options: { async: true },
      });
    });
  });

  describe('alPausarPublicacion', () => {
    it('crea una notificación de publicación pausada para el destinatario correcto', async () => {
      const evento = crearEvento({
        publicacionId: 'publicacion-1',
        destinatarioId: 'usuario-creador-1',
        publicacionTitulo: 'Campera de invierno',
      });

      await listener.alPausarPublicacion(evento);

      expect(service.crear).toHaveBeenCalledTimes(1);
      expect(service.crear).toHaveBeenCalledWith({
        destinatarioId: 'usuario-creador-1',
        tipo: TipoNotificacion.PUBLICACION_PAUSADA,
        titulo: 'Publicación pausada',
        mensaje:
          'Tu publicación "Campera de invierno" fue pausada por moderación.',
        publicacionId: 'publicacion-1',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('alReactivarPublicacion', () => {
    it('crea una notificación de publicación reactivada para el destinatario correcto', async () => {
      const evento = crearEvento({
        publicacionId: 'publicacion-2',
        destinatarioId: 'usuario-creador-2',
        publicacionTitulo: 'Mesa de madera',
      });

      await listener.alReactivarPublicacion(evento);

      expect(service.crear).toHaveBeenCalledTimes(1);
      expect(service.crear).toHaveBeenCalledWith({
        destinatarioId: 'usuario-creador-2',
        tipo: TipoNotificacion.PUBLICACION_REACTIVADA,
        titulo: 'Publicación reactivada',
        mensaje:
          'Tu publicación "Mesa de madera" fue reactivada por moderación.',
        publicacionId: 'publicacion-2',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('alEliminarPublicacion', () => {
    it('crea una notificación de publicación eliminada para el destinatario correcto', async () => {
      const evento = crearEvento({
        publicacionId: 'publicacion-3',
        destinatarioId: 'usuario-creador-3',
        publicacionTitulo: 'Silla infantil',
      });

      await listener.alEliminarPublicacion(evento);

      expect(service.crear).toHaveBeenCalledTimes(1);
      expect(service.crear).toHaveBeenCalledWith({
        destinatarioId: 'usuario-creador-3',
        tipo: TipoNotificacion.PUBLICACION_ELIMINADA,
        titulo: 'Publicación eliminada',
        mensaje:
          'Tu publicación "Silla infantil" fue eliminada por moderación.',
        publicacionId: 'publicacion-3',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('manejo de errores', () => {
    it.each([
      ['alPausarPublicacion' as const],
      ['alReactivarPublicacion' as const],
      ['alEliminarPublicacion' as const],
    ])(
      'no propaga el error si falla la creación de la notificación en %s',
      async (metodo) => {
        service.crear.mockRejectedValue(
          new Error('Error creando notificación'),
        );

        await expect(listener[metodo](crearEvento())).resolves.toBeUndefined();

        expect(service.crear).toHaveBeenCalledTimes(1);
      },
    );

    it('loguea el id de publicación y el mensaje del error cuando falla el service', async () => {
      service.crear.mockRejectedValue(new Error('Base de datos caída'));

      await listener.alEliminarPublicacion(
        crearEvento({
          publicacionId: 'publicacion-con-error',
        }),
      );

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudo crear la notificación para la publicación publicacion-con-error: Base de datos caída',
      );
    });

    it('loguea errores que no son instancia de Error sin romper el listener', async () => {
      service.crear.mockRejectedValue('fallo sin objeto Error');

      await expect(
        listener.alPausarPublicacion(
          crearEvento({
            publicacionId: 'publicacion-error-string',
          }),
        ),
      ).resolves.toBeUndefined();

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudo crear la notificación para la publicación publicacion-error-string: fallo sin objeto Error',
      );
    });
  });

  function crearEvento(
    datos?: Partial<{
      publicacionId: string;
      destinatarioId: string;
      publicacionTitulo: string;
    }>,
  ): PublicacionModeradaEvento {
    return new PublicacionModeradaEvento(
      datos?.publicacionId ?? 'publicacion-1',
      datos?.destinatarioId ?? 'destinatario-1',
      datos?.publicacionTitulo ?? 'Campera de invierno',
    );
  }

  function crearRespuestaNotificacion(
    datos?: Partial<NotificacionResponseDto>,
  ): NotificacionResponseDto {
    return {
      id: 'notificacion-1',
      tipo: TipoNotificacion.PUBLICACION_PAUSADA,
      titulo: 'Publicación pausada',
      mensaje:
        'Tu publicación "Campera de invierno" fue pausada por moderación.',
      leida: false,
      leidaEn: null,
      solicitudId: null,
      publicacionId: 'publicacion-1',
      denunciaId: null,
      creadaEn: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    };
  }

  function obtenerMetadataEventos(metodo: MetodoListener): MetadataEvento[] {
    const handler = NotificacionPublicacionListener.prototype[metodo] as object;
    const metadata = Reflect.getMetadata(
      'EVENT_LISTENER_METADATA',
      handler,
    ) as unknown;

    if (!Array.isArray(metadata)) {
      throw new Error(`No se encontró metadata de evento para ${metodo}`);
    }

    const metadataValidada: MetadataEvento[] = [];

    for (const item of metadata as unknown[]) {
      if (!esMetadataEvento(item)) {
        throw new Error(`Metadata de evento inválida para ${metodo}`);
      }

      metadataValidada.push(item);
    }

    return metadataValidada;
  }

  function esMetadataEvento(valor: unknown): valor is MetadataEvento {
    if (!esRegistro(valor)) {
      return false;
    }

    if (!Object.values(EventoDominio).includes(valor.event as EventoDominio)) {
      return false;
    }

    if (valor.options !== undefined && !esRegistro(valor.options)) {
      return false;
    }

    if (
      esRegistro(valor.options) &&
      valor.options.async !== undefined &&
      typeof valor.options.async !== 'boolean'
    ) {
      return false;
    }

    return true;
  }

  function esRegistro(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null;
  }
});
