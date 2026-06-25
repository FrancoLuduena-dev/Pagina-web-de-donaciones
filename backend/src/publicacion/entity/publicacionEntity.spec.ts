import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { getMetadataArgsStorage } from 'typeorm';

import { TRANSICIONES_PUBLICACION } from '../constante/transicionesPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { rolUsuario } from '../../usuario/enums/rolUsuario';
import { Publicacion } from './publicacionEntity';

type ColumnaPublicacion =
  | 'id'
  | 'creadorId'
  | 'titulo'
  | 'descripcion'
  | 'categoriaId'
  | 'localidadId'
  | 'condicion'
  | 'imagenUrls'
  | 'estado'
  | 'version'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt';

type RelacionPublicacion = 'solicitudes';

describe('Publicacion', () => {
  const fechaActual = new Date('2026-06-24T10:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('validaciones de usuario', () => {
    it('validarCreador permite continuar cuando el usuario es el creador', () => {
      const publicacion = crearPublicacion({ creadorId: 'usuario-creador' });

      expect(() => publicacion.validarCreador('usuario-creador')).not.toThrow();
    });

    it('validarCreador rechaza cuando el usuario no es el creador', () => {
      const publicacion = crearPublicacion({ creadorId: 'usuario-creador' });

      expect(() => publicacion.validarCreador('otro-usuario')).toThrow(
        ForbiddenException,
      );

      expect(() =>
        publicacion.validarCreador(
          'otro-usuario',
          'Solo el creador puede editar la publicación',
        ),
      ).toThrow('Solo el creador puede editar la publicación');
    });

    it('validarNoEsCreador permite continuar cuando el usuario no es el creador', () => {
      const publicacion = crearPublicacion({ creadorId: 'usuario-creador' });

      expect(() =>
        publicacion.validarNoEsCreador('otro-usuario'),
      ).not.toThrow();
    });

    it('validarNoEsCreador rechaza cuando el usuario es el creador', () => {
      const publicacion = crearPublicacion({ creadorId: 'usuario-creador' });

      expect(() =>
        publicacion.validarNoEsCreador(
          'usuario-creador',
          'No podés reservar tu propia publicación',
        ),
      ).toThrow(ForbiddenException);

      expect(() =>
        publicacion.validarNoEsCreador(
          'usuario-creador',
          'No podés reservar tu propia publicación',
        ),
      ).toThrow('No podés reservar tu propia publicación');
    });

    it('validarPuedeSerGestionadaPor permite al creador gestionar la publicación', () => {
      const publicacion = crearPublicacion({ creadorId: 'usuario-creador' });

      expect(() =>
        publicacion.validarPuedeSerGestionadaPor(
          'usuario-creador',
          rolUsuario.usuarioNormal,
        ),
      ).not.toThrow();
    });

    it('validarPuedeSerGestionadaPor permite a moderadores gestionar publicaciones ajenas', () => {
      const publicacion = crearPublicacion({ creadorId: 'usuario-creador' });

      expect(() =>
        publicacion.validarPuedeSerGestionadaPor(
          'moderador-1',
          rolUsuario.usuarioModerador,
        ),
      ).not.toThrow();
    });

    it('validarPuedeSerGestionadaPor permite a administradores gestionar publicaciones ajenas', () => {
      const publicacion = crearPublicacion({ creadorId: 'usuario-creador' });

      expect(() =>
        publicacion.validarPuedeSerGestionadaPor(
          'admin-1',
          rolUsuario.usuarioAdministrador,
        ),
      ).not.toThrow();
    });

    it('validarPuedeSerGestionadaPor rechaza a usuario normal que no es creador', () => {
      const publicacion = crearPublicacion({ creadorId: 'usuario-creador' });

      expect(() =>
        publicacion.validarPuedeSerGestionadaPor(
          'otro-usuario',
          rolUsuario.usuarioNormal,
          'No tenés permisos para gestionar esta publicación',
        ),
      ).toThrow(ForbiddenException);

      expect(() =>
        publicacion.validarPuedeSerGestionadaPor(
          'otro-usuario',
          rolUsuario.usuarioNormal,
          'No tenés permisos para gestionar esta publicación',
        ),
      ).toThrow('No tenés permisos para gestionar esta publicación');
    });
  });

  describe('solicitudes', () => {
    it('permite recibir solicitudes solo cuando está disponible', () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.DISPONIBLE,
      });

      expect(() => publicacion.validarPuedeRecibirSolicitudes()).not.toThrow();
    });

    it.each([
      EstadoPublicacion.RESERVADA,
      EstadoPublicacion.PAUSADA,
      EstadoPublicacion.ENTREGADA,
      EstadoPublicacion.ELIMINADA,
    ])('rechaza recibir solicitudes cuando está en estado %s', (estado) => {
      const publicacion = crearPublicacion({ estado });

      expect(() => publicacion.validarPuedeRecibirSolicitudes()).toThrow(
        BadRequestException,
      );
      expect(() => publicacion.validarPuedeRecibirSolicitudes()).toThrow(
        'La publicación no está disponible para recibir solicitudes',
      );
    });
  });

  describe('edición', () => {
    it.each([EstadoPublicacion.DISPONIBLE, EstadoPublicacion.PAUSADA])(
      'puede editar cuando está en estado %s',
      (estado) => {
        const publicacion = crearPublicacion({ estado });

        expect(publicacion.puedeEditar()).toBe(true);
      },
    );

    it.each([
      EstadoPublicacion.RESERVADA,
      EstadoPublicacion.ENTREGADA,
      EstadoPublicacion.ELIMINADA,
    ])('no puede editar cuando está en estado %s', (estado) => {
      const publicacion = crearPublicacion({ estado });

      expect(publicacion.puedeEditar()).toBe(false);
    });

    it('edita todos los campos enviados y actualiza updatedAt', () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.DISPONIBLE,
      });

      const dto: EditarPublicacionDto = {
        titulo: 'Título editado',
        descripcion: 'Descripción editada válida',
        imagenUrls: ['http://localhost:3000/uploads/publicaciones/nueva.png'],
        condicion: CondicionObjeto.NUEVO,
        categoriaId: '33333333-3333-4333-8333-333333333333',
        localidadId: '44444444-4444-4444-8444-444444444444',
      };

      publicacion.editar(dto);

      expect(publicacion.titulo).toBe('Título editado');
      expect(publicacion.descripcion).toBe('Descripción editada válida');
      expect(publicacion.imagenUrls).toEqual([
        'http://localhost:3000/uploads/publicaciones/nueva.png',
      ]);
      expect(publicacion.condicion).toBe(CondicionObjeto.NUEVO);
      expect(publicacion.categoriaId).toBe(
        '33333333-3333-4333-8333-333333333333',
      );
      expect(publicacion.localidadId).toBe(
        '44444444-4444-4444-8444-444444444444',
      );
      expect(publicacion.updatedAt).toEqual(fechaActual);
    });

    it('permite editar una publicación pausada', () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.PAUSADA,
      });

      publicacion.editar({
        titulo: 'Título pausado editado',
      });

      expect(publicacion.titulo).toBe('Título pausado editado');
      expect(publicacion.updatedAt).toEqual(fechaActual);
    });

    it('no pisa campos cuando el dto trae propiedades undefined', () => {
      const fechaOriginal = new Date('2026-06-20T09:00:00.000Z');
      const publicacion = crearPublicacion({
        titulo: 'Título original',
        descripcion: 'Descripción original',
        imagenUrls: [
          'http://localhost:3000/uploads/publicaciones/original.png',
        ],
        condicion: CondicionObjeto.USADO_REGULAR,
        categoriaId: '11111111-1111-4111-8111-111111111111',
        localidadId: '22222222-2222-4222-8222-222222222222',
        updatedAt: fechaOriginal,
      });

      publicacion.editar({
        titulo: undefined,
        descripcion: undefined,
        imagenUrls: undefined,
        condicion: undefined,
        categoriaId: undefined,
        localidadId: undefined,
      });

      expect(publicacion.titulo).toBe('Título original');
      expect(publicacion.descripcion).toBe('Descripción original');
      expect(publicacion.imagenUrls).toEqual([
        'http://localhost:3000/uploads/publicaciones/original.png',
      ]);
      expect(publicacion.condicion).toBe(CondicionObjeto.USADO_REGULAR);
      expect(publicacion.categoriaId).toBe(
        '11111111-1111-4111-8111-111111111111',
      );
      expect(publicacion.localidadId).toBe(
        '22222222-2222-4222-8222-222222222222',
      );
      expect(publicacion.updatedAt).toEqual(fechaActual);
    });

    it.each([
      EstadoPublicacion.RESERVADA,
      EstadoPublicacion.ENTREGADA,
      EstadoPublicacion.ELIMINADA,
    ])('rechaza editar cuando está en estado %s y no muta datos', (estado) => {
      const fechaOriginal = new Date('2026-06-20T09:00:00.000Z');
      const publicacion = crearPublicacion({
        estado,
        titulo: 'Título original',
        updatedAt: fechaOriginal,
      });

      expect(() => publicacion.editar({ titulo: 'Título editado' })).toThrow(
        BadRequestException,
      );

      expect(() => publicacion.editar({ titulo: 'Título editado' })).toThrow(
        'La publicación no puede editarse en su estado actual',
      );

      expect(publicacion.estado).toBe(estado);
      expect(publicacion.titulo).toBe('Título original');
      expect(publicacion.updatedAt).toBe(fechaOriginal);
    });
  });

  describe('máquina de estados declarada', () => {
    it('mantiene las transiciones permitidas esperadas', () => {
      expect(TRANSICIONES_PUBLICACION).toEqual({
        [EstadoPublicacion.DISPONIBLE]: [
          EstadoPublicacion.RESERVADA,
          EstadoPublicacion.PAUSADA,
          EstadoPublicacion.ELIMINADA,
        ],
        [EstadoPublicacion.RESERVADA]: [
          EstadoPublicacion.ENTREGADA,
          EstadoPublicacion.DISPONIBLE,
        ],
        [EstadoPublicacion.PAUSADA]: [
          EstadoPublicacion.DISPONIBLE,
          EstadoPublicacion.ELIMINADA,
        ],
        [EstadoPublicacion.ENTREGADA]: [],
        [EstadoPublicacion.ELIMINADA]: [],
      });
    });

    it.each([
      [EstadoPublicacion.DISPONIBLE, EstadoPublicacion.RESERVADA, 'reservar'],
      [EstadoPublicacion.DISPONIBLE, EstadoPublicacion.PAUSADA, 'pausar'],
      [EstadoPublicacion.PAUSADA, EstadoPublicacion.DISPONIBLE, 'reactivar'],
      [EstadoPublicacion.RESERVADA, EstadoPublicacion.ENTREGADA, 'entregar'],
      [
        EstadoPublicacion.RESERVADA,
        EstadoPublicacion.DISPONIBLE,
        'cancelarReserva',
      ],
      [EstadoPublicacion.DISPONIBLE, EstadoPublicacion.ELIMINADA, 'eliminar'],
      [EstadoPublicacion.PAUSADA, EstadoPublicacion.ELIMINADA, 'eliminar'],
    ] as const)(
      'permite pasar de %s a %s con %s',
      (estadoInicial, estadoFinal, metodo) => {
        const publicacion = crearPublicacion({
          estado: estadoInicial,
          deletedAt: undefined,
        });

        publicacion[metodo]();

        expect(publicacion.estado).toBe(estadoFinal);

        if (estadoFinal === EstadoPublicacion.ELIMINADA) {
          expect(publicacion.deletedAt).toEqual(fechaActual);
        }
      },
    );

    it.each([
      [EstadoPublicacion.RESERVADA, 'reservar'],
      [EstadoPublicacion.PAUSADA, 'reservar'],
      [EstadoPublicacion.ENTREGADA, 'reservar'],
      [EstadoPublicacion.ELIMINADA, 'reservar'],
      [EstadoPublicacion.RESERVADA, 'pausar'],
      [EstadoPublicacion.PAUSADA, 'pausar'],
      [EstadoPublicacion.ENTREGADA, 'pausar'],
      [EstadoPublicacion.ELIMINADA, 'pausar'],
      [EstadoPublicacion.DISPONIBLE, 'reactivar'],
      [EstadoPublicacion.RESERVADA, 'reactivar'],
      [EstadoPublicacion.ENTREGADA, 'reactivar'],
      [EstadoPublicacion.ELIMINADA, 'reactivar'],
      [EstadoPublicacion.DISPONIBLE, 'entregar'],
      [EstadoPublicacion.PAUSADA, 'entregar'],
      [EstadoPublicacion.ENTREGADA, 'entregar'],
      [EstadoPublicacion.ELIMINADA, 'entregar'],
      [EstadoPublicacion.DISPONIBLE, 'cancelarReserva'],
      [EstadoPublicacion.PAUSADA, 'cancelarReserva'],
      [EstadoPublicacion.ENTREGADA, 'cancelarReserva'],
      [EstadoPublicacion.ELIMINADA, 'cancelarReserva'],
      [EstadoPublicacion.RESERVADA, 'eliminar'],
      [EstadoPublicacion.ENTREGADA, 'eliminar'],
      [EstadoPublicacion.ELIMINADA, 'eliminar'],
    ] as const)(
      'rechaza ejecutar %s cuando el estado inicial es %s',
      (estadoInicial, metodo) => {
        const fechaBorradoOriginal = undefined;
        const publicacion = crearPublicacion({
          estado: estadoInicial,
          deletedAt: fechaBorradoOriginal,
        });

        expect(() => publicacion[metodo]()).toThrow(BadRequestException);
        expect(publicacion.estado).toBe(estadoInicial);
        expect(publicacion.deletedAt).toBe(fechaBorradoOriginal);
      },
    );
  });

  describe('eliminarPorModeracion', () => {
    it('elimina una publicación reservada por moderación aunque la transición normal no lo permita', () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.RESERVADA,
        deletedAt: undefined,
      });

      publicacion.eliminarPorModeracion();

      expect(publicacion.estado).toBe(EstadoPublicacion.ELIMINADA);
      expect(publicacion.deletedAt).toEqual(fechaActual);
    });

    it.each([EstadoPublicacion.DISPONIBLE, EstadoPublicacion.PAUSADA])(
      'elimina por moderación desde estado %s usando la transición normal',
      (estado) => {
        const publicacion = crearPublicacion({
          estado,
          deletedAt: undefined,
        });

        publicacion.eliminarPorModeracion();

        expect(publicacion.estado).toBe(EstadoPublicacion.ELIMINADA);
        expect(publicacion.deletedAt).toEqual(fechaActual);
      },
    );

    it.each([EstadoPublicacion.ENTREGADA, EstadoPublicacion.ELIMINADA])(
      'rechaza eliminar por moderación desde estado %s',
      (estado) => {
        const publicacion = crearPublicacion({
          estado,
          deletedAt: undefined,
        });

        expect(() => publicacion.eliminarPorModeracion()).toThrow(
          BadRequestException,
        );
        expect(publicacion.estado).toBe(estado);
        expect(publicacion.deletedAt).toBeUndefined();
      },
    );
  });

  describe('metadata de TypeORM', () => {
    it('mapea la entidad a la tabla publicacion', () => {
      expect(obtenerTabla().name).toBe('publicacion');
    });

    it('define id como primary generated uuid', () => {
      const columna = obtenerColumna('id');
      const generacion = obtenerGeneracion('id');

      expect(columna.options.primary).toBe(true);
      expect(columna.options.type).toBe('uuid');
      expect(generacion.strategy).toBe('uuid');
    });

    it('define columnas uuid obligatorias', () => {
      expect(obtenerColumna('creadorId').options).toMatchObject({
        type: 'uuid',
      });
      expect(obtenerColumna('categoriaId').options).toMatchObject({
        type: 'uuid',
      });
      expect(obtenerColumna('localidadId').options).toMatchObject({
        type: 'uuid',
      });
    });

    it('define columnas de texto con configuración esperada', () => {
      expect(obtenerColumna('titulo').options.length).toBe(100);
      expect(obtenerColumna('descripcion').options.type).toBe('text');
    });

    it('define condicion y estado como enums', () => {
      expect(obtenerColumna('condicion').options.type).toBe('enum');
      expect(obtenerColumna('condicion').options.enum).toBe(CondicionObjeto);

      expect(obtenerColumna('estado').options.type).toBe('enum');
      expect(obtenerColumna('estado').options.enum).toBe(EstadoPublicacion);
      expect(obtenerColumna('estado').options.default).toBe(
        EstadoPublicacion.DISPONIBLE,
      );
    });

    it('define imagenUrls como jsonb con default array vacío', () => {
      expect(obtenerColumna('imagenUrls').options).toMatchObject({
        type: 'jsonb',
        default: [],
      });
    });

    it('define columnas de control de fechas y versionado', () => {
      expect(obtenerColumna('version').mode).toBe('version');
      expect(obtenerColumna('createdAt').mode).toBe('createDate');
      expect(obtenerColumna('updatedAt').mode).toBe('updateDate');
      expect(obtenerColumna('updatedAt').options.nullable).toBe(true);
      expect(obtenerColumna('deletedAt').mode).toBe('deleteDate');
      expect(obtenerColumna('deletedAt').options.nullable).toBe(true);
    });

    it('define relación OneToMany con solicitudes', () => {
      const relacion = obtenerRelacion('solicitudes');

      expect(relacion.relationType).toBe('one-to-many');
    });
  });

  function crearPublicacion(datos?: Partial<Publicacion>): Publicacion {
    return Object.assign(new Publicacion(), {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      creadorId: 'usuario-creador',
      titulo: 'Mesa de madera',
      descripcion: 'Mesa de madera en buen estado para donar.',
      categoriaId: '11111111-1111-4111-8111-111111111111',
      localidadId: '22222222-2222-4222-8222-222222222222',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/mesa.webp'],
      estado: EstadoPublicacion.DISPONIBLE,
      version: 1,
      createdAt: new Date('2026-06-20T09:00:00.000Z'),
      updatedAt: new Date('2026-06-20T09:00:00.000Z'),
      deletedAt: undefined,
      solicitudes: [],
      ...datos,
    });
  }

  function obtenerTabla() {
    const tabla = getMetadataArgsStorage().tables.find(
      (metadata) => metadata.target === Publicacion,
    );

    if (!tabla) {
      throw new Error('No se encontró metadata de tabla para Publicacion');
    }

    return tabla;
  }

  function obtenerColumna(propiedad: ColumnaPublicacion) {
    const columna = getMetadataArgsStorage().columns.find(
      (metadata) =>
        metadata.target === Publicacion && metadata.propertyName === propiedad,
    );

    if (!columna) {
      throw new Error(`No se encontró metadata de columna para ${propiedad}`);
    }

    return columna;
  }

  function obtenerGeneracion(propiedad: ColumnaPublicacion) {
    const generacion = getMetadataArgsStorage().generations.find(
      (metadata) =>
        metadata.target === Publicacion && metadata.propertyName === propiedad,
    );

    if (!generacion) {
      throw new Error(
        `No se encontró metadata de generación para ${propiedad}`,
      );
    }

    return generacion;
  }

  function obtenerRelacion(propiedad: RelacionPublicacion) {
    const relacion = getMetadataArgsStorage().relations.find(
      (metadata) =>
        metadata.target === Publicacion && metadata.propertyName === propiedad,
    );

    if (!relacion) {
      throw new Error(`No se encontró relación ${propiedad}`);
    }

    return relacion;
  }
});
