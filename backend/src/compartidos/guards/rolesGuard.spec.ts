import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from 'src/compartidos/decorators/decoratorRol';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';

type UsuarioEnRequest = {
  rol: rolUsuario;
};

type RequestConUsuario = {
  user?: UsuarioEnRequest;
};

const handler = (): void => undefined;
class ControladorPrueba {}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let getAllAndOverrideSpy: jest.SpiedFunction<Reflector['getAllAndOverride']>;

  const crearContexto = (usuario?: UsuarioEnRequest): ExecutionContext => {
    const request: RequestConUsuario = {};

    if (usuario) {
      request.user = usuario;
    }

    return {
      getClass: jest.fn(() => ControladorPrueba),
      getHandler: jest.fn(() => handler),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => request),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      })),
      getArgs: jest.fn(() => []),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(() => 'http'),
    } as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
    guard = new RolesGuard(reflector);
  });

  it('permite pasar cuando la ruta no tiene roles requeridos', () => {
    getAllAndOverrideSpy.mockReturnValue(undefined);

    const resultado = guard.canActivate(crearContexto());

    expect(resultado).toBe(true);
    expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
      handler,
      ControladorPrueba,
    ]);
  });

  it('permite pasar cuando la metadata de roles está vacía', () => {
    getAllAndOverrideSpy.mockReturnValue([]);

    const resultado = guard.canActivate(crearContexto());

    expect(resultado).toBe(true);
  });

  it('rechaza con UnauthorizedException cuando hay roles requeridos pero no hay usuario autenticado', () => {
    getAllAndOverrideSpy.mockReturnValue([rolUsuario.usuarioModerador]);

    const accion = () => guard.canActivate(crearContexto());

    expect(accion).toThrow(UnauthorizedException);
    expect(accion).toThrow('Usuario no autenticado');
  });

  it('rechaza con ForbiddenException cuando el usuario no tiene un rol permitido', () => {
    getAllAndOverrideSpy.mockReturnValue([rolUsuario.usuarioModerador]);

    const accion = () =>
      guard.canActivate(crearContexto({ rol: rolUsuario.usuarioNormal }));

    expect(accion).toThrow(ForbiddenException);
    expect(accion).toThrow('No tenés permisos para realizar esta acción');
  });

  it('permite pasar cuando el usuario tiene el rol requerido', () => {
    getAllAndOverrideSpy.mockReturnValue([rolUsuario.usuarioModerador]);

    const resultado = guard.canActivate(
      crearContexto({ rol: rolUsuario.usuarioModerador }),
    );

    expect(resultado).toBe(true);
  });

  it('permite pasar cuando el usuario tiene uno de varios roles requeridos', () => {
    getAllAndOverrideSpy.mockReturnValue([
      rolUsuario.usuarioModerador,
      rolUsuario.usuarioAdministrador,
    ]);

    const resultado = guard.canActivate(
      crearContexto({ rol: rolUsuario.usuarioAdministrador }),
    );

    expect(resultado).toBe(true);
  });
});
