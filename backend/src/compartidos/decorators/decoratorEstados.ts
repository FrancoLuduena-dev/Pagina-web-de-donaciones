import { SetMetadata } from '@nestjs/common';
import { estadosUsuario } from 'src/usuario/enums/estadosUsuario';

/**
 * Clave de metadata usada para almacenar los estados de usuario permitidos por una ruta.
 */
export const ESTADOS_KEY = 'estados';

/**
 * Declara los estados de usuario permitidos para acceder a un endpoint o controlador.
 *
 * La información queda registrada como metadata para que StatusGuard pueda
 * interpretar la condición de acceso previa a la ejecución del controller.
 *
 * @param estados Estados requeridos para operar sobre la ruta.
 * @returns Decorador de metadata para la autorización por estado.
 */
export const Estados = (...estados: estadosUsuario[]) =>
  SetMetadata(ESTADOS_KEY, estados);
