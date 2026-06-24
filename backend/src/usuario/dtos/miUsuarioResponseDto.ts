import { rolUsuario } from "../enums/rolUsuario";
import { estadosUsuario } from "../enums/estadosUsuario";

export class MiUsuarioResponseDto {
  id!: string;
  nombreCompleto!: string;
  nombreUsuario!: string;
  correo!: string;
  numeroTelefono!: string;
  rol!: rolUsuario;
  estado!: estadosUsuario;
  razonBloqueo?: string | null;
}