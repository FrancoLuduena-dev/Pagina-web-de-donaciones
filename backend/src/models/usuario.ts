
import { estados_usuario } from '../enums/estados_usuario.enum';
import { rol_usuario } from '../enums/rol_usuario.enum';

export default interface Usuario {
    id: number;
    nombre_completo: string;
    nombre_usuario: string;
    correo: string;
    contraseña: string;
    numero_telefono: string;
    rol: rol_usuario;
    estado: estados_usuario;
    id_bloqueador: number | null;
    razon_bloqueo: string | null;
}