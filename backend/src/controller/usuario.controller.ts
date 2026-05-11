
import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param
} from "@nestjs/common";
import Usuario_Service from '../service/usuario.service';
import Crear_Usuario_DTO from '../dtos/usuario.dto';
import usuario from '../models/usuario.entity';

/*
 to do: validar para cada uno de los datos basicos que el formato escrito sea el correcto, y que no se repitan datos unicos como el correo o el nombre de usuario
*/

@Controller('usuario')
export default class Usuario_Controller {
    constructor(private service: Usuario_Service) { }

    @Post()
    async crearUsuario(@Body() usuario: Crear_Usuario_DTO): Promise<usuario> {
        return this.service.Crear_Usuario(usuario);
    }

    @Get()
    async listarUsuarios(): Promise<Array<usuario>> {
        return this.service.Listar_Usuarios();
    }

    @Delete(':id')
    async borraUsuario(@Param('id') id: number) {
        return this.service.Eliminar_Usuario(id);
    }

    @Patch(':id')
    async actualizarUsuario(@Param('id') id: number, @Body() datos: Partial<Crear_Usuario_DTO>) {
        return this.service.Actualizar_Usuario(id, datos);
    }

    @Patch(':id/rol')
    async cambiarRolUsuario(@Param('id') id: number, @Body('nuevo_rol') nuevo_rol: string) {
        return this.service.Cambiar_Rol_Usuario(id, nuevo_rol);
    }

    @Patch(':id/resetear_contraseña')
    async resetearContraseña(@Param('id') id: number, @Body('contraseña_actual') contraseña_actual: string, @Body('contraseña_nueva') contraseña_nueva: string) {
        return this.service.Resetear_Contraseña_Usuario(id, contraseña_actual, contraseña_nueva)
    }

    @Patch(':id/bloquear_usuario')
    async bloquearUsuario(@Param('id') id: number, @Body('id_moderador') id_moderador: number, @Body('razon_bloqueo') razon_bloqueo: string) {
        return this.service.Bloquear_Usuario(id, id_moderador, razon_bloqueo);
    }
}