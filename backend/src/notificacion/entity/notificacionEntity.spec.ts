import { getMetadataArgsStorage } from 'typeorm';

import { TipoNotificacion } from '../enum/tipoNotificacion';
import { Notificacion } from './notificacionEntity';
type ColumnaNotificacion =
  | 'id'
  | 'destinatarioId'
  | 'tipo'
  | 'titulo'
  | 'mensaje'
  | 'leidaEn'
  | 'solicitudId'
  | 'publicacionId'
  | 'denunciaId'
  | 'creadaEn';

type RelacionNotificacion =
  | 'destinatario'
  | 'solicitud'
  | 'publicacion'
  | 'denuncia';

describe('Notificacion', () => {
  const fechaActual = new Date('2026-06-24T10:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('marcarComoLeida', () => {
    it('marca como leída una notificación no leída', () => {
      const notificacion = crearNotificacion({ leidaEn: null });

      notificacion.marcarComoLeida();

      expect(notificacion.leidaEn).toEqual(fechaActual);
    });

    it('guarda una instancia de Date al marcar como leída', () => {
      const notificacion = crearNotificacion({ leidaEn: null });

      notificacion.marcarComoLeida();

      expect(notificacion.leidaEn).toBeInstanceOf(Date);
    });

    it('no pisa la fecha de lectura si la notificación ya estaba leída', () => {
      const fechaOriginal = new Date('2026-06-20T15:30:00.000Z');
      const notificacion = crearNotificacion({ leidaEn: fechaOriginal });

      notificacion.marcarComoLeida();

      expect(notificacion.leidaEn).toBe(fechaOriginal);
      expect(notificacion.leidaEn).toEqual(fechaOriginal);
    });

    it('es idempotente: si se marca dos veces, conserva la primera fecha de lectura', () => {
      const notificacion = crearNotificacion({ leidaEn: null });

      notificacion.marcarComoLeida();

      const primeraFechaLectura = notificacion.leidaEn;

      jest.setSystemTime(new Date('2026-06-25T10:00:00.000Z'));

      notificacion.marcarComoLeida();

      expect(notificacion.leidaEn).toBe(primeraFechaLectura);
      expect(notificacion.leidaEn).toEqual(fechaActual);
    });

    it('no modifica los datos principales de la notificación al marcarla como leída', () => {
      const notificacion = crearNotificacion({
        id: '11111111-1111-4111-8111-111111111111',
        destinatarioId: '22222222-2222-4222-8222-222222222222',
        tipo: TipoNotificacion.PUBLICACION_ELIMINADA,
        titulo: 'Publicación eliminada',
        mensaje: 'Tu publicación fue eliminada por moderación.',
        solicitudId: null,
        publicacionId: '33333333-3333-4333-8333-333333333333',
        denunciaId: null,
        creadaEn: new Date('2026-06-23T09:00:00.000Z'),
      });

      notificacion.marcarComoLeida();

      expect(notificacion).toMatchObject({
        id: '11111111-1111-4111-8111-111111111111',
        destinatarioId: '22222222-2222-4222-8222-222222222222',
        tipo: TipoNotificacion.PUBLICACION_ELIMINADA,
        titulo: 'Publicación eliminada',
        mensaje: 'Tu publicación fue eliminada por moderación.',
        solicitudId: null,
        publicacionId: '33333333-3333-4333-8333-333333333333',
        denunciaId: null,
        creadaEn: new Date('2026-06-23T09:00:00.000Z'),
      });
      expect(notificacion.leidaEn).toEqual(fechaActual);
    });

    it('conserva las relaciones cargadas al marcar como leída', () => {
      const destinatario = { id: 'usuario-1' };
      const solicitud = { id: 'solicitud-1' };

      const notificacion = crearNotificacion({
        destinatario: destinatario as never,
        solicitud: solicitud as never,
        publicacion: null,
        denuncia: null,
      });

      notificacion.marcarComoLeida();

      expect(notificacion.destinatario).toBe(destinatario);
      expect(notificacion.solicitud).toBe(solicitud);
      expect(notificacion.publicacion).toBeNull();
      expect(notificacion.denuncia).toBeNull();
    });
  });

  describe('metadata de TypeORM', () => {
    it('mapea la entidad a la tabla notificaciones', () => {
      expect(obtenerTabla().name).toBe('notificaciones');
    });

    it('define id como primary generated uuid', () => {
      const columna = obtenerColumna('id');
      const generacion = obtenerGeneracion('id');

      expect(columna.options.primary).toBe(true);
      expect(columna.options.type).toBe('uuid');
      expect(generacion.strategy).toBe('uuid');
    });

    it('define las columnas obligatorias principales con el tipo esperado', () => {
      expect(obtenerColumna('destinatarioId').options).toMatchObject({
        type: 'uuid',
      });

      expect(obtenerColumna('tipo').options.type).toBe('enum');
      expect(obtenerColumna('tipo').options.enum).toBe(TipoNotificacion);

      expect(obtenerColumna('titulo').options.length).toBe(100);

      expect(obtenerColumna('mensaje').options).toMatchObject({
        type: 'text',
      });
    });

    it('define leidaEn como timestamp nullable', () => {
      expect(obtenerColumna('leidaEn').options).toMatchObject({
        type: 'timestamp',
        nullable: true,
      });
    });

    it('define las referencias opcionales como uuid nullable', () => {
      expect(obtenerColumna('solicitudId').options).toMatchObject({
        type: 'uuid',
        nullable: true,
      });

      expect(obtenerColumna('publicacionId').options).toMatchObject({
        type: 'uuid',
        nullable: true,
      });

      expect(obtenerColumna('denunciaId').options).toMatchObject({
        type: 'uuid',
        nullable: true,
      });
    });

    it('define creadaEn como CreateDateColumn', () => {
      expect(obtenerColumna('creadaEn').mode).toBe('createDate');
    });

    it('define el check que permite como máximo una referencia', () => {
      const check = obtenerCheck('CHK_NOTIFICACION_UNA_REFERENCIA');

      expect(check.expression).toBe(
        'num_nonnulls("solicitudId", "publicacionId", "denunciaId") <= 1',
      );
    });

    it('define índice por destinatario y fecha de creación', () => {
      const indice = obtenerIndice('IDX_NOTIFICACION_DESTINATARIO_FECHA');

      expect(indice.columns).toEqual(['destinatarioId', 'creadaEn']);
    });

    it('define índice parcial para notificaciones no leídas', () => {
      const indice = obtenerIndice('IDX_NOTIFICACION_NO_LEIDA');

      expect(indice.columns).toEqual(['destinatarioId']);
      expect(indice.where).toBe('"leidaEn" IS NULL');
    });

    it('define relación obligatoria con destinatario eliminando en cascada', () => {
      const relacion = obtenerRelacion('destinatario');
      const joinColumn = obtenerJoinColumn('destinatario');

      expect(relacion.relationType).toBe('many-to-one');
      expect(relacion.options.onDelete).toBe('CASCADE');
      expect(joinColumn.name).toBe('destinatarioId');
    });

    it('define relación opcional con solicitud usando SET NULL', () => {
      const relacion = obtenerRelacion('solicitud');
      const joinColumn = obtenerJoinColumn('solicitud');

      expect(relacion.relationType).toBe('many-to-one');
      expect(relacion.options.nullable).toBe(true);
      expect(relacion.options.onDelete).toBe('SET NULL');
      expect(joinColumn.name).toBe('solicitudId');
    });

    it('define relación opcional con publicación usando SET NULL', () => {
      const relacion = obtenerRelacion('publicacion');
      const joinColumn = obtenerJoinColumn('publicacion');

      expect(relacion.relationType).toBe('many-to-one');
      expect(relacion.options.nullable).toBe(true);
      expect(relacion.options.onDelete).toBe('SET NULL');
      expect(joinColumn.name).toBe('publicacionId');
    });

    it('define relación opcional con denuncia usando SET NULL', () => {
      const relacion = obtenerRelacion('denuncia');
      const joinColumn = obtenerJoinColumn('denuncia');

      expect(relacion.relationType).toBe('many-to-one');
      expect(relacion.options.nullable).toBe(true);
      expect(relacion.options.onDelete).toBe('SET NULL');
      expect(joinColumn.name).toBe('denunciaId');
    });
  });

  function crearNotificacion(datos?: Partial<Notificacion>): Notificacion {
    return Object.assign(new Notificacion(), {
      id: '11111111-1111-4111-8111-111111111111',
      destinatarioId: '22222222-2222-4222-8222-222222222222',
      tipo: TipoNotificacion.SOLICITUD_CREADA,
      titulo: 'Nueva solicitud',
      mensaje: 'Recibiste una nueva solicitud.',
      leidaEn: null,
      solicitudId: null,
      solicitud: null,
      publicacionId: null,
      publicacion: null,
      denunciaId: null,
      denuncia: null,
      creadaEn: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    });
  }

  function obtenerTabla() {
    const tabla = getMetadataArgsStorage().tables.find(
      (metadata) => metadata.target === Notificacion,
    );

    if (!tabla) {
      throw new Error('No se encontró metadata de tabla para Notificacion');
    }

    return tabla;
  }

  function obtenerColumna(propiedad: ColumnaNotificacion) {
    const columna = getMetadataArgsStorage().columns.find(
      (metadata) =>
        metadata.target === Notificacion && metadata.propertyName === propiedad,
    );

    if (!columna) {
      throw new Error(`No se encontró metadata de columna para ${propiedad}`);
    }

    return columna;
  }

  function obtenerGeneracion(propiedad: ColumnaNotificacion) {
    const generacion = getMetadataArgsStorage().generations.find(
      (metadata) =>
        metadata.target === Notificacion && metadata.propertyName === propiedad,
    );

    if (!generacion) {
      throw new Error(
        `No se encontró metadata de generación para ${propiedad}`,
      );
    }

    return generacion;
  }

  function obtenerCheck(nombre: string) {
    const check = getMetadataArgsStorage().checks.find(
      (metadata) =>
        metadata.target === Notificacion && metadata.name === nombre,
    );

    if (!check) {
      throw new Error(`No se encontró check ${nombre}`);
    }

    return check;
  }

  function obtenerIndice(nombre: string) {
    const indice = getMetadataArgsStorage().indices.find(
      (metadata) =>
        metadata.target === Notificacion && metadata.name === nombre,
    );

    if (!indice) {
      throw new Error(`No se encontró índice ${nombre}`);
    }

    return indice;
  }

  function obtenerRelacion(propiedad: RelacionNotificacion) {
    const relacion = getMetadataArgsStorage().relations.find(
      (metadata) =>
        metadata.target === Notificacion && metadata.propertyName === propiedad,
    );

    if (!relacion) {
      throw new Error(`No se encontró relación ${propiedad}`);
    }

    return relacion;
  }

  function obtenerJoinColumn(propiedad: RelacionNotificacion) {
    const joinColumn = getMetadataArgsStorage().joinColumns.find(
      (metadata) =>
        metadata.target === Notificacion && metadata.propertyName === propiedad,
    );

    if (!joinColumn) {
      throw new Error(`No se encontró JoinColumn para ${propiedad}`);
    }

    return joinColumn;
  }
});
