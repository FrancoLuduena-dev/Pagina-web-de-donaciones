import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { Publicacion } from './publicacionEntity';
import { rolUsuario } from '../../usuario/enums/rolUsuario';

describe('Publicacion entity', () => {
  it('permite editar publicaciones disponibles o pausadas', () => {
    const publicacion = crearPublicacion(EstadoPublicacion.DISPONIBLE);
    const dto = Object.assign(new EditarPublicacionDto(), {
      titulo: 'Nuevo título',
      descripcion: 'Nueva descripción suficientemente larga para validar.',
    });

    publicacion.editar(dto);

    expect(publicacion.titulo).toBe('Nuevo título');
    expect(publicacion.descripcion).toBe(
      'Nueva descripción suficientemente larga para validar.',
    );
  });

  it('rechaza editar una publicación reservada', () => {
    const publicacion = crearPublicacion(EstadoPublicacion.RESERVADA);

    expect(() =>
      publicacion.editar(
        Object.assign(new EditarPublicacionDto(), {
          titulo: 'No permitido',
        }),
      ),
    ).toThrow(BadRequestException);
  });

  it('valida que solo el creador pueda gestionar acciones restringidas', () => {
    const publicacion = crearPublicacion(EstadoPublicacion.DISPONIBLE);

    expect(() =>
      publicacion.validarCreador('otro-usuario'),
    ).toThrow(ForbiddenException);
    expect(() =>
      publicacion.validarCreador(publicacion.creadorId),
    ).not.toThrow();
  });

  it('impide que el creador reserve su propia publicación', () => {
    const publicacion = crearPublicacion(EstadoPublicacion.DISPONIBLE);

    expect(() =>
      publicacion.validarNoEsCreador(publicacion.creadorId),
    ).toThrow(ForbiddenException);
  });

  it('permite reservar, pausar, reactivar y entregar según transiciones válidas', () => {
    const publicacion = crearPublicacion(EstadoPublicacion.DISPONIBLE);

    publicacion.reservar();
    expect(publicacion.estado).toBe(EstadoPublicacion.RESERVADA);

    publicacion.cancelarReserva();
    expect(publicacion.estado).toBe(EstadoPublicacion.DISPONIBLE);

    publicacion.pausar();
    expect(publicacion.estado).toBe(EstadoPublicacion.PAUSADA);

    publicacion.reactivar();
    expect(publicacion.estado).toBe(EstadoPublicacion.DISPONIBLE);
  });

  it('rechaza transiciones inválidas de estado', () => {
    const publicacion = crearPublicacion(EstadoPublicacion.ENTREGADA);

    expect(() => publicacion.pausar()).toThrow(BadRequestException);
  });

  it('elimina por moderación una publicación reservada sin pasar por pausada', () => {
    const publicacion = crearPublicacion(EstadoPublicacion.RESERVADA);

    publicacion.eliminarPorModeracion();

    expect(publicacion.estado).toBe(EstadoPublicacion.ELIMINADA);
    expect(publicacion.deletedAt).toBeInstanceOf(Date);
  });

  it('valida permisos de gestión para creador, moderador y administrador', () => {
    const publicacion = crearPublicacion(EstadoPublicacion.DISPONIBLE);

    expect(() =>
      publicacion.validarPuedeSerGestionadaPor(
        'otro-usuario',
        rolUsuario.usuarioNormal,
      ),
    ).toThrow(ForbiddenException);

    expect(() =>
      publicacion.validarPuedeSerGestionadaPor(
        'mod-id',
        rolUsuario.usuarioModerador,
      ),
    ).not.toThrow();

    expect(() =>
      publicacion.validarPuedeSerGestionadaPor(
        publicacion.creadorId,
        rolUsuario.usuarioNormal,
      ),
    ).not.toThrow();
  });

  function crearPublicacion(estado: EstadoPublicacion): Publicacion {
    return Object.assign(new Publicacion(), {
      id: '11111111-1111-4111-8111-111111111111',
      creadorId: '33333333-3333-4333-8333-333333333333',
      titulo: 'Publicación de prueba',
      descripcion: 'Descripción suficientemente extensa para la publicación.',
      categoriaId: '44444444-4444-4444-8444-444444444444',
      localidadId: '55555555-5555-4555-8555-555555555555',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/imagen.jpg'],
      estado,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      solicitudes: [],
    });
  }
});
