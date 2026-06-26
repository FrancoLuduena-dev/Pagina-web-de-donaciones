import { AuthGuard } from './authGuard';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('AuthGuard', () => { 
    let guard: AuthGuard;

    const mockService = {
        obtenerUsuarioPorId: jest.fn(),
    };

    const mockConfig = {
        get: jest.fn(),
    };

    const mockRequest = {
        headers: {},
    };

    const mockExecutionContext = {
        switchToHttp: () => ({
            getRequest: () => mockRequest,
        }),
    } as unknown as ExecutionContext;

    beforeEach(() => {
        jest.clearAllMocks();

        guard = new AuthGuard(
            mockService as any,
            mockConfig as any,
        );
    });

    it('debería tirar error si no hay authorization header', async () => {
        mockRequest.headers = {};

        await expect(
            guard.canActivate(mockExecutionContext),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('debería tirar error si no empieza con Bearer', async () => {
        mockRequest.headers = {
            authorization: 'Token abc123',
        };

        await expect(
            guard.canActivate(mockExecutionContext),
        ).rejects.toThrow('Token de autenticación faltante');
    });

    it('debería tirar error si no hay JWT_SECRET', async () => {
        mockRequest.headers = {
            authorization: 'Bearer token',
        };

        mockConfig.get.mockReturnValue(undefined);

        await expect(
            guard.canActivate(mockExecutionContext),
        ).rejects.toThrow(InternalServerErrorException);
    });

    it('debería tirar error si el token es inválido', async () => {
        mockRequest.headers = {
            authorization: 'Bearer token',
        };

        mockConfig.get.mockReturnValue('secret');

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error();
        });

        await expect(
            guard.canActivate(mockExecutionContext),
        ).rejects.toThrow('Token inválido');
    });

    it('debería tirar error si el usuario no existe', async () => {
        mockRequest.headers = {
            authorization: 'Bearer token',
        };

        mockConfig.get.mockReturnValue('secret');

        (jwt.verify as jest.Mock).mockReturnValue({
            id: '123',
            correo: 'test@test.com',
            rol: 'user',
        });

        mockService.obtenerUsuarioPorId.mockResolvedValue(null);

        await expect(
            guard.canActivate(mockExecutionContext),
        ).rejects.toThrow('Usuario no encontrado');
    });

    it('debería permitir acceso y setear request.user', async () => {
        const mockUser = { id: '123', nombre: 'Franco' };

        mockRequest.headers = {
            authorization: 'Bearer token',
        };

        mockConfig.get.mockReturnValue('secret');

        (jwt.verify as jest.Mock).mockReturnValue({
            id: '123',
            correo: 'test@test.com',
            rol: 'user',
        });

        mockService.obtenerUsuarioPorId.mockResolvedValue(mockUser);

        const result = await guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
        expect(mockRequest['user']).toEqual(mockUser);
    });
})
    