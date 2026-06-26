import { GUARDS_METADATA } from '@nestjs/common/constants';

import { ROLES_KEY } from 'src/compartidos/decorators/decoratorRol';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';
import { StatusGuard } from 'src/compartidos/guards/statusGuard';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { AuthGuard } from 'src/usuario/auth/authGuard';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';

import { DenunciaController } from './denunciaController';
import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { ResolverDenunciaDto } from '../dtos/resolverDenunciaDto';
import { TomarDenunciaDto } from '../dtos/tomarDenunciaDto';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { DenunciaService } from '../service/denunciaService';

type DenunciaServiceMock = jest.Mocked<
  Pick<
    DenunciaService,
    | 'crearDenuncia'
    | 'listar'
    | 'buscarDetallePorId'
    | 'tomarDenuncia'
    | 'resolverDenuncia'
  >
>;

type MetodoConRoles =
  | 'crearDenuncia'
  | 'listarDenuncias'
  | 'buscarDetalle'
  | 'tomarDenuncia'
  | 'resolverDenuncia';

const fechaPrueba = new Date('2026-06-24T10:00:00.000Z');

const crearRequest = (usuarioId = 'usuario-1'): RequestConUsuario =>
  ({
    user: {
      id: usuarioId,
    },
  }) as RequestConUsuario;

const crearRespuestaDenuncia = (): DenunciaResponseDto => ({
  id: 'denuncia-1',
  publicacionId: 'publicacion-1',
  denuncianteId: 'denunciante-1',
  creadorPublicacionId: 'creador-1',
  moderadorAsignadoId: null,
  motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
  comentario: 'Comentario de prueba',
  estado: EstadoDenuncia.PENDIENTE,
  tipoResolucion: null,
  fechaCreacion: fechaPrueba,
  fechaActualizacion: fechaPrueba,
  version: 1,
});

const crearDetalleDenuncia = (): DenunciaDetalleResponseDto => ({
  ...crearRespuestaDenuncia(),
  detalleResolucion: null,
  fechaResolucion: null,
});

const esRolUsuario = (valor: unknown): valor is rolUsuario =>
  typeof valor === 'string' &&
  Object.values(rolUsuario).includes(valor as rolUsuario);

const obtenerRoles = (metodo: MetodoConRoles): rolUsuario[] | undefined => {
  const metadata: unknown = Reflect.getMetadata(
    ROLES_KEY,
    DenunciaController.prototype[metodo],
  );

  if (metadata === undefined) {
    return undefined;
  }

  if (!Array.isArray(metadata)) {
    throw new Error('La metadata de roles no tiene formato de array');
  }

  if (!metadata.every(esRolUsuario)) {
    throw new Error('La metadata contiene roles inválidos');
  }

  return metadata;
};

describe('DenunciaController', () => {
  let controller: DenunciaController;
  let denunciaService: DenunciaServiceMock;

  beforeEach(() => {
    denunciaService = {
      crearDenuncia: jest.fn(),
      listar: jest.fn(),
      buscarDetallePorId: jest.fn(),
      tomarDenuncia: jest.fn(),
      resolverDenuncia: jest.fn(),
    };

    controller = new DenunciaController(
      denunciaService as unknown as DenunciaService,
    );
  });

  it('se instancia con sus dependencias', () => {
    expect(controller).toBeDefined();
  });

  it('usa AuthGuard, StatusGuard y RolesGuard a nivel controller', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      DenunciaController,
    ) as unknown[];

    expect(guards).toEqual([AuthGuard, StatusGuard, RolesGuard]);
  });

  it('crea una denuncia usando el id del usuario autenticado', async () => {
    const req = crearRequest('usuario-creador-1');
    const dto: CrearDenunciaDto = {
      publicacionId: 'publicacion-1',
      motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
      comentario: 'Comentario válido de prueba',
    };
    const respuesta = crearRespuestaDenuncia();

    denunciaService.crearDenuncia.mockResolvedValue(respuesta);

    await expect(controller.crearDenuncia(req, dto)).resolves.toBe(respuesta);

    expect(denunciaService.crearDenuncia).toHaveBeenCalledWith(
      'usuario-creador-1',
      dto,
    );
  });

  it('lista denuncias delegando los filtros al service', async () => {
    const filtros: FiltroDenunciaDto = {
      estado: EstadoDenuncia.PENDIENTE,
      publicacionId: 'publicacion-1',
    };
    const respuesta = [crearRespuestaDenuncia()];

    denunciaService.listar.mockResolvedValue(respuesta);

    await expect(controller.listarDenuncias(filtros)).resolves.toBe(respuesta);

    expect(denunciaService.listar).toHaveBeenCalledWith(filtros);
  });

  it('busca el detalle de una denuncia por id', async () => {
    const respuesta = crearDetalleDenuncia();

    denunciaService.buscarDetallePorId.mockResolvedValue(respuesta);

    await expect(controller.buscarDetalle('denuncia-1')).resolves.toBe(
      respuesta,
    );

    expect(denunciaService.buscarDetallePorId).toHaveBeenCalledWith(
      'denuncia-1',
    );
  });

  it('toma una denuncia usando el id de denuncia y el id del moderador autenticado', async () => {
    const req = crearRequest('moderador-1');
    const dto: TomarDenunciaDto = {
      version: 1,
    };
    const respuesta = crearRespuestaDenuncia();

    denunciaService.tomarDenuncia.mockResolvedValue(respuesta);

    await expect(
      controller.tomarDenuncia(req, 'denuncia-1', dto),
    ).resolves.toBe(respuesta);

    expect(denunciaService.tomarDenuncia).toHaveBeenCalledWith(
      'denuncia-1',
      'moderador-1',
      dto,
    );
  });

  it('resuelve una denuncia usando el id de denuncia y el id del moderador autenticado', async () => {
    const req = crearRequest('moderador-1');
    const dto: ResolverDenunciaDto = {
      version: 1,
      tipoResolucion: TipoResolucion.PUBLICACION_ELIMINADA,
      detalleResolucion:
        'Se elimina la publicación denunciada por incumplir reglas',
    };
    const respuesta = crearDetalleDenuncia();

    denunciaService.resolverDenuncia.mockResolvedValue(respuesta);

    await expect(
      controller.resolverDenuncia(req, 'denuncia-1', dto),
    ).resolves.toBe(respuesta);

    expect(denunciaService.resolverDenuncia).toHaveBeenCalledWith(
      'denuncia-1',
      'moderador-1',
      dto,
    );
  });

  it('no exige rol específico para crear denuncia', () => {
    expect(obtenerRoles('crearDenuncia')).toBeUndefined();
  });

  it('restringe los endpoints de gestión a moderador y administrador', () => {
    const rolesEsperados = [
      rolUsuario.usuarioModerador,
      rolUsuario.usuarioAdministrador,
    ];

    expect(obtenerRoles('listarDenuncias')).toEqual(rolesEsperados);
    expect(obtenerRoles('buscarDetalle')).toEqual(rolesEsperados);
    expect(obtenerRoles('tomarDenuncia')).toEqual(rolesEsperados);
    expect(obtenerRoles('resolverDenuncia')).toEqual(rolesEsperados);
  });
});
