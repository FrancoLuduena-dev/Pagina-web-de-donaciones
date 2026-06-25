import { Logger } from '@nestjs/common';

import { EventoDominio } from 'src/compartidos/evento/eventoDominio';
import { SolicitudAceptadaCanceladaEvento } from 'src/solicitudes/evento/solicitudAceptadaCanceladaEvento';
import { SolicitudAceptadaEvent } from 'src/solicitudes/evento/solicitudAceptadaEvento';
import { SolicitudCreadaEvent } from 'src/solicitudes/evento/solicitudCreadaEvento';
import { SolicitudFinalizadaEvento } from 'src/solicitudes/evento/solicitudFinalizadaEvento';
import { SolicitudRechazadaEvent } from 'src/solicitudes/evento/solicitudRechazadaEvento';

import { NotificacionResponseDto } from '../dtos/notificacionResponseDto';
import { TipoNotificacion } from '../enum/tipoNotificacion';
import { NotificacionService } from '../service/notificacionService';
import { NotificacionSolicitudListener } from './notificacionSolicitudListener';

type NotificacionServiceMock = jest.Mocked<Pick<NotificacionService, 'crear'>>;

type MetodoListener =
  | 'alCrearSolicitud'
  | 'alRechazarSolicitud'
  | 'alAceptarSolicitud'
  | 'alCancelarSolicitudAceptada'
  | 'alFinalizarSolicitud';

type MetadataEvento = {
  event: EventoDominio;
  options?: {
    async?: boolean;
  };
};

describe('NotificacionSolicitudListener', () => {
  let listener: NotificacionSolicitudListener;
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

    listener = new NotificacionSolicitudListener(
      service as unknown as NotificacionService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('metadata de eventos', () => {
    it.each([
      {
        metodo: 'alCrearSolicitud' as const,
        evento: EventoDominio.SOLICITUD_CREADA,
      },
      {
        metodo: 'alRechazarSolicitud' as const,
        evento: EventoDominio.SOLICITUD_RECHAZADA,
      },
      {
        metodo: 'alAceptarSolicitud' as const,
        evento: EventoDominio.SOLICITUD_ACEPTADA,
      },
      {
        metodo: 'alCancelarSolicitudAceptada' as const,
        evento: EventoDominio.SOLICITUD_ACEPTADA_CANCELADA,
      },
      {
        metodo: 'alFinalizarSolicitud' as const,
        evento: EventoDominio.SOLICITUD_FINALIZADA,
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

  describe('alCrearSolicitud', () => {
    it('crea una notificación para el dueño de la publicación cuando llega una solicitud nueva', async () => {
      const evento = new SolicitudCreadaEvent(
        'solicitud-1',
        'destinatario-1',
        'Mesa de madera',
      );

      await listener.alCrearSolicitud(evento);

      expect(service.crear).toHaveBeenCalledTimes(1);
      expect(service.crear).toHaveBeenCalledWith({
        destinatarioId: 'destinatario-1',
        tipo: TipoNotificacion.SOLICITUD_CREADA,
        titulo: 'Nueva solicitud',
        mensaje: 'Recibiste una nueva solicitud para "Mesa de madera".',
        solicitudId: 'solicitud-1',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('alRechazarSolicitud', () => {
    it.each([
      {
        descripcion: 'con motivo',
        motivo: 'No cumple condiciones',
        mensaje:
          'Tu solicitud para "Mesa de madera" fue rechazada. Motivo: No cumple condiciones',
      },
      {
        descripcion: 'con motivo null',
        motivo: null,
        mensaje: 'Tu solicitud para "Mesa de madera" fue rechazada.',
      },
      {
        descripcion: 'sin motivo',
        motivo: undefined,
        mensaje: 'Tu solicitud para "Mesa de madera" fue rechazada.',
      },
      {
        descripcion: 'con motivo vacío',
        motivo: '',
        mensaje: 'Tu solicitud para "Mesa de madera" fue rechazada.',
      },
    ])(
      'crea una notificación de solicitud rechazada $descripcion',
      async ({ motivo, mensaje }) => {
        const evento = new SolicitudRechazadaEvent(
          'solicitud-2',
          'destinatario-2',
          'Mesa de madera',
          motivo,
        );

        await listener.alRechazarSolicitud(evento);

        expect(service.crear).toHaveBeenCalledTimes(1);
        expect(service.crear).toHaveBeenCalledWith({
          destinatarioId: 'destinatario-2',
          tipo: TipoNotificacion.SOLICITUD_RECHAZADA,
          titulo: 'Solicitud rechazada',
          mensaje,
          solicitudId: 'solicitud-2',
        });
        expect(loggerErrorSpy).not.toHaveBeenCalled();
      },
    );
  });

  describe('alAceptarSolicitud', () => {
    it('crea una notificación cuando la solicitud es aceptada', async () => {
      const evento = new SolicitudAceptadaEvent(
        'solicitud-3',
        'destinatario-3',
        'Bicicleta infantil',
      );

      await listener.alAceptarSolicitud(evento);

      expect(service.crear).toHaveBeenCalledTimes(1);
      expect(service.crear).toHaveBeenCalledWith({
        destinatarioId: 'destinatario-3',
        tipo: TipoNotificacion.SOLICITUD_ACEPTADA,
        titulo: 'Solicitud aceptada',
        mensaje: 'Tu solicitud para "Bicicleta infantil" fue aceptada.',
        solicitudId: 'solicitud-3',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('alCancelarSolicitudAceptada', () => {
    it.each([
      {
        descripcion: 'con motivo',
        motivo: 'El donante no puede entregar el objeto',
        mensaje:
          'La aceptación de tu solicitud para "Mesa de madera" fue cancelada. Motivo: El donante no puede entregar el objeto',
      },
      {
        descripcion: 'con motivo null',
        motivo: null,
        mensaje:
          'La aceptación de tu solicitud para "Mesa de madera" fue cancelada.',
      },
      {
        descripcion: 'sin motivo',
        motivo: undefined,
        mensaje:
          'La aceptación de tu solicitud para "Mesa de madera" fue cancelada.',
      },
      {
        descripcion: 'con motivo vacío',
        motivo: '',
        mensaje:
          'La aceptación de tu solicitud para "Mesa de madera" fue cancelada.',
      },
    ])(
      'crea una notificación de cancelación de solicitud aceptada $descripcion',
      async ({ motivo, mensaje }) => {
        const evento = new SolicitudAceptadaCanceladaEvento(
          'solicitud-4',
          'destinatario-4',
          'Mesa de madera',
          motivo,
        );

        await listener.alCancelarSolicitudAceptada(evento);

        expect(service.crear).toHaveBeenCalledTimes(1);
        expect(service.crear).toHaveBeenCalledWith({
          destinatarioId: 'destinatario-4',
          tipo: TipoNotificacion.SOLICITUD_ACEPTADA_CANCELADA,
          titulo: 'Solicitud aceptada cancelada',
          mensaje,
          solicitudId: 'solicitud-4',
        });
        expect(loggerErrorSpy).not.toHaveBeenCalled();
      },
    );
  });

  describe('alFinalizarSolicitud', () => {
    it('crea una notificación cuando la entrega se marca como finalizada', async () => {
      const evento = new SolicitudFinalizadaEvento(
        'solicitud-5',
        'destinatario-5',
        'Heladera',
      );

      await listener.alFinalizarSolicitud(evento);

      expect(service.crear).toHaveBeenCalledTimes(1);
      expect(service.crear).toHaveBeenCalledWith({
        destinatarioId: 'destinatario-5',
        tipo: TipoNotificacion.SOLICITUD_FINALIZADA,
        titulo: 'Entrega finalizada',
        mensaje: 'La entrega de "Heladera" fue marcada como finalizada.',
        solicitudId: 'solicitud-5',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('manejo de errores', () => {
    it.each([
      {
        metodo: 'alCrearSolicitud' as const,
        evento: new SolicitudCreadaEvent(
          'solicitud-error-1',
          'destinatario-1',
          'Mesa',
        ),
      },
      {
        metodo: 'alRechazarSolicitud' as const,
        evento: new SolicitudRechazadaEvent(
          'solicitud-error-2',
          'destinatario-2',
          'Mesa',
          'Motivo',
        ),
      },
      {
        metodo: 'alAceptarSolicitud' as const,
        evento: new SolicitudAceptadaEvent(
          'solicitud-error-3',
          'destinatario-3',
          'Mesa',
        ),
      },
      {
        metodo: 'alCancelarSolicitudAceptada' as const,
        evento: new SolicitudAceptadaCanceladaEvento(
          'solicitud-error-4',
          'destinatario-4',
          'Mesa',
          'Motivo',
        ),
      },
      {
        metodo: 'alFinalizarSolicitud' as const,
        evento: new SolicitudFinalizadaEvento(
          'solicitud-error-5',
          'destinatario-5',
          'Mesa',
        ),
      },
    ])(
      'no propaga el error si falla crear notificación en $metodo',
      async ({ metodo, evento }) => {
        service.crear.mockRejectedValue(
          new Error('Error creando notificación'),
        );

        await expect(listener[metodo](evento)).resolves.toBeUndefined();

        expect(service.crear).toHaveBeenCalledTimes(1);
      },
    );

    it('loguea el error al fallar la notificación de solicitud creada', async () => {
      service.crear.mockRejectedValue(new Error('Base de datos caída'));

      await listener.alCrearSolicitud(
        new SolicitudCreadaEvent('solicitud-log-1', 'destinatario-1', 'Mesa'),
      );

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudo crear la notificación para la solicitud solicitud-log-1: Base de datos caída',
      );
    });

    it('loguea el error al fallar la notificación de rechazo', async () => {
      service.crear.mockRejectedValue(new Error('Base de datos caída'));

      await listener.alRechazarSolicitud(
        new SolicitudRechazadaEvent(
          'solicitud-log-2',
          'destinatario-2',
          'Mesa',
          'Motivo',
        ),
      );

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudo crear la notificación de rechazo para la solicitud solicitud-log-2: Base de datos caída',
      );
    });

    it('loguea el error al fallar la notificación de aceptación', async () => {
      service.crear.mockRejectedValue(new Error('Base de datos caída'));

      await listener.alAceptarSolicitud(
        new SolicitudAceptadaEvent('solicitud-log-3', 'destinatario-3', 'Mesa'),
      );

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudo crear la notificación de aceptación para la solicitud solicitud-log-3: Base de datos caída',
      );
    });

    it('loguea el error al fallar la notificación de cancelación', async () => {
      service.crear.mockRejectedValue(new Error('Base de datos caída'));

      await listener.alCancelarSolicitudAceptada(
        new SolicitudAceptadaCanceladaEvento(
          'solicitud-log-4',
          'destinatario-4',
          'Mesa',
          'Motivo',
        ),
      );

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudo crear la notificación de cancelación para la solicitud solicitud-log-4: Base de datos caída',
      );
    });

    it('loguea el error al fallar la notificación de finalización', async () => {
      service.crear.mockRejectedValue(new Error('Base de datos caída'));

      await listener.alFinalizarSolicitud(
        new SolicitudFinalizadaEvento(
          'solicitud-log-5',
          'destinatario-5',
          'Mesa',
        ),
      );

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudo crear la notificación de finalización para la solicitud solicitud-log-5: Base de datos caída',
      );
    });

    it('loguea errores que no son instancia de Error sin romper el listener', async () => {
      service.crear.mockRejectedValue('fallo sin objeto Error');

      await expect(
        listener.alCrearSolicitud(
          new SolicitudCreadaEvent(
            'solicitud-error-string',
            'destinatario-1',
            'Mesa',
          ),
        ),
      ).resolves.toBeUndefined();

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudo crear la notificación para la solicitud solicitud-error-string: fallo sin objeto Error',
      );
    });
  });

  function crearRespuestaNotificacion(
    datos?: Partial<NotificacionResponseDto>,
  ): NotificacionResponseDto {
    return {
      id: 'notificacion-1',
      tipo: TipoNotificacion.SOLICITUD_CREADA,
      titulo: 'Nueva solicitud',
      mensaje: 'Recibiste una nueva solicitud para "Mesa de madera".',
      leida: false,
      leidaEn: null,
      solicitudId: 'solicitud-1',
      publicacionId: null,
      denunciaId: null,
      creadaEn: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    };
  }

  function obtenerMetadataEventos(metodo: MetodoListener): MetadataEvento[] {
    const handler = NotificacionSolicitudListener.prototype[metodo] as object;
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
