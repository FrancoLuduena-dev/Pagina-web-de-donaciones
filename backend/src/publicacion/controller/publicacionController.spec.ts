import { BadRequestException, RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';

import { StatusGuard } from 'src/compartidos/guards/statusGuard';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { AuthGuard } from 'src/usuario/auth/authGuard';
import Usuario from 'src/usuario/entity/usuarioEntity';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';

import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';
import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionService } from '../service/publicacionService';
import { PublicacionController } from './publicacionController';

type PublicacionServiceMock = jest.Mocked<
  Pick<
    PublicacionService,
    | 'crearPublicacion'
    | 'listarPublico'
    | 'listarMisPublicaciones'
    | 'buscarPublicacionPorIdConCreador'
    | 'pausar'
    | 'reactivar'
    | 'eliminar'
    | 'editar'
  >
>;

type MetodoController =
  | 'subirImagenes'
  | 'crearPublicacion'
  | 'listarFeedPublico'
  | 'listarMisPublicaciones'
  | 'buscarPublicacionPorId'
  | 'pausar'
  | 'reactivar'
  | 'eliminar'
  | 'editar';

describe('PublicacionController', () => {
  let controller: PublicacionController;
  let service: PublicacionServiceMock;

  const uploadDir = join(process.cwd(), 'uploads', 'publicaciones');
  const archivosTemporales: string[] = [];

  beforeEach(() => {
    service = crearPublicacionServiceMock();

    controller = new PublicacionController(
      service as unknown as PublicacionService,
    );
  });

  it('se instancia con sus dependencias', () => {
    expect(controller).toBeDefined();
  });

  afterEach(async () => {
    await Promise.all(
      archivosTemporales.map((archivoPath) => rm(archivoPath, { force: true })),
    );

    archivosTemporales.length = 0;
    jest.restoreAllMocks();
  });

  describe('metadata de rutas y guards', () => {
    it('expone el path base publicaciones', () => {
      expect(obtenerMetadata(PATH_METADATA, PublicacionController)).toBe(
        'publicaciones',
      );
    });

    it.each([
      {
        metodo: 'subirImagenes' as const,
        path: 'upload',
        requestMethod: RequestMethod.POST,
      },
      {
        metodo: 'crearPublicacion' as const,
        path: '/',
        requestMethod: RequestMethod.POST,
      },
      {
        metodo: 'listarFeedPublico' as const,
        path: '/',
        requestMethod: RequestMethod.GET,
      },
      {
        metodo: 'listarMisPublicaciones' as const,
        path: 'mias',
        requestMethod: RequestMethod.GET,
      },
      {
        metodo: 'buscarPublicacionPorId' as const,
        path: ':id',
        requestMethod: RequestMethod.GET,
      },
      {
        metodo: 'pausar' as const,
        path: ':id/pausar',
        requestMethod: RequestMethod.PATCH,
      },
      {
        metodo: 'reactivar' as const,
        path: ':id/reactivar',
        requestMethod: RequestMethod.PATCH,
      },
      {
        metodo: 'eliminar' as const,
        path: ':id/eliminar',
        requestMethod: RequestMethod.DELETE,
      },
      {
        metodo: 'editar' as const,
        path: ':id',
        requestMethod: RequestMethod.PATCH,
      },
    ])(
      'define ruta $requestMethod $path en $metodo',
      ({ metodo, path, requestMethod }) => {
        expect(obtenerRuta(metodo)).toEqual({
          path,
          method: requestMethod,
        });
      },
    );

    it.each([
      ['subirImagenes' as const, [AuthGuard, StatusGuard]],
      ['crearPublicacion' as const, [AuthGuard, StatusGuard]],
      ['listarMisPublicaciones' as const, [AuthGuard]],
      ['pausar' as const, [AuthGuard, StatusGuard]],
      ['reactivar' as const, [AuthGuard, StatusGuard]],
      ['eliminar' as const, [AuthGuard, StatusGuard]],
      ['editar' as const, [AuthGuard, StatusGuard]],
    ])('define guards esperados en %s', (metodo, guardsEsperados) => {
      expect(obtenerGuards(metodo)).toEqual(guardsEsperados);
    });

    it.each([
      ['listarFeedPublico' as const],
      ['buscarPublicacionPorId' as const],
    ])('no exige guards en endpoint público %s', (metodo) => {
      expect(obtenerGuards(metodo)).toBeUndefined();
    });
  });

  describe('subirImagenes', () => {
    it('rechaza upload sin archivos', async () => {
      await expect(controller.subirImagenes([])).rejects.toThrow(
        BadRequestException,
      );

      await expect(controller.subirImagenes([])).rejects.toThrow(
        'No se recibió ninguna imagen',
      );
    });

    it('rechaza upload cuando files es undefined', async () => {
      await expect(
        controller.subirImagenes(undefined as unknown as Express.Multer.File[]),
      ).rejects.toThrow('No se recibió ninguna imagen');
    });

    it('devuelve urls públicas para las imágenes subidas', async () => {
      const files = [
        await crearArchivoMulterValido('imagen-1.png'),
        await crearArchivoMulterValido('imagen-2.png'),
      ];

      await expect(controller.subirImagenes(files)).resolves.toEqual({
        imagenUrls: [
          'http://localhost:3000/uploads/publicaciones/imagen-1.png',
          'http://localhost:3000/uploads/publicaciones/imagen-2.png',
        ],
      });
    });

    it('rechaza archivos cuyo contenido no coincide con una imagen real', async () => {
      const files = [await crearArchivoMulterInvalido('imagen-falsa.png')];

      await expect(controller.subirImagenes(files)).rejects.toThrow(
        'Uno o más archivos no contienen una imagen válida',
      );
    });
  });

  describe('crearPublicacion', () => {
    it('crea publicación usando dto e id del usuario autenticado', async () => {
      const dto = crearCrearPublicacionDto();
      const req = crearRequest('usuario-creador-1', rolUsuario.usuarioNormal);
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador-1',
      });

      service.crearPublicacion.mockResolvedValue(publicacion);

      await expect(controller.crearPublicacion(dto, req)).resolves.toBe(
        publicacion,
      );

      expect(service.crearPublicacion).toHaveBeenCalledTimes(1);
      expect(service.crearPublicacion).toHaveBeenCalledWith(
        dto,
        'usuario-creador-1',
      );
    });

    it('no usa el rol para crear publicación', async () => {
      const dto = crearCrearPublicacionDto();
      const req = crearRequest(
        'usuario-creador-2',
        rolUsuario.usuarioAdministrador,
      );
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador-2',
      });

      service.crearPublicacion.mockResolvedValue(publicacion);

      await controller.crearPublicacion(dto, req);

      expect(service.crearPublicacion).toHaveBeenCalledWith(
        dto,
        'usuario-creador-2',
      );
    });

    it('propaga errores del service al crear publicación', async () => {
      service.crearPublicacion.mockRejectedValue(
        new Error('Error al crear publicación'),
      );

      await expect(
        controller.crearPublicacion(
          crearCrearPublicacionDto(),
          crearRequest('usuario-1', rolUsuario.usuarioNormal),
        ),
      ).rejects.toThrow('Error al crear publicación');
    });
  });

  describe('listarFeedPublico', () => {
    it('delega el listado público al service con los filtros recibidos', async () => {
      const filtros: FiltrosPublicacionDto = {
        q: 'mesa',
        estado: EstadoPublicacion.DISPONIBLE,
        condicion: CondicionObjeto.USADO_BUENO,
        categoriaId: 'categoria-1',
        localidadId: 'localidad-1',
      };
      const publicaciones = [crearPublicacion()];

      service.listarPublico.mockResolvedValue(publicaciones);

      await expect(controller.listarFeedPublico(filtros)).resolves.toBe(
        publicaciones,
      );

      expect(service.listarPublico).toHaveBeenCalledTimes(1);
      expect(service.listarPublico).toHaveBeenCalledWith(filtros);
    });

    it('delega filtros vacíos sin inventar defaults en el controller', async () => {
      const filtros: FiltrosPublicacionDto = {};

      service.listarPublico.mockResolvedValue([]);

      await expect(controller.listarFeedPublico(filtros)).resolves.toEqual([]);

      expect(service.listarPublico).toHaveBeenCalledWith(filtros);
    });

    it('propaga errores del service al listar feed público', async () => {
      service.listarPublico.mockRejectedValue(new Error('Error al listar'));

      await expect(controller.listarFeedPublico({})).rejects.toThrow(
        'Error al listar',
      );
    });
  });

  describe('listarMisPublicaciones', () => {
    it('lista publicaciones propias usando id del usuario y estado recibido', async () => {
      const req = crearRequest('usuario-1', rolUsuario.usuarioNormal);
      const publicaciones = [
        crearPublicacion({
          id: 'publicacion-1',
          creadorId: 'usuario-1',
          estado: EstadoPublicacion.PAUSADA,
        }),
      ];

      service.listarMisPublicaciones.mockResolvedValue(publicaciones);

      await expect(
        controller.listarMisPublicaciones(req, EstadoPublicacion.PAUSADA),
      ).resolves.toBe(publicaciones);

      expect(service.listarMisPublicaciones).toHaveBeenCalledTimes(1);
      expect(service.listarMisPublicaciones).toHaveBeenCalledWith(
        'usuario-1',
        EstadoPublicacion.PAUSADA,
      );
    });

    it('permite listar publicaciones propias sin filtro de estado', async () => {
      const req = crearRequest('usuario-1', rolUsuario.usuarioNormal);

      service.listarMisPublicaciones.mockResolvedValue([]);

      await expect(controller.listarMisPublicaciones(req)).resolves.toEqual([]);

      expect(service.listarMisPublicaciones).toHaveBeenCalledWith(
        'usuario-1',
        undefined,
      );
    });
  });

  describe('buscarPublicacionPorId', () => {
    it('busca detalle público por id usando método con creador', async () => {
      const publicacion = Object.assign(
        crearPublicacion({ id: 'publicacion-1' }),
        {
          creadorNombreUsuario: 'melina',
          creadorNombreCompleto: 'Melina De Marte',
        },
      );

      service.buscarPublicacionPorIdConCreador.mockResolvedValue(publicacion);

      await expect(
        controller.buscarPublicacionPorId('publicacion-1'),
      ).resolves.toBe(publicacion);

      expect(service.buscarPublicacionPorIdConCreador).toHaveBeenCalledTimes(1);
      expect(service.buscarPublicacionPorIdConCreador).toHaveBeenCalledWith(
        'publicacion-1',
      );
    });

    it('propaga NotFound u otros errores del service al buscar por id', async () => {
      service.buscarPublicacionPorIdConCreador.mockRejectedValue(
        new Error('Publicación no encontrada'),
      );

      await expect(
        controller.buscarPublicacionPorId('publicacion-inexistente'),
      ).rejects.toThrow('Publicación no encontrada');
    });
  });

  describe('pausar', () => {
    it('pausa publicación usando id, usuario autenticado y rol', async () => {
      const req = crearRequest('moderador-1', rolUsuario.usuarioModerador);
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        estado: EstadoPublicacion.PAUSADA,
      });

      service.pausar.mockResolvedValue(publicacion);

      await expect(controller.pausar('publicacion-1', req)).resolves.toBe(
        publicacion,
      );

      expect(service.pausar).toHaveBeenCalledTimes(1);
      expect(service.pausar).toHaveBeenCalledWith(
        'publicacion-1',
        'moderador-1',
        rolUsuario.usuarioModerador,
      );
    });
  });

  describe('reactivar', () => {
    it('reactiva publicación usando id, usuario autenticado y rol', async () => {
      const req = crearRequest('admin-1', rolUsuario.usuarioAdministrador);
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      service.reactivar.mockResolvedValue(publicacion);

      await expect(controller.reactivar('publicacion-1', req)).resolves.toBe(
        publicacion,
      );

      expect(service.reactivar).toHaveBeenCalledTimes(1);
      expect(service.reactivar).toHaveBeenCalledWith(
        'publicacion-1',
        'admin-1',
        rolUsuario.usuarioAdministrador,
      );
    });
  });

  describe('eliminar', () => {
    it('elimina publicación usando id, usuario autenticado y rol', async () => {
      const req = crearRequest('usuario-creador-1', rolUsuario.usuarioNormal);
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador-1',
        estado: EstadoPublicacion.ELIMINADA,
      });

      service.eliminar.mockResolvedValue(publicacion);

      await expect(controller.eliminar('publicacion-1', req)).resolves.toBe(
        publicacion,
      );

      expect(service.eliminar).toHaveBeenCalledTimes(1);
      expect(service.eliminar).toHaveBeenCalledWith(
        'publicacion-1',
        'usuario-creador-1',
        rolUsuario.usuarioNormal,
      );
    });

    it('propaga errores del service al eliminar', async () => {
      service.eliminar.mockRejectedValue(new Error('No se puede eliminar'));

      await expect(
        controller.eliminar(
          'publicacion-1',
          crearRequest('usuario-1', rolUsuario.usuarioNormal),
        ),
      ).rejects.toThrow('No se puede eliminar');
    });
  });

  describe('editar', () => {
    it('edita publicación usando id, dto e id del usuario autenticado', async () => {
      const dto: EditarPublicacionDto = {
        titulo: 'Título editado',
        descripcion: 'Descripción editada válida',
        imagenUrls: ['/uploads/publicaciones/editada.webp'],
      };
      const req = crearRequest('usuario-creador-1', rolUsuario.usuarioNormal);
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        creadorId: 'usuario-creador-1',
        titulo: 'Título editado',
      });

      service.editar.mockResolvedValue(publicacion);

      await expect(controller.editar('publicacion-1', dto, req)).resolves.toBe(
        publicacion,
      );

      expect(service.editar).toHaveBeenCalledTimes(1);
      expect(service.editar).toHaveBeenCalledWith(
        'publicacion-1',
        dto,
        'usuario-creador-1',
      );
    });

    it('no envía el rol al service al editar porque la regla de creador está en el service/entity', async () => {
      const dto: EditarPublicacionDto = {
        titulo: 'Título editado',
      };
      const req = crearRequest('admin-1', rolUsuario.usuarioAdministrador);

      service.editar.mockResolvedValue(crearPublicacion());

      await controller.editar('publicacion-1', dto, req);

      expect(service.editar).toHaveBeenCalledWith(
        'publicacion-1',
        dto,
        'admin-1',
      );
    });
  });

  function crearPublicacionServiceMock(): PublicacionServiceMock {
    return {
      crearPublicacion: jest.fn<
        ReturnType<PublicacionService['crearPublicacion']>,
        Parameters<PublicacionService['crearPublicacion']>
      >(),
      listarPublico: jest.fn<
        ReturnType<PublicacionService['listarPublico']>,
        Parameters<PublicacionService['listarPublico']>
      >(),
      listarMisPublicaciones: jest.fn<
        ReturnType<PublicacionService['listarMisPublicaciones']>,
        Parameters<PublicacionService['listarMisPublicaciones']>
      >(),
      buscarPublicacionPorIdConCreador: jest.fn<
        ReturnType<PublicacionService['buscarPublicacionPorIdConCreador']>,
        Parameters<PublicacionService['buscarPublicacionPorIdConCreador']>
      >(),
      pausar: jest.fn<
        ReturnType<PublicacionService['pausar']>,
        Parameters<PublicacionService['pausar']>
      >(),
      reactivar: jest.fn<
        ReturnType<PublicacionService['reactivar']>,
        Parameters<PublicacionService['reactivar']>
      >(),
      eliminar: jest.fn<
        ReturnType<PublicacionService['eliminar']>,
        Parameters<PublicacionService['eliminar']>
      >(),
      editar: jest.fn<
        ReturnType<PublicacionService['editar']>,
        Parameters<PublicacionService['editar']>
      >(),
    };
  }

  function crearRequest(usuarioId: string, rol: rolUsuario): RequestConUsuario {
    const usuario = new Usuario();
    usuario.id = usuarioId;
    usuario.rol = rol;

    return {
      user: usuario,
    } as RequestConUsuario;
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
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      creadorId: 'usuario-creador-1',
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
      deletedAt: null,
      solicitudes: [],
      ...datos,
    });
  }

  async function crearArchivoMulterValido(
    filename: string,
  ): Promise<Express.Multer.File> {
    const pngValido = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
    ]);

    return crearArchivoMulter(filename, 'image/png', pngValido);
  }

  async function crearArchivoMulterInvalido(
    filename: string,
  ): Promise<Express.Multer.File> {
    return crearArchivoMulter(
      filename,
      'image/png',
      Buffer.from('esto-no-es-una-imagen-real'),
    );
  }

  async function crearArchivoMulter(
    filename: string,
    mimetype: string,
    buffer: Buffer,
  ): Promise<Express.Multer.File> {
    await mkdir(uploadDir, { recursive: true });

    const path = join(uploadDir, filename);

    await writeFile(path, buffer);
    archivosTemporales.push(path);

    return {
      fieldname: 'imagenes',
      originalname: filename,
      encoding: '7bit',
      mimetype,
      size: buffer.length,
      destination: uploadDir,
      filename,
      path,
      buffer,
      stream: Readable.from([]),
    };
  }

  function obtenerMetadata(clave: string, destino: object): unknown {
    return Reflect.getMetadata(clave, destino) as unknown;
  }

  function obtenerRuta(metodo: MetodoController): {
    path: unknown;
    method: unknown;
  } {
    const handler = PublicacionController.prototype[metodo] as object;

    return {
      path: obtenerMetadata(PATH_METADATA, handler),
      method: obtenerMetadata(METHOD_METADATA, handler),
    };
  }

  function obtenerGuards(metodo: MetodoController): unknown {
    const handler = PublicacionController.prototype[metodo] as object;

    return obtenerMetadata(GUARDS_METADATA, handler);
  }
});
