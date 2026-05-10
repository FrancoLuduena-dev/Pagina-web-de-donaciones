import { Usuario } from '../models/usuario.entity';
import Crear_Usuario_DTO from "../dtos/usuario.dto";

export default class Usuario_Service {
    /*
    metodos:
-bloquear_usuarios (no accesible por usuario comun) [id_usuario, id_moderador]
-resetear_contraseña_usuario [id_usuario, datos: actualizar_contraseña_dto]
-listar_usuarios
-actualizar_perfil [id_usuario, datos: actualizar_perfil_dto]
-crear_usuario [datos: crear_usuario_dto]
-cambiar_rol [actor: usuario, usuario_id, nuevo_rol]
-eliminar_usuario [id_usuario]

 to do: validar todas las reglas de negocio basicas del sistema de creacion de usuarios
     */

public async Crear_Usuario(usuario: Crear_Usuario_DTO): Promise<Usuario> {

}

public async Eliminar_Usuario(id_usuario: number): Promise<void> {

}

public async Actualizar_Usuario(id_usuario: number, datos: Partial<Crear_Usuario_DTO>): Promise<void> {
    
}

public async Cambiar_Rol_Usuario(id_usuario: number, nuevo_rol: string): Promise<void> {

}

public async Resetear_Contraseña_Usuario(id_usuario: number, contraseña_actual: string, contraseña_nueva: string): Promise<void> { 

}

public async Bloquear_Usuario(id_usuario: number, id_moderador: number, razon_bloqueo: string): Promise<void> {

}

public async Listar_Usuarios(): Promise<Array<Usuario>> {
    
}

}