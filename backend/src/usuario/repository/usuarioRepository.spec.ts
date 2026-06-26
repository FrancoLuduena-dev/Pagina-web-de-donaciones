import UsuarioRepository from './usuarioRepository';
import { Repository } from 'typeorm';
import Usuario from '../entity/usuarioEntity';
import { estadosUsuario } from '../enums/estadosUsuario';
import { rolUsuario } from '../enums/rolUsuario';

describe('UsuarioRepository', () => {
    let repository: jest.Mocked<Repository<Usuario>>;
    let usuarioRepository: UsuarioRepository;

    const mockUsuario = {
        id: '1',
        correo: 'test@test.com',
        nombreUsuario: 'testuser',
        contrasenia: 'hashed',
        estado: estadosUsuario.ACTIVO,
        rol: rolUsuario.usuarioNormal,
    } as Usuario;

    beforeEach(() => {
        repository = {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
        } as any;

        usuarioRepository = new UsuarioRepository(repository);
    });

    it('debería crear un usuario', async () => {
        repository.create.mockReturnValue(mockUsuario);
        repository.save.mockResolvedValue(mockUsuario);

        const result = await usuarioRepository.crearUsuario(mockUsuario);

        expect(repository.create).toHaveBeenCalledWith(mockUsuario);
        expect(repository.save).toHaveBeenCalledWith(mockUsuario);
        expect(result).toEqual(mockUsuario);
    });

    it('debería eliminar un usuario', async () => {
        repository.delete.mockResolvedValue({ raw: {}, affected: 1 } as any);

        await usuarioRepository.eliminarUsuario('1');

        expect(repository.delete).toHaveBeenCalledWith({ id: '1' });
    });

    it('debería buscar usuario por id', async () => {
        repository.findOneBy.mockResolvedValue(mockUsuario);

        const result = await usuarioRepository.buscarPorId('1');

        expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
        expect(result).toEqual(mockUsuario);
    });

    it('debería buscar usuario por email', async () => {
        repository.findOneBy.mockResolvedValue(mockUsuario);

        const result = await usuarioRepository.buscarPorEmail('test@test.com');

        expect(repository.findOneBy).toHaveBeenCalledWith({
            correo: 'test@test.com',
        });
        expect(result).toEqual(mockUsuario);
    });

    it('debería buscar usuario por username', async () => {
        repository.findOneBy.mockResolvedValue(mockUsuario);

        const result = await usuarioRepository.buscarPorUsername('testuser');

        expect(repository.findOneBy).toHaveBeenCalledWith({
            nombreUsuario: 'testuser',
        });
        expect(result).toEqual(mockUsuario);
    });

    it('debería actualizar usuario', async () => {
        repository.update.mockResolvedValue({ affected: 1, raw: {} } as any);

        await usuarioRepository.actualizarUsuario('1', { nombreUsuario: 'nuevo' });

        expect(repository.update).toHaveBeenCalledWith(
            { id: '1' },
            { nombreUsuario: 'nuevo' },
        );
    });

    it('debería cambiar rol de usuario', async () => {
        repository.update.mockResolvedValue({ affected: 1, raw: {} } as any);

        await usuarioRepository.cambiarRolUsuario('1', rolUsuario.usuarioAdministrador);

        expect(repository.update).toHaveBeenCalledWith(
            { id: '1' },
            { rol: rolUsuario.usuarioAdministrador },
        );
    });

    it('debería cambiar estado de usuario', async () => {
        repository.update.mockResolvedValue({ affected: 1, raw: {} } as any);

        await usuarioRepository.cambiarEstadoUsuario(
            '1',
            estadosUsuario.BLOQUEADO,
        );

        expect(repository.update).toHaveBeenCalledWith(
            { id: '1' },
            { estado: estadosUsuario.BLOQUEADO },
        );
    });

    it('debería resetear contraseña', async () => {
        repository.update.mockResolvedValue({ affected: 1, raw: {} } as any);

        await usuarioRepository.resetearContraseniaUsuario('1', 'newpass');

        expect(repository.update).toHaveBeenCalledWith(
            { id: '1' },
            { contrasenia: 'newpass' },
        );
    });

    it('debería listar usuarios', async () => {
        repository.find.mockResolvedValue([mockUsuario]);

        const result = await usuarioRepository.listarUsuarios();

        expect(repository.find).toHaveBeenCalled();
        expect(result).toEqual([mockUsuario]);
    });

    it('debería bloquear usuario', async () => {
        const bloqueador = { id: '2' } as Usuario;

        repository.save.mockResolvedValue({
            ...mockUsuario,
            estado: estadosUsuario.BLOQUEADO,
            bloqueador,
            razonBloqueo: 'spam',
        } as any);

        await usuarioRepository.bloquearUsuario(mockUsuario, bloqueador, 'spam');

        expect(mockUsuario.estado).toBe(estadosUsuario.BLOQUEADO);
        expect(mockUsuario.bloqueador).toBe(bloqueador);
        expect(mockUsuario.razonBloqueo).toBe('spam');
        expect(repository.save).toHaveBeenCalledWith(mockUsuario);
    });
});