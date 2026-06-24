import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { Publicacion } from '../../publicacion/entity/publicacionEntity';
import { PublicacionService } from '../../publicacion/service/publicacionService';
import UsuarioService from '../../usuario/service/usuarioService';
import { Denuncia } from '../entity/denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { DenunciaRepository } from '../repository/denunciaRepository';
import { DenunciaService } from './denunciaService';

describe('DenunciaService', () => {
  let service: DenunciaService;
  let repository: {
    buscarPorId: jest.Mock;
    buscarPorDenuncianteYPublicacion: jest.Mock;
    crear: jest.Mock;
    guardar: jest.Mock;
    listar: jest.Mock;
  };
  let manager: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let publicacionService: {
    buscarPublicacionPorId: jest.Mock;
    pausar: jest.Mock;
    eliminar: jest.Mock;
  };
  let usuarioService: {
    BloquearUsuario: jest.Mock;
    RegistrarPublicacionEliminadaPorModeracion: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      buscarPorId: jest.fn(),
      buscarPorDenuncianteYPublicacion: jest.fn(),
      crear: jest.fn((datos: Partial<Denuncia>) =>
        Object.assign(new Denuncia(), datos),
      ),
      guardar: jest.fn((denuncia: Denuncia) => Promise.resolve(denuncia)),
      listar: jest.fn(),
    };

    manager = {
      findOne: jest.fn(),
      save: jest.fn((denuncia: Denuncia) => Promise.resolve(denuncia)),
    };

    publicacionService = {
      buscarPublicacionPorId: jest.fn(),
      pausar: jest.fn(),
      eliminar: jest.fn(),
    };

    usuarioService = {
      BloquearUsuario: jest.fn(),
      RegistrarPublicacionEliminadaPorModeracion: jest.fn(),
    };

    const dataSource = {
      transaction: jest.fn(
        async <T>(operacion: (entityManager: EntityManager) => Promise<T>) =>
          operacion(manager as unknown as EntityManager),
      ),
    };

    service = new DenunciaService(
      repository as unknown as DenunciaRepository,
      publicacionService as unknown as PublicacionService,
      usuarioService as unknown as UsuarioService,
      dataSource as unknown as DataSource,
    );
  });

  describe('crearDenuncia', () => {
    it('crea una denuncia pendiente cuando la publicación existe y no hay denuncia previa', async () => {
      const publicacion = crearPublicacion();
      const denuncia = crearDenuncia();
      const dto = {
        publicacionId: denuncia.publicacionId,
        motivo: denuncia.motivo,
        comentario: 'La publicación contiene información engañosa.',
      };

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      repository.buscarPorDenuncianteYPublicacion.mockResolvedValue(null);
      repository.crear.mockReturnValue(denuncia);
      repository.guardar.mockResolvedValue(denuncia);

      const resultado = await service.crearDenuncia(
        denuncia.denuncianteId,
        dto,
      );

      expect(publicacionService.buscarPublicacionPorId).toHaveBeenCalledWith(
        dto.publicacionId,
      );
      expect(publicacion.validarNoEsCreador).toHaveBeenCalledWith(
        denuncia.denuncianteId,
        'NO_PUEDE_DENUNCIAR_PROPIA_PUBLICACION',
      );
      expect(repository.buscarPorDenuncianteYPublicacion).toHaveBeenCalledWith(
        denuncia.denuncianteId,
        dto.publicacionId,
      );
      expect(repository.crear).toHaveBeenCalledWith({
        publicacionId: dto.publicacionId,
        denuncianteId: denuncia.denuncianteId,
        creadorPublicacionId: publicacion.creadorId,
        motivo: dto.motivo,
        comentario: dto.comentario,
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
      const denuncia = crearDenuncia({ comentario: null });

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      repository.buscarPorDenuncianteYPublicacion.mockResolvedValue(null);
      repository.crear.mockReturnValue(denuncia);
      repository.guardar.mockResolvedValue(denuncia);

      await service.crearDenuncia(denuncia.denuncianteId, {
        publicacionId: denuncia.publicacionId,
        motivo: denuncia.motivo,
      });

      expect(repository.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          comentario: null,
        }),
      );
    });

    it('rechaza denunciar una publicación propia y no crea denuncia', async () => {
      const publicacion = crearPublicacion();
      publicacion.validarNoEsCreador.mockImplementation(() => {
        throw new ForbiddenException('NO_PUEDE_DENUNCIAR_PROPIA_PUBLICACION');
      });
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

    it('rechaza una denuncia duplicada', async () => {
      const publicacion = crearPublicacion();
      const denuncia = crearDenuncia();

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      repository.buscarPorDenuncianteYPublicacion.mockResolvedValue(denuncia);

      await expect(
        service.crearDenuncia(denuncia.denuncianteId, {
          publicacionId: denuncia.publicacionId,
          motivo: denuncia.motivo,
        }),
      ).rejects.toThrow('DENUNCIA_DUPLICADA');

      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('propaga error cuando la publicación denunciada no existe', async () => {
      publicacionService.buscarPublicacionPorId.mockRejectedValue(
        new NotFoundException('Publicación no encontrada'),
      );

      await expect(
        service.crearDenuncia('44444444-4444-4444-8444-444444444444', {
          publicacionId: '33333333-3333-4333-8333-333333333333',
          motivo: MotivoDenuncia.PUBLICACION_FALSA,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(
        repository.buscarPorDenuncianteYPublicacion,
      ).not.toHaveBeenCalled();
      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
    });
  });

  describe('listar', () => {
    it('lista denuncias aplicando los filtros recibidos', async () => {
      const filtros = { estado: EstadoDenuncia.PENDIENTE };
      const denuncias = [crearDenuncia(), crearDenuncia({ id: otroId() })];
      repository.listar.mockResolvedValue(denuncias);

      const resultado = await service.listar(filtros);

      expect(repository.listar).toHaveBeenCalledWith(filtros);
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual(
        expect.objectContaining({
          id: denuncias[0].id,
          estado: denuncias[0].estado,
        }),
      );
    });
  });

  describe('buscarDetallePorId', () => {
    it('devuelve el detalle de una denuncia existente', async () => {
      const denuncia = crearDenunciaEnRevision();
      repository.buscarPorId.mockResolvedValue(denuncia);

      const resultado = await service.buscarDetallePorId(denuncia.id);

      expect(repository.buscarPorId).toHaveBeenCalledWith(denuncia.id);
      expect(resultado).toEqual(
        expect.objectContaining({
          id: denuncia.id,
          detalleResolucion: denuncia.detalleResolucion,
          version: denuncia.version,
        }),
      );
    });

    it('lanza NotFoundException si la denuncia no existe', async () => {
      repository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.buscarDetallePorId('11111111-1111-4111-8111-111111111111'),
      ).rejects.toThrow('DENUNCIA_NO_ENCONTRADA');
    });
  });

  describe('tomarDenuncia', () => {
    it('toma la denuncia después de bloquear su fila', async () => {
      const denuncia = crearDenuncia();
      manager.findOne.mockResolvedValue(denuncia);

      const resultado = await service.tomarDenuncia(
        denuncia.id,
        '22222222-2222-4222-8222-222222222222',
        { version: 1 },
      );

      expect(manager.findOne).toHaveBeenCalledWith(Denuncia, {
        where: { id: denuncia.id },
        lock: { mode: 'pessimistic_write' },
      });
      expect(manager.save).toHaveBeenCalledWith(denuncia);
      expect(resultado.estado).toBe(EstadoDenuncia.EN_REVISION);
      expect(resultado.version).toBe(2);
    });

    it('lanza NotFoundException si la denuncia a tomar no existe', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.tomarDenuncia(
          '11111111-1111-4111-8111-111111111111',
          '22222222-2222-4222-8222-222222222222',
          { version: 1 },
        ),
      ).rejects.toThrow('DENUNCIA_NO_ENCONTRADA');

      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rechaza una versión vencida sin guardar cambios', async () => {
      const denuncia = crearDenuncia({ version: 2 });
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.tomarDenuncia(
          denuncia.id,
          '22222222-2222-4222-8222-222222222222',
          { version: 1 },
        ),
      ).rejects.toThrow(ConflictException);

      expect(manager.save).not.toHaveBeenCalled();
      expect(denuncia.estado).toBe(EstadoDenuncia.PENDIENTE);
    });

    it('no permite tomar una denuncia ya resuelta', async () => {
      const denuncia = crearDenunciaResuelta();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.tomarDenuncia(
          denuncia.id,
          '22222222-2222-4222-8222-222222222222',
          { version: denuncia.version },
        ),
      ).rejects.toThrow(BadRequestException);

      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('resolverDenuncia', () => {
    it('no ejecuta una sanción cuando la versión está vencida', async () => {
      const denuncia = crearDenunciaEnRevision({ version: 3 });
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(denuncia.id, denuncia.moderadorAsignadoId!, {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
          detalleResolucion:
            'La resolución quedó desactualizada por otra operación.',
        }),
      ).rejects.toThrow('CONFLICTO_CONCURRENCIA');

      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rechaza resolver una denuncia que todavía no fue tomada', async () => {
      const denuncia = crearDenuncia();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(
          denuncia.id,
          '22222222-2222-4222-8222-222222222222',
          {
            version: 1,
            tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
            detalleResolucion:
              'Se pausa la publicación denunciada para revisar su contenido.',
          },
        ),
      ).rejects.toThrow('DENUNCIA_DEBE_ESTAR_EN_REVISION');

      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
      expect(denuncia.estado).toBe(EstadoDenuncia.PENDIENTE);
      expect(denuncia.moderadorAsignadoId).toBeNull();
    });

    it('rechaza que otro moderador resuelva una denuncia asignada', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(
          denuncia.id,
          '66666666-6666-4666-8666-666666666666',
          {
            version: 2,
            tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
            detalleResolucion:
              'Se pausa la publicación denunciada para revisar su contenido.',
          },
        ),
      ).rejects.toThrow('SOLO_MODERADOR_ASIGNADO_PUEDE_RESOLVER');

      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
      expect(denuncia.estado).toBe(EstadoDenuncia.EN_REVISION);
    });

    it('rechaza resolver una denuncia ya resuelta', async () => {
      const denuncia = crearDenunciaResuelta();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(denuncia.id, denuncia.moderadorAsignadoId!, {
          version: denuncia.version,
          tipoResolucion: TipoResolucion.DESCARTADA,
          detalleResolucion: 'La denuncia ya estaba resuelta.',
        }),
      ).rejects.toThrow('DENUNCIA_YA_RESUELTA');

      expect(manager.save).not.toHaveBeenCalled();
    });

    it('resuelve como descartada sin aplicar sanciones', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      const resultado = await service.resolverDenuncia(
        denuncia.id,
        denuncia.moderadorAsignadoId!,
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
        usuarioService.RegistrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledWith(denuncia);
      expect(resultado.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(resultado.tipoResolucion).toBe(TipoResolucion.DESCARTADA);
      expect(resultado.version).toBe(3);
    });

    it('pausa la publicación y no suma contador cuando resuelve con PUBLICACION_PAUSADA', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      const resultado = await service.resolverDenuncia(
        denuncia.id,
        denuncia.moderadorAsignadoId!,
        {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
          detalleResolucion:
            'Se pausa la publicación denunciada para revisar su contenido.',
        },
      );

      expect(publicacionService.pausar).toHaveBeenCalledWith(
        denuncia.publicacionId,
        denuncia.moderadorAsignadoId,
        expect.any(String),
      );
      expect(publicacionService.eliminar).not.toHaveBeenCalled();
      expect(
        usuarioService.RegistrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledWith(denuncia);
      expect(resultado.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(resultado.tipoResolucion).toBe(TipoResolucion.PUBLICACION_PAUSADA);
    });

    it('elimina la publicación y registra el contador del creador cuando resuelve con PUBLICACION_ELIMINADA', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      const resultado = await service.resolverDenuncia(
        denuncia.id,
        denuncia.moderadorAsignadoId!,
        {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_ELIMINADA,
          detalleResolucion:
            'Se elimina la publicación denunciada por incumplir las reglas.',
        },
      );

      expect(publicacionService.eliminar).toHaveBeenCalledWith(
        denuncia.publicacionId,
        denuncia.moderadorAsignadoId,
        expect.any(String),
      );
      expect(
        usuarioService.RegistrarPublicacionEliminadaPorModeracion,
      ).toHaveBeenCalledWith(
        denuncia.creadorPublicacionId,
        denuncia.moderadorAsignadoId,
      );
      expect(usuarioService.BloquearUsuario).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledWith(denuncia);
      expect(resultado.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(resultado.tipoResolucion).toBe(
        TipoResolucion.PUBLICACION_ELIMINADA,
      );
    });

    it('bloquea al creador cuando resuelve con USUARIO_BLOQUEADO', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      const resultado = await service.resolverDenuncia(
        denuncia.id,
        denuncia.moderadorAsignadoId!,
        {
          version: 2,
          tipoResolucion: TipoResolucion.USUARIO_BLOQUEADO,
          detalleResolucion: 'El usuario incumplió reiteradamente las reglas.',
        },
      );

      expect(usuarioService.BloquearUsuario).toHaveBeenCalledWith(
        denuncia.creadorPublicacionId,
        denuncia.moderadorAsignadoId,
        {
          razonBloqueo: 'El usuario incumplió reiteradamente las reglas.',
        },
      );
      expect(publicacionService.pausar).not.toHaveBeenCalled();
      expect(publicacionService.eliminar).not.toHaveBeenCalled();
      expect(
        usuarioService.RegistrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledWith(denuncia);
      expect(resultado.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(resultado.tipoResolucion).toBe(TipoResolucion.USUARIO_BLOQUEADO);
    });

    it('no guarda la denuncia si falla la acción de moderación', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);
      publicacionService.eliminar.mockRejectedValue(
        new Error('No se pudo eliminar la publicación'),
      );

      await expect(
        service.resolverDenuncia(denuncia.id, denuncia.moderadorAsignadoId!, {
          version: 2,
          tipoResolucion: TipoResolucion.PUBLICACION_ELIMINADA,
          detalleResolucion:
            'Se elimina la publicación denunciada por incumplir las reglas.',
        }),
      ).rejects.toThrow('No se pudo eliminar la publicación');

      expect(
        usuarioService.RegistrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
      expect(denuncia.estado).toBe(EstadoDenuncia.EN_REVISION);
    });

    it('rechaza un tipo de resolución inválido', async () => {
      const denuncia = crearDenunciaEnRevision();
      manager.findOne.mockResolvedValue(denuncia);

      await expect(
        service.resolverDenuncia(denuncia.id, denuncia.moderadorAsignadoId!, {
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
      id: '11111111-1111-4111-8111-111111111111',
      publicacionId: '33333333-3333-4333-8333-333333333333',
      denuncianteId: '44444444-4444-4444-8444-444444444444',
      creadorPublicacionId: '55555555-5555-4555-8555-555555555555',
      motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
      comentario: null,
      estado: EstadoDenuncia.PENDIENTE,
      moderadorAsignadoId: null,
      tipoResolucion: null,
      detalleResolucion: null,
      fechaResolucion: null,
      version: 1,
      fechaCreacion: new Date('2026-06-23T10:00:00.000Z'),
      fechaActualizacion: new Date('2026-06-23T10:00:00.000Z'),
      ...datos,
    });
  }

  function crearDenunciaEnRevision(datos?: Partial<Denuncia>): Denuncia {
    return crearDenuncia({
      estado: EstadoDenuncia.EN_REVISION,
      moderadorAsignadoId: '22222222-2222-4222-8222-222222222222',
      version: 2,
      ...datos,
    });
  }

  function crearDenunciaResuelta(datos?: Partial<Denuncia>): Denuncia {
    return crearDenuncia({
      estado: EstadoDenuncia.RESUELTA,
      moderadorAsignadoId: '22222222-2222-4222-8222-222222222222',
      tipoResolucion: TipoResolucion.DESCARTADA,
      detalleResolucion: 'La denuncia fue descartada.',
      fechaResolucion: new Date('2026-06-23T11:00:00.000Z'),
      version: 3,
      ...datos,
    });
  }

  function crearPublicacion(): Publicacion & {
    validarNoEsCreador: jest.Mock;
  } {
    return {
      id: '33333333-3333-4333-8333-333333333333',
      creadorId: '55555555-5555-4555-8555-555555555555',
      validarNoEsCreador: jest.fn(),
    } as unknown as Publicacion & { validarNoEsCreador: jest.Mock };
  }

  function otroId(): string {
    return '99999999-9999-4999-8999-999999999999';
  }
});
