
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from "@nestjs/common";
import Usuario_Service from '../service/usuario.service';
import Crear_Usuario_DTO from '../dtos/usuario.dto';
import usuario from '../models/usuario.entity';
import autenticacionUsuario from "../auth/auth.usuario";
import { BloquearUsuarioDTO } from "../dtos/bloquearUsuario.dto";
import actualizarUsuarioDTO from '../dtos/update.usuario.dto';
import { CambiarRolDTO } from '../dtos/cambiarRol.dto';
import logearUsuarioDTO from '../dtos/logearUsuario.dto';
import { AuthGuard } from '../auth/auth.guard';

/*
 to do: quitar del body el id_usuario en los endpoints que lo requieran y obtenerlo del token de autenticacion.
       usar el ward de nest para validar el rol de usuario para la ejecucion de metodos con privilegios de admin o moderador.
*/

@Controller('usuario')
export default class Usuario_Controller {
    constructor(private service: Usuario_Service, private authService: autenticacionUsuario) { }

    @Post()
    async crearUsuario(@Body() usuario: Crear_Usuario_DTO): Promise<usuario> {
        return this.authService.registrarUsuario(usuario);
    }

    @Post('login')
    async login(@Body() datos: logearUsuarioDTO) {
        const token = await this.authService.logearUsuario(datos);
        return { access_token: token };
    }

    @UseGuards(AuthGuard)
    @Get()
    async listarUsuarios(): Promise<Array<usuario>> {
        return this.service.Listar_Usuarios();
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async obtenerUsuarioPorId(@Param('id') id: number): Promise<usuario | null> {
        return this.service.obtenerUsuarioPorId(id);
    }

    @UseGuards(AuthGuard)
    @Get('nombre/:nombreUsuario')
    async obtenerUsuarioPorNombreUsuario(@Param('nombreUsuario') nombreUsuario: string): Promise<usuario | null> {
        return this.service.ObtenerUsuarioPorNombreUsuario(nombreUsuario);
    }
    

    @UseGuards(AuthGuard)
    @Delete(':id')
    async borrarUsuario(@Param('id') id: number, @Body('contraseña') contraseña: string) {
        return this.service.Eliminar_Usuario(id, contraseña);
    }

    @UseGuards(AuthGuard)
    @UseGuards(AuthGuard)
    @Patch(':id')
    async actualizarUsuario(@Param('id') id: number, @Body() datos: actualizarUsuarioDTO) {
        return this.service.Actualizar_Usuario(id, datos);
    }

    @UseGuards(AuthGuard)
    @Patch(':id/rol')
    async cambiarRolUsuario(@Param('id') id: number, @Body('id_admin') id_admin: number, @Body() datos: CambiarRolDTO) {
        return this.service.Cambiar_Rol_Usuario(id, id_admin, datos);
    }

    @UseGuards(AuthGuard)
    @Patch(':id/resetear_contraseña')
    async resetearContraseña(@Param('id') id: number, @Body('contraseña_actual') contraseña_actual: string, @Body('contraseña_nueva') contraseña_nueva: string) {
        return this.service.Resetear_Contraseña_Usuario(id, contraseña_actual, contraseña_nueva)
    }

    @UseGuards(AuthGuard)
    @Patch(':id/bloquear_usuario')
    async bloquearUsuario(@Param('id') id: number, @Body('id_moderador') id_moderador: number, @Body() datos: BloquearUsuarioDTO) {
        return this.service.Bloquear_Usuario(id, id_moderador, datos);
    }
}