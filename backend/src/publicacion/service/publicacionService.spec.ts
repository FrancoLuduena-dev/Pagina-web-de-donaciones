import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { EventoDominio } from 'src/compartidos/evento/eventoDominio';
import Usuario from 'src/usuario/entity/usuarioEntity';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';
import UsuarioService from 'src/usuario/service/usuarioService';

import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionEliminadaEvento } from '../evento/publicacionEliminadaEvento';
import { PublicacionModeradaEvento } from '../evento/publicacionModeradaEvento';
import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { PublicacionRepository } from '../repository/publicacionRepository';
import { PublicacionService } from './publicacionService';

type PublicacionRepositoryMock = {
  crear: jest.Mock<Publicacion, [Partial<Publicacion>]>;
  guardar: jest.Mock<Promise<Publicacion>, [Publicacion]>;
  buscarPorId: jest.Mock<Promise<Publicacion | null>, [string]>;
  listarPublico: jest.Mock<Promise<Publicacion[]>, [FiltrosPublicacionDto]>;
  listarPorCreador: jest.Mock<
    Promise<Publicacion[]>,
    [string, EstadoPublicacion?]
  >;
};

type EventEmitterMock = {
  emit: jest.Mock<boolean, [string | symbol, ...unknown[]]>;
};

type UsuarioServiceMock = {
  obtenerUsuarioPorId: jest.Mock<Promise<Usuario>, [string]>;
  registrarPublicacionEliminadaPorModeracion: jest.Mock<
    Promise<void>,
    [string, string]
  >;
};

describe('PublicacionService', () => {
  let service: PublicacionService;
  let repository: PublicacionRepositoryMock;
  let eventEmitter: EventEmitterMock;
  let usuarioService: UsuarioServiceMock;

  const fechaActual = new Date('2026-06-24T10:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    repository = crearRepositoryMock();
    eventEmitter = crearEventEmitterMock();
    usuarioService = crearUsuarioServiceMock();

    service = new PublicacionService(
      repository as unknown as PublicacionRepository,
      eventEmitter as unknown as EventEmitter2,
      usuarioService as unknown as UsuarioService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('crearPublicacion', () => {
    it('crea una publicación con los datos del dto y el creador autenticado', async () => {
      const dto = crearCrearPublicacionDto();
      const publicacionCreada = crearPublicacion({
        ...dto,
        creadorId: 'usuario-creador',
      });

      repository.crear.mockReturnValue(publicacionCreada);
      repository.guardar.mockResolvedValue(publicacionCreada);

      await expect(
        service.crearPublicacion(dto, 'usuario-creador'),
      ).resolves.toBe(publicacionCreada);

      expect(repository.crear).toHaveBeenCalledTimes(1);
      expect(repository.crear).toHaveBeenCalledWith({
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        categoriaId: dto.categoriaId,
        localidadId: dto.localidadId,
        condicion: dto.condicion,
        imagenUrls: dto.imagenUrls,
        creadorId: 'usuario-creador',
      });
      expect(repository.guardar).toHaveBeenCalledTimes(1);
      expect(repository.guardar).toHaveBeenCalledWith(publicacionCreada);
    });

    it('propaga errores del repository al guardar una publicación nueva', async () => {
      const dto = crearCrearPublicacionDto();
      const publicacionCreada = crearPublicacion();

      repository.crear.mockReturnValue(publicacionCreada);
      repository.guardar.mockRejectedValue(new Error('Error al guardar'));

      await expect(
        service.crearPublicacion(dto, 'usuario-creador'),
      ).rejects.toThrow('Error al guardar');

      expect(repository.crear).toHaveBeenCalledTimes(1);
      expect(repository.guardar).toHaveBeenCalledWith(publicacionCreada);
    });
  });

  describe('listarPublico', () => {
    it('delega el listado público al repository con los filtros recibidos', async () => {
      const filtros: FiltrosPublicacionDto = {
        q: 'mesa',
        estado: EstadoPublicacion.DISPONIBLE,
        condicion: CondicionObjeto.USADO_BUENO,
      };
      const publicaciones = [crearPublicacion()];

      repository.listarPublico.mockResolvedValue(publicaciones);

      await expect(service.listarPublico(filtros)).resolves.toBe(publicaciones);

      expect(repository.listarPublico).toHaveBeenCalledTimes(1);
      expect(repository.listarPublico).toHaveBeenCalledWith(filtros);
    });

    it('propaga errores del repository al listar público', async () => {
      repository.listarPublico.mockRejectedValue(new Error('Error al listar'));

      await expect(service.listarPublico({})).rejects.toThrow(
        'Error al listar',
      );
    });
  });

  describe('listarMisPublicaciones', () => {
    it('lista publicaciones del creador sin estado', async () => {
      const publicaciones = [crearPublicacion({ creadorId: 'usuario-1' })];

      repository.listarPorCreador.mockResolvedValue(publicaciones);

      await expect(service.listarMisPublicaciones('usuario-1')).resolves.toBe(
        publicaciones,
      );

      expect(repository.listarPorCreador).toHaveBeenCalledTimes(1);
      expect(repository.listarPorCreador).toHaveBeenCalledWith(
        'usuario-1',
        undefined,
      );
    });

    it('lista publicaciones del creador filtrando por estado', async () => {
      repository.listarPorCreador.mockResolvedValue([]);

      await service.listarMisPublicaciones(
        'usuario-1',
        EstadoPublicacion.PAUSADA,
      );

      expect(repository.listarPorCreador).toHaveBeenCalledWith(
        'usuario-1',
        EstadoPublicacion.PAUSADA,
      );
    });
  });

  describe('buscarPublicacionPorId', () => {
    it('devuelve la publicación cuando existe', async () => {
      const publicacion = crearPublicacion({ id: 'publicacion-1' });

      repository.buscarPorId.mockResolvedValue(publicacion);

      await expect(
        service.buscarPublicacionPorId('publicacion-1'),
      ).resolves.toBe(publicacion);

      expect(repository.buscarPorId).toHaveBeenCalledWith('publicacion-1');
    });

    it('lanza NotFoundException cuando la publicación no existe', async () => {
      repository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.buscarPublicacionPorId('publicacion-inexistente'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.buscarPublicacionPorId('publicacion-inexistente'),
      ).rejects.toThrow('Publicación no encontrada');
    });
  });

  describe('buscarPublicacionPorIdConCreador', () => {
    it('devuelve publicación con nombre de usuario y nombre completo del creador', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador',
      });
      const creador = crearUsuario({
        id: 'usuario-creador',
        nombreUsuario: 'melina',
        nombreCompleto: 'Melina De Marte',
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      usuarioService.obtenerUsuarioPorId.mockResolvedValue(creador);

      const resultado =
        await service.buscarPublicacionPorIdConCreador('publicacion-1');

      expect(repository.buscarPorId).toHaveBeenCalledWith('publicacion-1');
      expect(usuarioService.obtenerUsuarioPorId).toHaveBeenCalledWith(
        'usuario-creador',
      );
      expect(resultado).toBe(publicacion);
      expect(resultado.creadorNombreUsuario).toBe('melina');
      expect(resultado.creadorNombreCompleto).toBe('Melina De Marte');
    });

    it('no busca el creador si la publicación no existe', async () => {
      repository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.buscarPublicacionPorIdConCreador('publicacion-inexistente'),
      ).rejects.toThrow(NotFoundException);

      expect(usuarioService.obtenerUsuarioPorId).not.toHaveBeenCalled();
    });

    it('propaga errores al obtener el usuario creador', async () => {
      repository.buscarPorId.mockResolvedValue(
        crearPublicacion({ creadorId: 'usuario-creador' }),
      );
      usuarioService.obtenerUsuarioPorId.mockRejectedValue(
        new Error('Usuario no encontrado'),
      );

      await expect(
        service.buscarPublicacionPorIdConCreador('publicacion-1'),
      ).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('editar', () => {
    it('edita una publicación cuando el usuario es el creador', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.DISPONIBLE,
      });
      const dto: EditarPublicacionDto = {
        titulo: 'Título editado',
        descripcion: 'Descripción editada válida',
      };

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      const resultado = await service.editar(
        'publicacion-1',
        dto,
        'usuario-creador',
      );

      expect(resultado).toBe(publicacion);
      expect(publicacion.titulo).toBe('Título editado');
      expect(publicacion.descripcion).toBe('Descripción editada válida');
      expect(publicacion.updatedAt).toEqual(fechaActual);
      expect(repository.guardar).toHaveBeenCalledWith(publicacion);
    });

    it('rechaza editar si el usuario no es el creador y no guarda cambios', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        titulo: 'Título original',
      });

      repository.buscarPorId.mockResolvedValue(publicacion);

      await expect(
        service.editar(
          'publicacion-1',
          { titulo: 'Título editado' },
          'otro-usuario',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(publicacion.titulo).toBe('Título original');
      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('rechaza editar si la entidad no puede editarse por estado', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.RESERVADA,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);

      await expect(
        service.editar(
          'publicacion-1',
          { titulo: 'Título editado' },
          'usuario-creador',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(repository.guardar).not.toHaveBeenCalled();
    });
  });

  describe('reservar', () => {
    it('reserva una publicación disponible cuando el usuario no es el creador', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      const resultado = await service.reservar(
        'publicacion-1',
        'usuario-solicitante',
      );

      expect(resultado.estado).toBe(EstadoPublicacion.RESERVADA);
      expect(repository.guardar).toHaveBeenCalledWith(publicacion);
    });

    it('rechaza reservar publicación propia y no guarda', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);

      await expect(
        service.reservar('publicacion-1', 'usuario-creador'),
      ).rejects.toThrow(ForbiddenException);

      expect(publicacion.estado).toBe(EstadoPublicacion.DISPONIBLE);
      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('rechaza reservar una publicación no disponible', async () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.PAUSADA,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);

      await expect(
        service.reservar('publicacion-1', 'otro-usuario'),
      ).rejects.toThrow(BadRequestException);

      expect(repository.guardar).not.toHaveBeenCalled();
    });
  });

  describe('cancelarReserva', () => {
    it('cancela la reserva cuando el usuario es el creador', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.RESERVADA,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      const resultado = await service.cancelarReserva(
        'publicacion-1',
        'usuario-creador',
      );

      expect(resultado.estado).toBe(EstadoPublicacion.DISPONIBLE);
      expect(repository.guardar).toHaveBeenCalledWith(publicacion);
    });

    it('rechaza cancelar reserva si el usuario no es creador', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.RESERVADA,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);

      await expect(
        service.cancelarReserva('publicacion-1', 'otro-usuario'),
      ).rejects.toThrow(ForbiddenException);

      expect(publicacion.estado).toBe(EstadoPublicacion.RESERVADA);
      expect(repository.guardar).not.toHaveBeenCalled();
    });
  });

  describe('pausar', () => {
    it('pausa publicación propia sin emitir evento de moderación', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      const resultado = await service.pausar(
        'publicacion-1',
        'usuario-creador',
        rolUsuario.usuarioNormal,
      );

      expect(resultado.estado).toBe(EstadoPublicacion.PAUSADA);
      expect(repository.guardar).toHaveBeenCalledWith(publicacion);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('pausa publicación ajena por moderación y emite evento', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador',
        titulo: 'Mesa de madera',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      await service.pausar(
        'publicacion-1',
        'moderador-1',
        rolUsuario.usuarioModerador,
      );

      expect(publicacion.estado).toBe(EstadoPublicacion.PAUSADA);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.PUBLICACION_PAUSADA_MODERACION,
        new PublicacionModeradaEvento(
          'publicacion-1',
          'usuario-creador',
          'Mesa de madera',
        ),
      );
    });

    it('rechaza pausar si el usuario no tiene permisos y no guarda ni emite evento', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);

      await expect(
        service.pausar(
          'publicacion-1',
          'otro-usuario',
          rolUsuario.usuarioNormal,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(publicacion.estado).toBe(EstadoPublicacion.DISPONIBLE);
      expect(repository.guardar).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('reactivar', () => {
    it('reactiva publicación propia sin emitir evento de moderación', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.PAUSADA,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      const resultado = await service.reactivar(
        'publicacion-1',
        'usuario-creador',
        rolUsuario.usuarioNormal,
      );

      expect(resultado.estado).toBe(EstadoPublicacion.DISPONIBLE);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('reactiva publicación ajena por moderación y emite evento', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador',
        titulo: 'Mesa de madera',
        estado: EstadoPublicacion.PAUSADA,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      await service.reactivar(
        'publicacion-1',
        'admin-1',
        rolUsuario.usuarioAdministrador,
      );

      expect(publicacion.estado).toBe(EstadoPublicacion.DISPONIBLE);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.PUBLICACION_REACTIVADA_MODERACION,
        new PublicacionModeradaEvento(
          'publicacion-1',
          'usuario-creador',
          'Mesa de madera',
        ),
      );
    });
  });

  describe('eliminar', () => {
    it('elimina publicación propia y emite evento de eliminación sin registrar moderación', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador',
        titulo: 'Mesa de madera',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      const resultado = await service.eliminar(
        'publicacion-1',
        'usuario-creador',
        rolUsuario.usuarioNormal,
      );

      expect(resultado.estado).toBe(EstadoPublicacion.ELIMINADA);
      expect(resultado.deletedAt).toEqual(fechaActual);
      expect(repository.guardar).toHaveBeenCalledWith(publicacion);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.PUBLICACION_ELIMINADA,
        new PublicacionEliminadaEvento(
          'publicacion-1',
          'Mesa de madera',
          false,
        ),
      );
      expect(
        usuarioService.registrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
    });

    it('elimina publicación ajena por moderación, registra contador y emite ambos eventos', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador',
        titulo: 'Mesa de madera',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      await service.eliminar(
        'publicacion-1',
        'moderador-1',
        rolUsuario.usuarioModerador,
      );

      expect(publicacion.estado).toBe(EstadoPublicacion.ELIMINADA);
      expect(publicacion.deletedAt).toEqual(fechaActual);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        1,
        EventoDominio.PUBLICACION_ELIMINADA,
        new PublicacionEliminadaEvento('publicacion-1', 'Mesa de madera', true),
      );
      expect(
        usuarioService.registrarPublicacionEliminadaPorModeracion,
      ).toHaveBeenCalledTimes(1);
      expect(
        usuarioService.registrarPublicacionEliminadaPorModeracion,
      ).toHaveBeenCalledWith('usuario-creador', 'moderador-1');
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(
        2,
        EventoDominio.PUBLICACION_ELIMINADA_MODERACION,
        new PublicacionModeradaEvento(
          'publicacion-1',
          'usuario-creador',
          'Mesa de madera',
        ),
      );
    });

    it('permite eliminar por moderación una publicación reservada', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.RESERVADA,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );

      await service.eliminar(
        'publicacion-1',
        'moderador-1',
        rolUsuario.usuarioModerador,
      );

      expect(publicacion.estado).toBe(EstadoPublicacion.ELIMINADA);
      expect(publicacion.deletedAt).toEqual(fechaActual);
      expect(repository.guardar).toHaveBeenCalledWith(publicacion);
    });

    it('si falla registrar moderación, ya guardó y emitió la eliminación general pero no emite evento específico de moderación', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador',
        titulo: 'Mesa de madera',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);
      repository.guardar.mockImplementation(
        (entidad: Publicacion): Promise<Publicacion> =>
          Promise.resolve(entidad),
      );
      usuarioService.registrarPublicacionEliminadaPorModeracion.mockRejectedValue(
        new Error('Error al registrar contador'),
      );

      await expect(
        service.eliminar(
          'publicacion-1',
          'moderador-1',
          rolUsuario.usuarioModerador,
        ),
      ).rejects.toThrow('Error al registrar contador');

      expect(repository.guardar).toHaveBeenCalledWith(publicacion);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.PUBLICACION_ELIMINADA,
        new PublicacionEliminadaEvento('publicacion-1', 'Mesa de madera', true),
      );
    });

    it('rechaza eliminar si el usuario no tiene permisos y no guarda ni emite eventos', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      repository.buscarPorId.mockResolvedValue(publicacion);

      await expect(
        service.eliminar(
          'publicacion-1',
          'otro-usuario',
          rolUsuario.usuarioNormal,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(publicacion.estado).toBe(EstadoPublicacion.DISPONIBLE);
      expect(repository.guardar).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(
        usuarioService.registrarPublicacionEliminadaPorModeracion,
      ).not.toHaveBeenCalled();
    });
  });

  describe('guardar', () => {
    it('delega guardar al repository', async () => {
      const publicacion = crearPublicacion();

      repository.guardar.mockResolvedValue(publicacion);

      await expect(service.guardar(publicacion)).resolves.toBe(publicacion);

      expect(repository.guardar).toHaveBeenCalledWith(publicacion);
    });
  });

  function crearRepositoryMock(): PublicacionRepositoryMock {
    return {
      crear: jest.fn<Publicacion, [Partial<Publicacion>]>(
        (datos: Partial<Publicacion>): Publicacion =>
          Object.assign(new Publicacion(), datos),
      ),

      guardar: jest.fn<Promise<Publicacion>, [Publicacion]>(
        (publicacion: Publicacion): Promise<Publicacion> =>
          Promise.resolve(publicacion),
      ),

      buscarPorId: jest.fn<Promise<Publicacion | null>, [string]>(),

      listarPublico: jest.fn<Promise<Publicacion[]>, [FiltrosPublicacionDto]>(),

      listarPorCreador: jest.fn<
        Promise<Publicacion[]>,
        [string, EstadoPublicacion?]
      >(),
    };
  }

  function crearEventEmitterMock(): EventEmitterMock {
    return {
      emit: jest.fn<boolean, [string | symbol, ...unknown[]]>(() => true),
    };
  }

  function crearUsuarioServiceMock(): UsuarioServiceMock {
    return {
      obtenerUsuarioPorId: jest.fn<Promise<Usuario>, [string]>(),

      registrarPublicacionEliminadaPorModeracion: jest.fn<
        Promise<void>,
        [string, string]
      >((): Promise<void> => Promise.resolve()),
    };
  }

  function crearCrearPublicacionDto(
    datos?: Partial<CrearPublicacionDto>,
  ): CrearPublicacionDto {
    return {
      titulo: 'Mesa de madera',
      descripcion: 'Mesa de madera en buen estado para donar.',
      categoriaId: '11111111-1111-4111-8111-111111111111',
      localidadId: '22222222-2222-4222-8222-222222222222',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/mesa.webp'],
      ...datos,
    };
  }

  function crearPublicacion(datos?: Partial<Publicacion>): Publicacion {
    return Object.assign(new Publicacion(), {
      id: 'publicacion-1',
      creadorId: 'usuario-creador',
      titulo: 'Mesa de madera',
      descripcion: 'Mesa de madera en buen estado para donar.',
      categoriaId: '11111111-1111-4111-8111-111111111111',
      localidadId: '22222222-2222-4222-8222-222222222222',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/mesa.webp'],
      estado: EstadoPublicacion.DISPONIBLE,
      version: 1,
      createdAt: new Date('2026-06-24T09:00:00.000Z'),
      updatedAt: new Date('2026-06-24T09:00:00.000Z'),
      deletedAt: undefined,
      solicitudes: [],
      ...datos,
    });
  }

  function crearUsuario(datos?: Partial<Usuario>): Usuario {
    return Object.assign(new Usuario(), {
      id: 'usuario-creador',
      nombreCompleto: 'Usuario Creador',
      nombreUsuario: 'usuario_creador',
      correo: 'usuario@test.com',
      contrasenia: 'hash',
      numeroTelefono: '1111111111',
      rol: rolUsuario.usuarioNormal,
      ...datos,
    });
  }
});
