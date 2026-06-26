import { Logger } from '@nestjs/common';

import { EventoDominio } from 'src/compartidos/evento/eventoDominio';
import { PublicacionEliminadaEvento } from 'src/publicacion/evento/publicacionEliminadaEvento';

import { SolicitudService } from '../service/solicitudService';
import { PublicacionEliminadaListener } from './publicacionEliminadaListener';

type SolicitudServiceMock = jest.Mocked<
  Pick<SolicitudService, 'resolverSolicitudesPorPublicacionEliminada'>
>;

type MetadataEvento = {
  event: EventoDominio;
  options?: {
    async?: boolean;
  };
};

describe('PublicacionEliminadaListener', () => {
  let listener: PublicacionEliminadaListener;
  let service: SolicitudServiceMock;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    service = {
      resolverSolicitudesPorPublicacionEliminada: jest.fn<
        ReturnType<
          SolicitudService['resolverSolicitudesPorPublicacionEliminada']
        >,
        Parameters<
          SolicitudService['resolverSolicitudesPorPublicacionEliminada']
        >
      >(),
    };

    service.resolverSolicitudesPorPublicacionEliminada.mockResolvedValue(0);

    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    listener = new PublicacionEliminadaListener(
      service as unknown as SolicitudService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('metadata de eventos', () => {
    it('escucha PUBLICACION_ELIMINADA de forma async', () => {
      const metadata = obtenerMetadataEventos();

      expect(metadata).toHaveLength(1);
      expect(metadata[0]).toEqual({
        event: EventoDominio.PUBLICACION_ELIMINADA,
        options: { async: true },
      });
    });
  });

  describe('alEliminarPublicacion', () => {
    it('resuelve las solicitudes asociadas a la publicación eliminada', async () => {
      const evento = crearEvento({
        publicacionId: 'publicacion-1',
        publicacionTitulo: 'Mesa de madera',
        eliminadaPorModeracion: true,
      });

      service.resolverSolicitudesPorPublicacionEliminada.mockResolvedValue(2);

      await listener.alEliminarPublicacion(evento);

      expect(
        service.resolverSolicitudesPorPublicacionEliminada,
      ).toHaveBeenCalledTimes(1);
      expect(
        service.resolverSolicitudesPorPublicacionEliminada,
      ).toHaveBeenCalledWith('publicacion-1', 'Mesa de madera', true);
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('mantiene el indicador de eliminación del creador cuando no fue por moderación', async () => {
      const evento = crearEvento({
        publicacionId: 'publicacion-2',
        publicacionTitulo: 'Silla infantil',
        eliminadaPorModeracion: false,
      });

      await listener.alEliminarPublicacion(evento);

      expect(
        service.resolverSolicitudesPorPublicacionEliminada,
      ).toHaveBeenCalledWith('publicacion-2', 'Silla infantil', false);
    });
  });

  describe('manejo de errores', () => {
    it('no propaga el error si falla la resolución de solicitudes', async () => {
      service.resolverSolicitudesPorPublicacionEliminada.mockRejectedValue(
        new Error('Base de datos caída'),
      );

      await expect(
        listener.alEliminarPublicacion(crearEvento()),
      ).resolves.toBeUndefined();

      expect(
        service.resolverSolicitudesPorPublicacionEliminada,
      ).toHaveBeenCalledTimes(1);
    });

    it('loguea el id de publicación y el mensaje del error cuando falla el service', async () => {
      service.resolverSolicitudesPorPublicacionEliminada.mockRejectedValue(
        new Error('Error resolviendo solicitudes'),
      );

      await listener.alEliminarPublicacion(
        crearEvento({ publicacionId: 'publicacion-con-error' }),
      );

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudieron resolver las solicitudes de la publicación publicacion-con-error: Error resolviendo solicitudes',
      );
    });

    it('loguea errores que no son instancia de Error sin romper el listener', async () => {
      service.resolverSolicitudesPorPublicacionEliminada.mockRejectedValue(
        'fallo sin objeto Error',
      );

      await expect(
        listener.alEliminarPublicacion(
          crearEvento({ publicacionId: 'publicacion-error-string' }),
        ),
      ).resolves.toBeUndefined();

      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'No se pudieron resolver las solicitudes de la publicación publicacion-error-string: fallo sin objeto Error',
      );
    });
  });

  function crearEvento(
    datos?: Partial<{
      publicacionId: string;
      publicacionTitulo: string;
      eliminadaPorModeracion: boolean;
    }>,
  ): PublicacionEliminadaEvento {
    return new PublicacionEliminadaEvento(
      datos?.publicacionId ?? 'publicacion-1',
      datos?.publicacionTitulo ?? 'Campera de invierno',
      datos?.eliminadaPorModeracion ?? true,
    );
  }

  function obtenerMetadataEventos(): MetadataEvento[] {
    const descriptor = Object.getOwnPropertyDescriptor(
      PublicacionEliminadaListener.prototype,
      'alEliminarPublicacion',
    );

    if (!descriptor?.value) {
      throw new Error('No se encontró el método alEliminarPublicacion');
    }

    const handler = descriptor.value as object;
    const metadata = Reflect.getMetadata(
      'EVENT_LISTENER_METADATA',
      handler,
    ) as unknown;

    if (!Array.isArray(metadata)) {
      throw new Error('No se encontró metadata de evento para el listener');
    }

    const metadataValidada: MetadataEvento[] = [];

    for (const item of metadata as unknown[]) {
      if (!esMetadataEvento(item)) {
        throw new Error('Metadata de evento inválida para el listener');
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

    return true;
  }

  function esRegistro(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null;
  }
});
