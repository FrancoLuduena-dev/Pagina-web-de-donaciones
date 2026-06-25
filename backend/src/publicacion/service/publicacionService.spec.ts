import { EventEmitter2 } from '@nestjs/event-emitter';

import { EventoDominio } from '../../compartidos/evento/eventoDominio';
import { rolUsuario } from '../../usuario/enums/rolUsuario';
import UsuarioService from '../../usuario/service/usuarioService';
import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionRepository } from '../repository/publicacionRepository';
import { PublicacionService } from './publicacionService';

describe('PublicacionService - eliminar', () => {
  let service: PublicacionService;
  let repository: {
    buscarPorId: jest.Mock;
    guardar: jest.Mock;
  };
  let eventEmitter: {
    emit: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      buscarPorId: jest.fn(),
      guardar: jest.fn((publicacion: Publicacion) =>
        Promise.resolve(publicacion),
      ),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    service = new PublicacionService(
      repository as unknown as PublicacionRepository,
      eventEmitter as unknown as EventEmitter2,
      {
        registrarPublicacionEliminadaPorModeracion: jest.fn(),
      } as unknown as UsuarioService,
    );
  });

  it('notifica al creador cuando un moderador elimina la publicación', async () => {
    const publicacion = crearPublicacion();
    repository.buscarPorId.mockResolvedValue(publicacion);

    const resultado = await service.eliminar(
      publicacion.id,
      '22222222-2222-4222-8222-222222222222',
      rolUsuario.usuarioModerador,
    );

    expect(repository.guardar).toHaveBeenCalledWith(publicacion);
    expect(resultado.estado).toBe(EstadoPublicacion.ELIMINADA);
    expect(resultado.deletedAt).toBeInstanceOf(Date);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EventoDominio.PUBLICACION_ELIMINADA,
      expect.objectContaining({
        publicacionId: publicacion.id,
        publicacionTitulo: publicacion.titulo,
        eliminadaPorModeracion: true,
      }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EventoDominio.PUBLICACION_ELIMINADA_MODERACION,
      expect.objectContaining({
        publicacionId: publicacion.id,
        destinatarioId: publicacion.creadorId,
        publicacionTitulo: publicacion.titulo,
      }),
    );
  });

  it('procesa solicitudes pero no notifica moderación cuando elimina el creador', async () => {
    const publicacion = crearPublicacion();
    repository.buscarPorId.mockResolvedValue(publicacion);

    await service.eliminar(
      publicacion.id,
      publicacion.creadorId,
      rolUsuario.usuarioNormal,
    );

    expect(repository.guardar).toHaveBeenCalledWith(publicacion);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EventoDominio.PUBLICACION_ELIMINADA,
      expect.objectContaining({
        publicacionId: publicacion.id,
        eliminadaPorModeracion: false,
      }),
    );
    expect(eventEmitter.emit).not.toHaveBeenCalledWith(
      EventoDominio.PUBLICACION_ELIMINADA_MODERACION,
      expect.anything(),
    );
  });

  it('no notifica si no se pudo guardar la eliminación', async () => {
    const publicacion = crearPublicacion();
    repository.buscarPorId.mockResolvedValue(publicacion);
    repository.guardar.mockRejectedValue(
      new Error('No se pudo guardar la publicación'),
    );

    await expect(
      service.eliminar(
        publicacion.id,
        '22222222-2222-4222-8222-222222222222',
        rolUsuario.usuarioModerador,
      ),
    ).rejects.toThrow('No se pudo guardar la publicación');

    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('no procesa solicitudes cuando la publicación solamente se pausa', async () => {
    const publicacion = crearPublicacion();
    repository.buscarPorId.mockResolvedValue(publicacion);

    await service.pausar(
      publicacion.id,
      publicacion.creadorId,
      rolUsuario.usuarioNormal,
    );

    expect(eventEmitter.emit).not.toHaveBeenCalledWith(
      EventoDominio.PUBLICACION_ELIMINADA,
      expect.anything(),
    );
  });

  it('no procesa solicitudes cuando una publicación pausada se reactiva', async () => {
    const publicacion = crearPublicacion();
    publicacion.estado = EstadoPublicacion.PAUSADA;
    repository.buscarPorId.mockResolvedValue(publicacion);

    await service.reactivar(
      publicacion.id,
      publicacion.creadorId,
      rolUsuario.usuarioNormal,
    );

    expect(eventEmitter.emit).not.toHaveBeenCalledWith(
      EventoDominio.PUBLICACION_ELIMINADA,
      expect.anything(),
    );
  });

  it('permite a moderación eliminar una publicación reservada', async () => {
    const publicacion = crearPublicacion();
    publicacion.estado = EstadoPublicacion.RESERVADA;
    repository.buscarPorId.mockResolvedValue(publicacion);

    const resultado = await service.eliminar(
      publicacion.id,
      '22222222-2222-4222-8222-222222222222',
      rolUsuario.usuarioModerador,
    );

    expect(resultado.estado).toBe(EstadoPublicacion.ELIMINADA);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EventoDominio.PUBLICACION_ELIMINADA,
      expect.objectContaining({
        eliminadaPorModeracion: true,
      }),
    );
  });

  it('impide al creador eliminar su publicación reservada', async () => {
    const publicacion = crearPublicacion();
    publicacion.estado = EstadoPublicacion.RESERVADA;
    repository.buscarPorId.mockResolvedValue(publicacion);

    await expect(
      service.eliminar(
        publicacion.id,
        publicacion.creadorId,
        rolUsuario.usuarioNormal,
      ),
    ).rejects.toThrow('No se puede pasar de RESERVADA a ELIMINADA');

    expect(repository.guardar).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  function crearPublicacion(): Publicacion {
    return Object.assign(new Publicacion(), {
      id: '11111111-1111-4111-8111-111111111111',
      creadorId: '33333333-3333-4333-8333-333333333333',
      titulo: 'Publicación de prueba',
      descripcion: 'Descripción suficientemente extensa para la publicación.',
      categoriaId: '44444444-4444-4444-8444-444444444444',
      localidadId: '55555555-5555-4555-8555-555555555555',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/imagen.jpg'],
      estado: EstadoPublicacion.DISPONIBLE,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      solicitudes: [],
    });
  }
});

describe('PublicacionService - operaciones generales', () => {
  let service: PublicacionService;
  let repository: {
    crear: jest.Mock;
    guardar: jest.Mock;
    buscarPorId: jest.Mock;
    listarPorCreador: jest.Mock;
  };
  let eventEmitter: { emit: jest.Mock };
  let usuarioService: { obtenerUsuarioPorId: jest.Mock };

  beforeEach(() => {
    repository = {
      crear: jest.fn((datos: Partial<Publicacion>) =>
        Object.assign(new Publicacion(), datos),
      ),
      guardar: jest.fn((publicacion: Publicacion) =>
        Promise.resolve(publicacion),
      ),
      buscarPorId: jest.fn(),
      listarPorCreador: jest.fn(),
    };

    eventEmitter = { emit: jest.fn() };
    usuarioService = {
      obtenerUsuarioPorId: jest.fn(),
    };

    service = new PublicacionService(
      repository as unknown as PublicacionRepository,
      eventEmitter as unknown as EventEmitter2,
      usuarioService as unknown as UsuarioService,
    );
  });

  it('crea y guarda una publicación con los datos del dto', async () => {
    const dto = {
      titulo: 'Mesa',
      descripcion: 'Mesa en buen estado para donar a una familia.',
      categoriaId: '44444444-4444-4444-8444-444444444444',
      localidadId: '55555555-5555-4555-8555-555555555555',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/imagen.jpg'],
    };

    const resultado = await service.crearPublicacion(
      dto,
      '33333333-3333-4333-8333-333333333333',
    );

    expect(repository.crear).toHaveBeenCalledWith({
      ...dto,
      creadorId: '33333333-3333-4333-8333-333333333333',
    });
    expect(repository.guardar).toHaveBeenCalledWith(resultado);
    expect(resultado.titulo).toBe('Mesa');
  });

  it('lista mis publicaciones delegando al repositorio', async () => {
    const publicaciones = [crearPublicacion()];
    repository.listarPorCreador.mockResolvedValue(publicaciones);

    await expect(
      service.listarMisPublicaciones(
        '33333333-3333-4333-8333-333333333333',
        EstadoPublicacion.ELIMINADA,
      ),
    ).resolves.toBe(publicaciones);

    expect(repository.listarPorCreador).toHaveBeenCalledWith(
      '33333333-3333-4333-8333-333333333333',
      EstadoPublicacion.ELIMINADA,
    );
  });

  it('busca una publicación por id y lanza NotFoundException si no existe', async () => {
    repository.buscarPorId.mockResolvedValue(null);

    await expect(
      service.buscarPublicacionPorId('11111111-1111-4111-8111-111111111111'),
    ).rejects.toThrow('Publicación no encontrada');
  });

  it('enriquece la publicación con datos del creador', async () => {
    const publicacion = crearPublicacion();
    repository.buscarPorId.mockResolvedValue(publicacion);
    usuarioService.obtenerUsuarioPorId.mockResolvedValue({
      nombreUsuario: 'juan',
      nombreCompleto: 'Juan Pérez',
    });

    const resultado = await service.buscarPublicacionPorIdConCreador(
      publicacion.id,
    );

    expect(usuarioService.obtenerUsuarioPorId).toHaveBeenCalledWith(
      publicacion.creadorId,
    );
    expect(resultado.creadorNombreUsuario).toBe('juan');
    expect(resultado.creadorNombreCompleto).toBe('Juan Pérez');
  });

  it('edita una publicación cuando el usuario es el creador', async () => {
    const publicacion = crearPublicacion();
    repository.buscarPorId.mockResolvedValue(publicacion);

    const resultado = await service.editar(
      publicacion.id,
      { titulo: 'Título actualizado' },
      publicacion.creadorId,
    );

    expect(resultado.titulo).toBe('Título actualizado');
    expect(repository.guardar).toHaveBeenCalledWith(publicacion);
  });

  it('rechaza editar una publicación si no es el creador', async () => {
    const publicacion = crearPublicacion();
    repository.buscarPorId.mockResolvedValue(publicacion);

    await expect(
      service.editar(
        publicacion.id,
        { titulo: 'Intento inválido' },
        '22222222-2222-4222-8222-222222222222',
      ),
    ).rejects.toThrow('Solo el creador puede editar la publicación');

    expect(repository.guardar).not.toHaveBeenCalled();
  });

  it('notifica moderación al pausar una publicación ajena', async () => {
    const publicacion = crearPublicacion();
    repository.buscarPorId.mockResolvedValue(publicacion);

    await service.pausar(
      publicacion.id,
      '22222222-2222-4222-8222-222222222222',
      rolUsuario.usuarioModerador,
    );

    expect(publicacion.estado).toBe(EstadoPublicacion.PAUSADA);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      EventoDominio.PUBLICACION_PAUSADA_MODERACION,
      expect.objectContaining({
        publicacionId: publicacion.id,
        destinatarioId: publicacion.creadorId,
      }),
    );
  });

  it('cancela la reserva cuando el creador lo solicita', async () => {
    const publicacion = crearPublicacion();
    publicacion.estado = EstadoPublicacion.RESERVADA;
    repository.buscarPorId.mockResolvedValue(publicacion);

    const resultado = await service.cancelarReserva(
      publicacion.id,
      publicacion.creadorId,
    );

    expect(resultado.estado).toBe(EstadoPublicacion.DISPONIBLE);
    expect(repository.guardar).toHaveBeenCalledWith(publicacion);
  });

  function crearPublicacion(): Publicacion {
    return Object.assign(new Publicacion(), {
      id: '11111111-1111-4111-8111-111111111111',
      creadorId: '33333333-3333-4333-8333-333333333333',
      titulo: 'Publicación de prueba',
      descripcion: 'Descripción suficientemente extensa para la publicación.',
      categoriaId: '44444444-4444-4444-8444-444444444444',
      localidadId: '55555555-5555-4555-8555-555555555555',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/imagen.jpg'],
      estado: EstadoPublicacion.DISPONIBLE,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      solicitudes: [],
    });
  }
});
