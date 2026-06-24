import { Test, TestingModule } from '@nestjs/testing';
import UsuarioController from './usuarioController'; // Ajusta la ruta si es necesario
import UsuarioService from '../service/usuarioService';
import autenticacionUsuario from '../auth/authUsuario';
import { AuthGuard } from '../auth/authGuard';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';
import { StatusGuard } from '../../compartidos/guards/statusGuard';

describe('UsuarioController', () => {
    let controller: UsuarioController;
    let usuarioService: jest.Mocked<Partial<UsuarioService>>;
    let authService: jest.Mocked<Partial<autenticacionUsuario>>;

    // Mocks de los servicios
    const mockUsuarioService = {
        ListarUsuarios: jest.fn(),
        obtenerUsuarioPorId: jest.fn(),
        EliminarUsuario: jest.fn(),
        ActualizarUsuario: jest.fn(),
        ResetearContraseniaUsuario: jest.fn(),
        CambiarRolUsuario: jest.fn(),
        BloquearUsuario: jest.fn(),
    };

    const mockAuthService = {
        registrarUsuario: jest.fn(),
        logearUsuario: jest.fn(),
    };

    // Mock del objeto Request inyectado por los Guards
    const mockRequest = {
        user: { id: 'uuid-usuario-autenticado' },
    } as any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsuarioController],
            providers: [
                {
                    provide: UsuarioService,
                    useValue: mockUsuarioService,
                },
                {
                    provide: autenticacionUsuario,
                    useValue: mockAuthService,
                },
            ],
        })
            // Sobrescribimos los guards para que no bloqueen la ejecución en las pruebas unitarias
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(StatusGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<UsuarioController>(UsuarioController);
        usuarioService = module.get(UsuarioService);
        authService = module.get(autenticacionUsuario);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('crearUsuario', () => {
        it('debería registrar un nuevo usuario', async () => {
            const dto = {
                nombreCompleto: 'Test User',
                nombreUsuario: 'testUser',
                correo: 'test@test.com',
                contrasenia: '123456',
                numeroTelefono: '123456789',
            };

            const respuestaEsperada = {
                message: 'Usuario registrado correctamente',
                user: {
                    id: '1',
                    correo: dto.correo,
                    nombreUsuario: dto.nombreUsuario,
                },
            };

            mockAuthService.registrarUsuario.mockResolvedValue(respuestaEsperada);

            const resultado = await controller.crearUsuario(dto as any);

            expect(resultado).toEqual(respuestaEsperada);
            expect(authService.registrarUsuario).toHaveBeenCalledWith(dto);
        });
    });

    describe('login', () => {
        it('debería devolver un access token', async () => {
            const dto: any = { correo: 'test@test.com', contrasenia: '123' };
            const tokenMock = 'jwt-token-mockeado';

            mockAuthService.logearUsuario.mockResolvedValue(tokenMock);

            const resultado = await controller.login(dto);

            expect(resultado).toEqual({ accessToken: tokenMock });
            expect(authService.logearUsuario).toHaveBeenCalledWith(dto);
        });
    });

    describe('listarUsuarios', () => {
        it('debería listar todos los usuarios', async () => {
            const listaEsperada: any[] = [{ id: '1', nombreUsuario: 'test1' }, { id: '2', nombreUsuario: 'test2' }];
            mockUsuarioService.ListarUsuarios.mockResolvedValue(listaEsperada);

            const resultado = await controller.listarUsuarios();

            expect(resultado).toEqual(listaEsperada);
            expect(usuarioService.ListarUsuarios).toHaveBeenCalledTimes(1);
        });
    });

    describe('obtenerMiUsuario', () => {
        it('debería obtener el usuario autenticado basado en req.user.id', async () => {
            const usuarioEsperado: any = { id: 'uuid-usuario-autenticado', nombreUsuario: 'yo' };
            mockUsuarioService.obtenerUsuarioPorId.mockResolvedValue(usuarioEsperado);

            const resultado = await controller.obtenerMiUsuario(mockRequest);

            expect(resultado).toEqual(usuarioEsperado);
            expect(usuarioService.obtenerUsuarioPorId).toHaveBeenCalledWith(mockRequest.user.id);
        });
    });

    describe('obtenerUsuarioPorId', () => {
        it('debería devolver un usuario por su ID', async () => {
            const idParam = 'uuid-cualquiera';
            const usuarioEsperado: any = { id: idParam, nombreUsuario: 'otroUser' };
            mockUsuarioService.obtenerUsuarioPorId.mockResolvedValue(usuarioEsperado);

            const resultado = await controller.obtenerUsuarioPorId(idParam);

            expect(resultado).toEqual(usuarioEsperado);
            expect(usuarioService.obtenerUsuarioPorId).toHaveBeenCalledWith(idParam);
        });
    });

    describe('borrarUsuario', () => {
        it('debería llamar al servicio para eliminar el usuario propio', async () => {
            const contrasenia = 'miPass123';
            mockUsuarioService.EliminarUsuario.mockResolvedValue(undefined);

            await controller.borrarUsuario(mockRequest, contrasenia);

            expect(usuarioService.EliminarUsuario).toHaveBeenCalledWith(mockRequest.user.id, contrasenia);
        });
    });

    describe('actualizarUsuario', () => {
        it('debería llamar al servicio para actualizar los datos', async () => {
            const dto: any = { nombreCompleto: 'Nuevo Nombre' };
            mockUsuarioService.ActualizarUsuario.mockResolvedValue(undefined);

            await controller.actualizarUsuario(mockRequest, dto);

            expect(usuarioService.ActualizarUsuario).toHaveBeenCalledWith(mockRequest.user.id, dto);
        });
    });

    describe('resetearContrasenia', () => {
        it('debería llamar al servicio para cambiar la contraseña', async () => {
            const dto: any = { contraseniaActual: '123', contraseniaNueva: '456' };
            mockUsuarioService.ResetearContraseniaUsuario.mockResolvedValue(undefined);

            await controller.resetearContrasenia(mockRequest, dto);

            expect(usuarioService.ResetearContraseniaUsuario).toHaveBeenCalledWith(mockRequest.user.id, dto);
        });
    });

    describe('cambiarRolUsuario', () => {
        it('debería llamar al servicio para cambiar el rol con el id del objetivo y del admin', async () => {
            const targetId = 'uuid-target';
            const dto: any = { rol: 'usuarioModerador' };
            mockUsuarioService.CambiarRolUsuario.mockResolvedValue(undefined);

            await controller.cambiarRolUsuario(targetId, dto, mockRequest);

            expect(usuarioService.CambiarRolUsuario).toHaveBeenCalledWith(targetId, mockRequest.user.id, dto);
        });
    });

    describe('bloquearUsuario', () => {
        it('debería llamar al servicio para bloquear al usuario', async () => {
            const targetId = 'uuid-target';
            const dto: any = { razonBloqueo: 'Spam' };
            mockUsuarioService.BloquearUsuario.mockResolvedValue(undefined);

            await controller.bloquearUsuario(targetId, dto, mockRequest);

            expect(usuarioService.BloquearUsuario).toHaveBeenCalledWith(targetId, mockRequest.user.id, dto);
        });
    });
});