import { SetMetadata } from '@nestjs/common';
import { estadosUsuario } from 'src/usuario/enums/estadosUsuario';

export const ESTADOS_KEY = 'estados';

export const Estados = (...estados: estadosUsuario[]) =>
  SetMetadata(ESTADOS_KEY, estados);
