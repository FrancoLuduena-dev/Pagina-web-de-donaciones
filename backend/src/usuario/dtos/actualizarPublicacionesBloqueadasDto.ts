import { estadosUsuario } from "../enums/estadosUsuario";

export default class actualizarPublicacionesBloqueadasDto {
    razonBloqueo!: string | null;
    estado!: estadosUsuario;
    cantidadPublicacionesBloqueadas!: number;
}