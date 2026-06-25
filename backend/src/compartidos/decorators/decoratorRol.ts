import { SetMetadata } from '@nestjs/common';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';

/**
 * Clave de metadata usada para almacenar los roles requeridos por un endpoint o controlador.
 */
export const ROLES_KEY = 'roles';

/**
 * Declara los roles permitidos para acceder a un endpoint o controlador.
 *
 * El decorador almacena la información de forma reutilizable para que RolesGuard
 * pueda validar el acceso del usuario autenticado.
 *
 * @param roles Roles requeridos para ejecutar la ruta.
 * @returns Decorador de metadata para la autorización por roles.
 */
export const Roles = (...roles: rolUsuario[]) => SetMetadata(ROLES_KEY, roles);
