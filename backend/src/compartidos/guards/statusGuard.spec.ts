import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ESTADOS_KEY } from 'src/compartidos/decorators/decoratorEstados';
import { StatusGuard } from 'src/compartidos/guards/statusGuard';
import { estadosUsuario } from 'src/usuario/enums/estadosUsuario';

type UsuarioEnRequest = {
  estado: estadosUsuario;
};

type RequestConUsuario = {
  user?: UsuarioEnRequest;
};

const handler = (): void => undefined;
class ControladorPrueba {}

describe('StatusGuard', () => {
  let guard: StatusGuard;
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
    guard = new StatusGuard(reflector);
  });

  it('permite pasar cuando la ruta no tiene estados requeridos', () => {
    getAllAndOverrideSpy.mockReturnValue(undefined);

    expect(guard.canActivate(crearContexto())).toBe(true);
    expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ESTADOS_KEY, [
      handler,
      ControladorPrueba,
    ]);
  });

  it('permite pasar cuando la metadata de estados está vacía', () => {
    getAllAndOverrideSpy.mockReturnValue([]);

    expect(guard.canActivate(crearContexto())).toBe(true);
  });

  it('rechaza con UnauthorizedException cuando hay estados requeridos pero no hay usuario autenticado', () => {
    getAllAndOverrideSpy.mockReturnValue([estadosUsuario.ACTIVO]);

    const accion = () => guard.canActivate(crearContexto());

    expect(accion).toThrow(UnauthorizedException);
    expect(accion).toThrow('Usuario no autenticado');
  });

  it('rechaza con ForbiddenException cuando el usuario no tiene un estado permitido', () => {
    getAllAndOverrideSpy.mockReturnValue([estadosUsuario.ACTIVO]);

    const accion = () =>
      guard.canActivate(crearContexto({ estado: estadosUsuario.BLOQUEADO }));

    expect(accion).toThrow(ForbiddenException);
    expect(accion).toThrow('Estado de usuario no permitido');
  });

  it('permite pasar cuando el usuario tiene el estado requerido', () => {
    getAllAndOverrideSpy.mockReturnValue([estadosUsuario.ACTIVO]);

    expect(
      guard.canActivate(crearContexto({ estado: estadosUsuario.ACTIVO })),
    ).toBe(true);
  });
});
