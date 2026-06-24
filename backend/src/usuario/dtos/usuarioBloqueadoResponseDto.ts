import { estadosUsuario } from '../enums/estadosUsuario';

export default class usuarioBloqueadoResponseDto {
  estado!: estadosUsuario;
  razonBloqueo!: string | null;
}
