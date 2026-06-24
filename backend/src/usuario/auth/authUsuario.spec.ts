import autenticacionUsuario from './authUsuario';
import Usuario_Service from '../service/usuarioService';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mocked-token'),
}));

describe('autenticacionUsuario', () => {
    let serviceMock: Partial<Usuario_Service>;
    let configMock: Partial<ConfigService>;
    let auth: autenticacionUsuario;

    beforeEach(() => {
        serviceMock = {
            CrearUsuario: jest.fn(),
            ObtenerUsuarioPorCorreo: jest.fn(),
        };

        configMock = {
            get: jest.fn((key: string) => {
                if (key === 'JWT_SECRET') return 'test-secret';
                if (key === 'JWT_EXPIRATION') return '1h';
                return undefined;
            }),
        };

        auth = new autenticacionUsuario(serviceMock as any, configMock as any);

        (bcrypt.hash as unknown as jest.Mock).mockReset();
        (bcrypt.compare as unknown as jest.Mock).mockReset();
        (jwt.sign as unknown as jest.Mock).mockClear();
    });

    it('registrarUsuario: registra correctamente', async () => {
        const crear = {
            correo: 'a@b.com',
            nombreUsuario: 'user',
            nombreCompleto: 'Usuario de prueba',
            numeroTelefono: '+123456789',
            contrasenia: 'plain',
        };

        (bcrypt.hash as unknown as jest.Mock).mockResolvedValue('hashed');
        (serviceMock.CrearUsuario as jest.Mock).mockResolvedValue({ id: 1, correo: crear.correo, nombreUsuario: crear.nombreUsuario });

        const res = await auth.registrarUsuario(crear as any);

        expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
        expect(serviceMock.CrearUsuario).toHaveBeenCalledWith(expect.objectContaining({ contrasenia: 'hashed' }));
        expect(res).toMatchObject({ message: 'Usuario registrado correctamente', user: { id: 1, correo: crear.correo, nombreUsuario: crear.nombreUsuario } });
    });

    it('registrarUsuario: error si no se crea usuario', async () => {
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
        (serviceMock.CrearUsuario as jest.Mock).mockResolvedValue(null);

        await expect(
            auth.registrarUsuario({
                correo: 'a',
                nombreUsuario: 'c',
                nombreCompleto: 'Usuario de prueba',
                numeroTelefono: '+123456789',
                contrasenia: 'b'
            } as any)
        ).rejects.toThrow('Error al registrar el usuario');
    });

    it('logearUsuario: error si usuario no existe', async () => {
        (serviceMock.ObtenerUsuarioPorCorreo as jest.Mock).mockResolvedValue(null);

        await expect(
            auth.logearUsuario({ correo: 'x', contrasenia: 'x' } as any)
        ).rejects.toThrow('Correo o contrasenia incorrectos');
    });

    it('logearUsuario: error si contraseña incorrecta', async () => {
        (serviceMock.ObtenerUsuarioPorCorreo as jest.Mock).mockResolvedValue({
            id: 1,
            correo: 'a',
            contrasenia: 'hashed',
            rol: 'USER'
        });

        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(
            auth.logearUsuario({ correo: 'a', contrasenia: 'wrong' } as any)
        ).rejects.toThrow('Correo o contrasenia incorrectos');
    });

    it('logearUsuario: devuelve token cuando credenciales válidas', async () => {
        const datos = { correo: 'a@b.com', contrasenia: 'plain' };
        const usuarioFromDb = { id: 2, correo: datos.correo, contrasenia: 'hashed', rol: 'USER' };

        (serviceMock.ObtenerUsuarioPorCorreo as jest.Mock).mockResolvedValue(usuarioFromDb);
        (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

        const token = await auth.logearUsuario(datos as any);

        expect(serviceMock.ObtenerUsuarioPorCorreo).toHaveBeenCalledWith(datos.correo);
        expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
        expect(jwt.sign).toHaveBeenCalledWith(
            {
                id: 2,
                correo: datos.correo,
                rol: 'USER',
            },
            'test-secret',
            { expiresIn: '1h' }
        );
        expect(token).toBe('mocked-token');
    });

    it('logearUsuario: lanza error si JWT no configurado', async () => {
        const datos = { correo: 'x@x.com', contrasenia: 'p' };
        (serviceMock.ObtenerUsuarioPorCorreo as jest.Mock).mockResolvedValue({ id: 3, correo: datos.correo, contrasenia: 'h', rol: 'USER' });
        (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
        (configMock.get as jest.Mock).mockImplementation((k: string) => (k === 'JWT_SECRET' ? undefined : '1h'));

        await expect(auth.logearUsuario(datos as any)).rejects.toThrow();
    });
});
