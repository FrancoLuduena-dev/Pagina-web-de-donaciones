import UsuarioService from './usuarioService';
import UsuarioRepository from '../repository/usuarioRepository';
import { estadosUsuario } from '../enums/estadosUsuario';
import { rolUsuario } from '../enums/rolUsuario';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsuarioService - FULL COVERAGE', () => {
    let service: UsuarioService;
    let repo: jest.Mocked<UsuarioRepository>;

    const usuarioNormal = {
        id: '1',
        correo: 'user@test.com',
        nombreUsuario: 'user',
        nombreCompleto: 'User Test',
        contrasenia: 'hashed',
        estado: estadosUsuario.ACTIVO,
        rol: rolUsuario.usuarioNormal,
    } as any;

    const admin = {
        id: '2',
        correo: 'admin@test.com',
        nombreUsuario: 'admin',
        nombreCompleto: 'Admin',
        contrasenia: 'hashed',
        estado: estadosUsuario.ACTIVO,
        rol: rolUsuario.usuarioAdministrador,
    } as any;

    const moderador = {
        id: '3',
        correo: 'mod@test.com',
        nombreUsuario: 'mod',
        nombreCompleto: 'Mod',
        contrasenia: 'hashed',
        estado: estadosUsuario.ACTIVO,
        rol: rolUsuario.usuarioModerador,
    } as any;

    beforeEach(() => {
        repo = {
            crearUsuario: jest.fn(),
            eliminarUsuario: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorIdConContrasenia: jest.fn(),
            buscarPorEmail: jest.fn(),
            buscarPorEmailConContrasenia: jest.fn(),
            buscarPorUsername: jest.fn(),
            actualizarUsuario: jest.fn(),
            cambiarRolUsuario: jest.fn(),
            resetearContraseniaUsuario: jest.fn(),
            bloquearUsuario: jest.fn(),
            listarUsuarios: jest.fn(),
        } as any;

        service = new UsuarioService(repo);

        jest.clearAllMocks();
    });

    // =========================
    // CREAR USUARIO
    // =========================
    describe('CrearUsuario', () => {
        it('error si nombreCompleto vacío', async () => {
            await expect(service.CrearUsuario({} as any)).rejects.toBeInstanceOf(
                BadRequestException,
            );
        });

        it('error si email existe', async () => {
            repo.buscarPorEmail.mockResolvedValue(usuarioNormal);

            await expect(
                service.CrearUsuario({
                    nombreCompleto: 'test',
                    correo: 'x',
                    nombreUsuario: 'x',
                } as any),
            ).rejects.toBeInstanceOf(ConflictException);
        });

        it('error si username existe', async () => {
            repo.buscarPorEmail.mockResolvedValue(null);
            repo.buscarPorUsername.mockResolvedValue(usuarioNormal);

            await expect(
                service.CrearUsuario({
                    nombreCompleto: 'test',
                    correo: 'x',
                    nombreUsuario: 'x',
                } as any),
            ).rejects.toBeInstanceOf(ConflictException);
        });

        it('crea usuario OK', async () => {
            repo.buscarPorEmail.mockResolvedValue(null);
            repo.buscarPorUsername.mockResolvedValue(null);
            repo.crearUsuario.mockResolvedValue(usuarioNormal);

            const result = await service.CrearUsuario({
                nombreCompleto: 'test',
                correo: 'test@test.com',
                nombreUsuario: 'test',
            } as any);

            expect(result).toEqual(usuarioNormal);
        });

        it('nombreCompleto undefined/null', async () => {
            await expect(
                service.CrearUsuario({
                    correo: 'x',
                    nombreUsuario: 'x',
                } as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    // =========================
    // ELIMINAR USUARIO
    // =========================
    describe('EliminarUsuario', () => {
        it('usuario no existe', async () => {
            repo.buscarPorIdConContrasenia.mockResolvedValue(null);

            await expect(
                service.EliminarUsuario('1', '123'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('contraseña incorrecta', async () => {
            repo.buscarPorIdConContrasenia.mockResolvedValue(usuarioNormal);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.EliminarUsuario('1', '123'),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('elimina OK', async () => {
            repo.buscarPorIdConContrasenia.mockResolvedValue(usuarioNormal);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await service.EliminarUsuario('1', '123');

            expect(repo.eliminarUsuario).toHaveBeenCalledWith('1');
        });
    });

    // =========================
    // ELIMINAR ADMIN
    // =========================
    describe('EliminarUsuarioAdmin', () => {
        it('admin no puede eliminar si no es admin', async () => {
            repo.buscarPorId.mockResolvedValueOnce(usuarioNormal); // target
            repo.buscarPorId.mockResolvedValueOnce(usuarioNormal); // admin falso

            await expect(
                service.EliminarUsuarioAdmin('1', '2'),
            ).rejects.toBeInstanceOf(ForbiddenException);
        });

        it('usuario a eliminar no existe', async () => {
            repo.buscarPorId.mockResolvedValueOnce(null);

            await expect(
                service.EliminarUsuarioAdmin('1', '2'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('admin válido elimina OK', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(usuarioNormal) // target
                .mockResolvedValueOnce(admin);        // admin

            await service.EliminarUsuarioAdmin('1', '2');

            expect(repo.eliminarUsuario).toHaveBeenCalledWith('1');
        });
    });

    // =========================
    // ACTUALIZAR USUARIO
    // =========================
    describe('ActualizarUsuario', () => {
        it('sin datos → error', async () => {
            repo.buscarPorId.mockResolvedValue(usuarioNormal);

            await expect(
                service.ActualizarUsuario('1', {} as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('email duplicado', async () => {
            repo.buscarPorId.mockResolvedValue(usuarioNormal);
            repo.buscarPorEmail.mockResolvedValue(usuarioNormal);

            await expect(
                service.ActualizarUsuario('1', {
                    correo: 'new@mail.com',
                } as any),
            ).rejects.toBeInstanceOf(ConflictException);
        });

        it('username duplicado', async () => {
            repo.buscarPorId.mockResolvedValue(usuarioNormal);
            repo.buscarPorEmail.mockResolvedValue(null);
            repo.buscarPorUsername.mockResolvedValue(usuarioNormal);

            await expect(
                service.ActualizarUsuario('1', {
                    nombreUsuario: 'x',
                } as any),
            ).rejects.toBeInstanceOf(ConflictException);
        });

        it('actualiza OK', async () => {
            repo.buscarPorId.mockResolvedValue(usuarioNormal);
            repo.buscarPorEmail.mockResolvedValue(null);
            repo.buscarPorUsername.mockResolvedValue(null);

            await service.ActualizarUsuario('1', {
                correo: 'new@test.com',
            } as any);

            expect(repo.actualizarUsuario).toHaveBeenCalled();
        });

        it('sin datos reales → lanza BadRequestException', async () => {
            repo.buscarPorId.mockResolvedValue(usuarioNormal);

            await expect(
                service.ActualizarUsuario('1', {} as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    // =========================
    // CAMBIAR ROL
    // =========================
    describe('CambiarRolUsuario', () => {
        it('no puede cambiar su propio rol', async () => {
            repo.buscarPorId.mockResolvedValueOnce(admin).mockResolvedValueOnce(admin);

            await expect(
                service.CambiarRolUsuario('2', '2', {
                    rol: rolUsuario.usuarioNormal,
                } as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('no puede cambiar rol de otro admin', async () => {
            repo.buscarPorId.mockResolvedValueOnce(admin).mockResolvedValueOnce(admin);

            await expect(
                service.CambiarRolUsuario('2', '2', {
                    rol: rolUsuario.usuarioNormal,
                } as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('OK cambio rol', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(usuarioNormal)
                .mockResolvedValueOnce(admin);

            await service.CambiarRolUsuario('1', '2', {
                rol: rolUsuario.usuarioNormal,
            } as any);

            expect(repo.cambiarRolUsuario).toHaveBeenCalled();
        });
    });

    // =========================
    // RESET PASSWORD
    // =========================
    describe('ResetearContrasenia', () => {
        it('usuario no existe', async () => {
            repo.buscarPorIdConContrasenia.mockResolvedValue(null);

            await expect(
                service.ResetearContraseniaUsuario('1', {
                    contraseniaActual: 'a',
                    contraseniaNueva: 'b',
                } as any),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('contraseña actual incorrecta', async () => {
            repo.buscarPorIdConContrasenia.mockResolvedValue(usuarioNormal);
            (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

            await expect(
                service.ResetearContraseniaUsuario('1', {
                    contraseniaActual: 'a',
                    contraseniaNueva: 'b',
                } as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('misma contraseña nueva', async () => {
            repo.buscarPorIdConContrasenia.mockResolvedValue(usuarioNormal);
            (bcrypt.compare as jest.Mock)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true);

            await expect(
                service.ResetearContraseniaUsuario('1', {
                    contraseniaActual: 'a',
                    contraseniaNueva: 'a',
                } as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('OK reset', async () => {
            repo.buscarPorIdConContrasenia.mockResolvedValue(usuarioNormal);
            (bcrypt.compare as jest.Mock)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

            await service.ResetearContraseniaUsuario('1', {
                contraseniaActual: 'a',
                contraseniaNueva: 'b',
            } as any);

            expect(repo.resetearContraseniaUsuario).toHaveBeenCalled();
        });
    });

    describe('BloquearUsuario FULL', () => {
        // =========================
        // 1. usuario moderador inválido → Forbidden
        // =========================
        it('usuario sin rol válido no puede bloquear', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(usuarioNormal) // usuario a bloquear
                .mockResolvedValueOnce(usuarioNormal); // "moderador" inválido

            await expect(
                service.BloquearUsuario('1', '2', { razonBloqueo: 'spam' } as any),
            ).rejects.toBeInstanceOf(ForbiddenException);
        });

        // =========================
        // 2. moderador intenta bloquear admin (no permitido para mod)
        // =========================
        it('moderador no puede bloquear admin', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(admin) // usuario objetivo es admin
                .mockResolvedValueOnce(moderador); // moderador

            await expect(
                service.BloquearUsuario('2', '3', { razonBloqueo: 'spam' } as any),
            ).rejects.toBeInstanceOf(ForbiddenException);
        });

        // =========================
        // 3. admin intenta bloquear otro admin
        // =========================
        it('admin no puede bloquear otro admin', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(admin) // target admin
                .mockResolvedValueOnce(admin); // admin actor

            await expect(
                service.BloquearUsuario('2', '2', { razonBloqueo: 'x' } as any),
            ).rejects.toBeInstanceOf(ForbiddenException);
        });

        // =========================
        // 4. usuario ya bloqueado → ConflictException
        // =========================
        it('usuario ya bloqueado', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce({
                    ...usuarioNormal,
                    estado: estadosUsuario.BLOQUEADO,
                })
                .mockResolvedValueOnce(admin);

            await expect(
                service.BloquearUsuario('1', '2', { razonBloqueo: 'spam' } as any),
            ).rejects.toBeInstanceOf(ConflictException);
        });

        // =========================
        // 5. razón vacía → BadRequestException
        // =========================
        it('razón de bloqueo vacía', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(usuarioNormal)
                .mockResolvedValueOnce(admin);

            await expect(
                service.BloquearUsuario('1', '2', { razonBloqueo: '   ' } as any),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        // =========================
        // 6. auto-bloqueo (mismo usuario)
        // =========================
        it('usuario no puede bloquearse a sí mismo', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(admin)
                .mockResolvedValueOnce(admin);

            await expect(
                service.BloquearUsuario('2', '2', { razonBloqueo: 'spam' } as any),
            ).rejects.toBeInstanceOf(ForbiddenException);
        });

        // =========================
        // 7. caso OK: admin bloquea usuario normal
        // =========================
        it('bloqueo exitoso por admin', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(usuarioNormal)
                .mockResolvedValueOnce(admin);

            await service.BloquearUsuario('1', '2', {
                razonBloqueo: 'spam masivo',
            } as any);

            expect(repo.bloquearUsuario).toHaveBeenCalledWith(
                usuarioNormal,
                admin,
                'spam masivo',
            );
        });

        // =========================
        // 8. moderador bloquea usuario normal OK
        // =========================
        it('moderador bloquea usuario normal OK', async () => {
            repo.buscarPorId
                .mockResolvedValueOnce(usuarioNormal)
                .mockResolvedValueOnce(moderador);

            await service.BloquearUsuario('1', '3', {
                razonBloqueo: 'contenido inapropiado',
            } as any);

            expect(repo.bloquearUsuario).toHaveBeenCalled();
        });
    });

    // =========================
    // LISTAR
    // =========================
    it('listar usuarios', async () => {
        repo.listarUsuarios.mockResolvedValue([usuarioNormal]);

        const res = await service.ListarUsuarios();

        expect(res).toEqual([usuarioNormal]);
    });
});