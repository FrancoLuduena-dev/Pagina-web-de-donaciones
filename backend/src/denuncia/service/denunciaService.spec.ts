import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { Publicacion } from 'src/publicacion/entity/publicacionEntity';
import { CondicionObjeto } from 'src/publicacion/enums/condicionObjeto';
import { EstadoPublicacion } from 'src/publicacion/enums/estadoPublicacion';
import { PublicacionService } from 'src/publicacion/service/publicacionService';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';
import UsuarioService from 'src/usuario/service/usuarioService';

import { Denuncia } from '../entity/denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { DenunciaRepository } from '../repository/denunciaRepository';
import { DenunciaService } from './denunciaService';

type FiltrosDenuncia = {
  estado?: EstadoDenuncia;
  publicacionId?: string;
};

type DenunciaRepositoryMock = {
  buscarPorId: jest.MockedFunction<(id: string) => Promise<Denuncia | null>>;
  buscarPorDenuncianteYPublicacion: jest.MockedFunction<
    (denuncianteId: string, publicacionId: string) => Promise<Denuncia | null>
  >;
  crear: jest.MockedFunction<(datos: Partial<Denuncia>) => Denuncia>;
  guardar: jest.MockedFunction<(denuncia: Denuncia) => Promise<Denuncia>>;
  listar: jest.MockedFunction<
    (filtros: FiltrosDenuncia) => Promise<Denuncia[]>
  >;
};

type PublicacionServiceMock = {
  buscarPublicacionPorId: jest.MockedFunction<
    (id: string) => Promise<Publicacion>
  >;
  pausar: jest.MockedFunction<
    (
      id: string,
      usuarioId: string,
      usuarioRol: rolUsuario,
    ) => Promise<Publicacion>
  >;
  eliminar: jest.MockedFunction<
    (
      id: string,
      usuarioId: string,
      usuarioRol: rolUsuario,
    ) => Promise<Publicacion>
  >;
};

type UsuarioServiceMock = {
  BloquearUsuario: jest.MockedFunction<
    (
      idUsuario: string,
      idModerador: string,
      datos: { razonBloqueo: string },
    ) => Promise<void>
  >;
  registrarPublicacionEliminadaPorModeracion: jest.MockedFunction<
    (idUsuario: string, idModerador: string) => Promise<void>
  >;
};

type ManagerMock = {
  findOne: jest.MockedFunction<
    (
      entity: typeof Denuncia,
      options: {
        where: { id: string };
        lock: { mode: 'pessimistic_write' };
      },
    ) => Promise<Denuncia | null>
  >;
  save: jest.MockedFunction<(denuncia: Denuncia) => Promise<Denuncia>>;
};

describe('DenunciaService', () => {
  let service: DenunciaService;
  let repository: DenunciaRepositoryMock;
  let publicacionService: PublicacionServiceMock;
  let usuarioService: UsuarioServiceMock;
  let manager: ManagerMock;
  let transactionMock: jest.MockedFunction<
    <T>(operacion: (manager: EntityManager) => Promise<T>) => Promise<T>
  >;

  beforeEach(() => {
    repository = {
      buscarPorId: jest.fn(),
      buscarPorDenuncianteYPublicacion: jest.fn(),
      crear: jest.fn(
        (datos: Partial<Denuncia>): Denuncia =>
          Object.assign(new Denuncia(), datos),
      ),
      guardar: jest.fn(
        (denuncia: Denuncia): Promise<Denuncia> => Promise.resolve(denuncia),
      ),
      listar: jest.fn(),
    };

    publicacionService = {
      buscarPublicacionPorId: jest.fn(),
      pausar: jest.fn(),
      eliminar: jest.fn(),
    };

    usuarioService = {
      BloquearUsuario: jest.fn<
        Promise<void>,
        [string, string, { razonBloqueo: string }]
      >(() => Promise.resolve()),

      registrarPublicacionEliminadaPorModeracion: jest.fn<
        Promise<void>,
        [string, string]
      >(() => Promise.resolve()),
    };

    manager = {
      findOne: jest.fn(),
      save: jest.fn(
        (denuncia: Denuncia): Promise<Denuncia> => Promise.resolve(denuncia),
      ),
    };

    const ejecutarTransaccion = <T>(
      operacion: (manager: EntityManager) => Promise<T>,
    ): Promise<T> => operacion(manager as unknown as EntityManager);

    transactionMock = jest.fn(ejecutarTransaccion);

    const dataSourceMock = {
      transaction: transactionMock,
    };

    service = new DenunciaService(
      repository as unknown as DenunciaRepository,
      publicacionService as unknown as PublicacionService,
      usuarioService as unknown as UsuarioService,
      dataSourceMock as unknown as DataSource,
    );
  });

  describe('crearDenuncia', () => {
    it('crea una denuncia pendiente cuando la publicación existe y no hay denuncia previa', async () => {
      const publicacion = crearPublicacion();
      const denuncia = crearDenuncia({
        publicacionId: publicacion.id,
        creadorPublicacionId: publicacion.creadorId,
        comentario: 'La publicación contiene información engañosa.',
      });

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      repository.buscarPorDenuncianteYPublicacion.mockResolvedValue(null);
      repository.crear.mockReturnValue(denuncia);
      repository.guardar.mockResolvedValue(denuncia);

      const resultado = await service.crearDenuncia(denuncia.denuncianteId, {
        publicacionId: publicacion.id,
        motivo: denuncia.motivo,
        comentario: denuncia.comentario ?? undefined,
      });

      expect(publicacionService.buscarPublicacionPorId).toHaveBeenCalledWith(
        publicacion.id,
      );
      expect(repository.buscarPorDenuncianteYPublicacion).toHaveBeenCalledWith(
        denuncia.denuncianteId,
        publicacion.id,
      );
      expect(repository.crear).toHaveBeenCalledWith({
        publicacionId: publicacion.id,
        denuncianteId: denuncia.denuncianteId,
        creadorPublicacionId: publicacion.creadorId,
        motivo: denuncia.motivo,
        comentario: denuncia.comentario,
        estado: EstadoDenuncia.PENDIENTE,
        version: 1,
      });
      expect(repository.guardar).toHaveBeenCalledWith(denuncia);
      expect(resultado).toEqual(
        expect.objectContaining({
          id: denuncia.id,
          estado: EstadoDenuncia.PENDIENTE,
          version: 1,
        }),
      );
    });

    it('guarda comentario null cuando no se informa comentario', async () => {
      const publicacion = crearPublicacion();
      const denuncia = crearDenuncia({
        publicacionId: publicacion.id,
        comentario: null,
      });

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      repository.buscarPorDenuncianteYPublicacion.mockResolvedValue(null);
      repository.crear.mockReturnValue(denuncia);
      repository.guardar.mockResolvedValue(denuncia);

      await service.crearDenuncia(denuncia.denuncianteId, {
        publicacionId: publicacion.id,
        motivo: denuncia.motivo,
      });

      expect(repository.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          comentario: null,
        }),
      );
    });

    it('rechaza denunciar una publicación propia y no consulta duplicados ni guarda', async () => {
      const publicacion = crearPublicacion();
      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);

      await expect(
        service.crearDenuncia(publicacion.creadorId, {
          publicacionId: publicacion.id,
          motivo: MotivoDenuncia.OBJETO_PROHIBIDO,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(
        repository.buscarPorDenuncianteYPublicacion,
      ).not.toHaveBeenCalled();
      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('rechaza una denuncia duplicada y no crea una nueva', async () => {
      const publicacion = crearPublicacion();
      const denuncia = crearDenuncia({ publicacionId: publicacion.id });

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      repository.buscarPorDenuncianteYPublicacion.mockResolvedValue(denuncia);

      await expect(
        service.crearDenuncia(denuncia.denuncianteId, {
          publicacionId: publicacion.id,
          motivo: denuncia.motivo,
        }),
      ).rejects.toThrow('DENUNCIA_DUPLICADA');

      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('propaga NotFoundException si la publicación no existe', async () => {
      publicacionService.buscarPublicacionPorId.mockRejectedValue(
        new NotFoundException('Publicación no encontrada'),
      );

      await expect(
        service.crearDenuncia('11111111-1111-4111-8111-111111111111', {
          publicacionId: '22222222-2222-4222-8222-222222222222',
          motivo: MotivoDenuncia.PUBLICACION_FALSA,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(
        repository.buscarPorDenuncianteYPublicacion,
      ).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
    });
  });

  describe('listar y detalle', () => {
    it('lista denuncias aplicando filtros y mapea la respuesta', async () => {
      const denuncias = [
        crearDenuncia({ id: '11111111-1111-4111-8111-111111111111' }),
        crearDenuncia({ id: '22222222-2222-4222-8222-222222222222' }),
      ];
      const filtros: FiltrosDenuncia = {
        estado: EstadoDenuncia.PENDIENTE,
      };

      repository.listar.mockResolvedValue(denuncias);

      const resultado = await service.listar(filtros);

      expect(repository.listar).toHaveBeenCalledWith(filtros);
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual(
        expect.objectContaining({ id: denuncias[0].id }),
      );
    });

    it('devuelve detalle de una denuncia existente', async () => {
      const denuncia = crearDenunciaEnRevision();
      repository.buscarPorId.mockResolvedValue(denuncia);

      const resultado = await service.buscarDetallePorId(denuncia.id);

      expect(repository.buscarPorId).toHaveBeenCalledWith(denuncia.id);
      expect(resultado).toEqual(
        expect.objectContaining({
          id: denuncia.id,
          estado: denuncia.estado,
          version: denuncia.version,
        }),
      );
    });

    it('lanza NotFoundException si no encuentra el detalle', async () => {
      repository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.buscarDetallePorId('11111111-1111-4111-8111-111111111111'),
      ).rejects.toThrow('DENUNCIA_NO_ENCONTRADA');
    });
  });

  describe('tomarDenuncia', () => {
    it('toma la denuncia usando transacción y bloqueo pesimista', async () => {
      const denuncia = crearDenuncia();
      manager.findOne.mockResolvedValue(denuncia);

      const resultado = await service.tomarDenuncia(
        denuncia.id,
        moderadorId(),
        {
          version: 1,
        },
      );

      expect(transactionMock).toHaveBeenCalledTimes(1);
      expect(manager.findOne).toHaveBeenCalledWith(Denuncia, {
        where: { id: denuncia.id },
        lock: { mode: 'pessimistic_write' },
      });
      expect(manager.save).toHaveBeenCalledWith(denuncia);
      expect(resultado.estado).toBe(EstadoDenuncia.EN_REVISION);
      expect(resultado.moderadorAsignadoId).toBe(moderadorId());
      expect(resultado.version).toBe(2);
    });

    it('lanza NotFoundException si la denuncia a tomar no existe', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.tomarDenuncia(
          '11111111-1111-4111-8111-111111111111',
          moderadorId(),
          {
            version: 1,
          },
        ),
      ).rejects.toThrow('DENUNCIA_NO_ENCONTRADA');

      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rechaza versión vencida sin mutar ni guardar', async () => {
      const denuncia = crearDenuncia({ version: 2 });
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.tomarDenuncia(denuncia.id, moderadorId(), { version: 1 }),
      ).rejects.toThrow('CONFLICTO_CONCURRENCIA');

      expect(denuncia.estado).toBe(EstadoDenuncia.PENDIENTE);
      expect(denuncia.moderadorAsignadoId).toBeNull();
      expect(denuncia.version).toBe(2);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('no permite tomar una denuncia ya en revisión', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.tomarDenuncia(denuncia.id, otroModeradorId(), {
          version: denuncia.version,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(denuncia.estado).toBe(EstadoDenuncia.EN_REVISION);
      expect(denuncia.moderadorAsignadoId).toBe(moderadorId());
      expect(denuncia.version).toBe(2);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('no permite tomar una denuncia resuelta', async () => {
      const denuncia = crearDenunciaResuelta();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.tomarDenuncia(denuncia.id, otroModeradorId(), {
          version: denuncia.version,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('resolverDenuncia', () => {
    it('rechaza versión vencida antes de ejecutar acciones de moderación', async () => {
      const denuncia = crearDenunciaEnRevision({ version: 3 });
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(denuncia.id, moderadorId(), {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
          detalleResolucion: 'Resolución desactualizada.',
        }),
      ).rejects.toThrow('CONFLICTO_CONCURRENCIA');

      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(publicacionService.eliminar).not.toHaveBeenCalled();
      expect(usuarioService.BloquearUsuario).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rechaza resolver una denuncia pendiente sin ejecutar acciones', async () => {
      const denuncia = crearDenuncia();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(denuncia.id, moderadorId(), {
          version: 1,
          tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
          detalleResolucion: 'Se intenta resolver sin tomarla.',
        }),
      ).rejects.toThrow('DENUNCIA_DEBE_ESTAR_EN_REVISION');

      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rechaza que otro moderador resuelva una denuncia asignada', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(denuncia.id, otroModeradorId(), {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
          detalleResolucion: 'Otro moderador intenta resolver.',
        }),
      ).rejects.toThrow('SOLO_MODERADOR_ASIGNADO_PUEDE_RESOLVER');

      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rechaza resolver una denuncia ya resuelta antes de ejecutar acciones', async () => {
      const denuncia = crearDenunciaResuelta();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(denuncia.id, moderadorId(), {
          version: denuncia.version,
          tipoResolucion: TipoResolucion.DESCARTADA,
          detalleResolucion: 'La denuncia ya estaba resuelta.',
        }),
      ).rejects.toThrow('DENUNCIA_YA_RESUELTA');

      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(publicacionService.eliminar).not.toHaveBeenCalled();
      expect(usuarioService.BloquearUsuario).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('resuelve como DESCARTADA sin aplicar sanciones', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      const resultado = await service.resolverDenuncia(
        denuncia.id,
        moderadorId(),
        {
          version: 2,
          tipoResolucion: TipoResolucion.DESCARTADA,
          detalleResolucion: 'La denuncia no corresponde.',
        },
      );

      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(publicacionService.eliminar).not.toHaveBeenCalled();
      expect(usuarioService.BloquearUsuario).not.toHaveBeenCalled();
      expect(
        usuarioService.registrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledWith(denuncia);
      expect(resultado.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(resultado.tipoResolucion).toBe(TipoResolucion.DESCARTADA);
      expect(resultado.version).toBe(3);
    });

    it('resuelve con PUBLICACION_PAUSADA pausando la publicación', async () => {
      const denuncia = crearDenunciaEnRevision();
      const publicacion = crearPublicacion({ id: denuncia.publicacionId });
      manager.findOne.mockResolvedValue(denuncia);
      publicacionService.pausar.mockResolvedValue(publicacion);

      const resultado = await service.resolverDenuncia(
        denuncia.id,
        moderadorId(),
        {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
          detalleResolucion: 'Se pausa la publicación denunciada.',
        },
      );

      expect(publicacionService.pausar).toHaveBeenCalledWith(
        denuncia.publicacionId,
        moderadorId(),
        rolUsuario.usuarioModerador,
      );
      expect(publicacionService.eliminar).not.toHaveBeenCalled();
      expect(
        usuarioService.registrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
      expect(resultado.tipoResolucion).toBe(TipoResolucion.PUBLICACION_PAUSADA);
    });

    it('resuelve con PUBLICACION_ELIMINADA delegando la eliminación sin duplicar contador', async () => {
      const denuncia = crearDenunciaEnRevision();
      const publicacion = crearPublicacion({ id: denuncia.publicacionId });
      manager.findOne.mockResolvedValue(denuncia);
      publicacionService.eliminar.mockResolvedValue(publicacion);

      const resultado = await service.resolverDenuncia(
        denuncia.id,
        moderadorId(),
        {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_ELIMINADA,
          detalleResolucion: 'Se elimina la publicación denunciada.',
        },
      );

      expect(publicacionService.eliminar).toHaveBeenCalledWith(
        denuncia.publicacionId,
        moderadorId(),
        rolUsuario.usuarioModerador,
      );
      expect(
        usuarioService.registrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
      expect(usuarioService.BloquearUsuario).not.toHaveBeenCalled();
      expect(resultado.tipoResolucion).toBe(
        TipoResolucion.PUBLICACION_ELIMINADA,
      );
    });

    it('resuelve con USUARIO_BLOQUEADO bloqueando al creador de la publicación', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      const resultado = await service.resolverDenuncia(
        denuncia.id,
        moderadorId(),
        {
          version: 2,
          tipoResolucion: TipoResolucion.USUARIO_BLOQUEADO,
          detalleResolucion: 'El usuario incumplió reiteradamente las reglas.',
        },
      );

      expect(usuarioService.BloquearUsuario).toHaveBeenCalledWith(
        denuncia.creadorPublicacionId,
        moderadorId(),
        {
          razonBloqueo: 'El usuario incumplió reiteradamente las reglas.',
        },
      );
      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(publicacionService.eliminar).not.toHaveBeenCalled();
      expect(resultado.tipoResolucion).toBe(TipoResolucion.USUARIO_BLOQUEADO);
    });

    it('no guarda la denuncia si falla la acción de moderación', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);
      publicacionService.eliminar.mockRejectedValue(
        new Error('No se pudo eliminar la publicación'),
      );

      await expect(
        service.resolverDenuncia(denuncia.id, moderadorId(), {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_ELIMINADA,
          detalleResolucion: 'Se elimina la publicación denunciada.',
        }),
      ).rejects.toThrow('No se pudo eliminar la publicación');

      expect(manager.save).not.toHaveBeenCalled();
      expect(denuncia.estado).toBe(EstadoDenuncia.EN_REVISION);
      expect(denuncia.tipoResolucion).toBeNull();
      expect(denuncia.version).toBe(2);
    });

    it('rechaza un tipo de resolución inválido sin guardar', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(denuncia.id, moderadorId(), {
          version: 2,
          tipoResolucion: 'INVALIDA' as TipoResolucion,
          detalleResolucion: 'Resolución inválida.',
        }),
      ).rejects.toThrow('TIPO_RESOLUCION_INVALIDO');

      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  function crearDenuncia(datos?: Partial<Denuncia>): Denuncia {
    return Object.assign(new Denuncia(), {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      publicacionId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      denuncianteId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      creadorPublicacionId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
      comentario: null,
      estado: EstadoDenuncia.PENDIENTE,
      moderadorAsignadoId: null,
      tipoResolucion: null,
      detalleResolucion: null,
      fechaResolucion: null,
      version: 1,
      fechaCreacion: new Date('2026-06-24T09:00:00.000Z'),
      fechaActualizacion: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    });
  }

  function crearDenunciaEnRevision(datos?: Partial<Denuncia>): Denuncia {
    return crearDenuncia({
      estado: EstadoDenuncia.EN_REVISION,
      moderadorAsignadoId: moderadorId(),
      version: 2,
      ...datos,
    });
  }

  function crearDenunciaResuelta(datos?: Partial<Denuncia>): Denuncia {
    return crearDenuncia({
      estado: EstadoDenuncia.RESUELTA,
      moderadorAsignadoId: moderadorId(),
      tipoResolucion: TipoResolucion.DESCARTADA,
      detalleResolucion: 'La denuncia fue descartada.',
      fechaResolucion: new Date('2026-06-24T10:00:00.000Z'),
      version: 3,
      ...datos,
    });
  }

  function crearPublicacion(datos?: Partial<Publicacion>): Publicacion {
    return Object.assign(new Publicacion(), {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      creadorId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      titulo: 'Publicación de prueba',
      descripcion: 'Descripción suficientemente extensa para la publicación.',
      categoriaId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      localidadId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/imagen.jpg'],
      estado: EstadoPublicacion.DISPONIBLE,
      version: 1,
      createdAt: new Date('2026-06-24T09:00:00.000Z'),
      updatedAt: new Date('2026-06-24T09:00:00.000Z'),
      deletedAt: null,
      solicitudes: [],
      ...datos,
    });
  }

  function moderadorId(): string {
    return '11111111-1111-4111-8111-111111111111';
  }

  function otroModeradorId(): string {
    return '22222222-2222-4222-8222-222222222222';
  }
});
