import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import Usuario from '../entity/usuarioEntity';
import CrearUsuarioDTO from '../dtos/usuarioDto';
import UsuarioRepository from '../repository/usuarioRepository';
import actualizarUsuarioDTO from '../dtos/actualizarUsuarioDto';
import actualizarContraseniaDTO from '../dtos/actualizarContraseniaDto';
import { CambiarRolDTO } from '../dtos/cambiarRolDto';
import { BloquearUsuarioDTO } from '../dtos/bloquearUsuarioDto';
import actualizarPublicacionesBloqueadasDto from '../dtos/actualizarPublicacionesBloqueadasDto';

import bcrypt from 'bcrypt';

import { estadosUsuario } from '../enums/estadosUsuario';
import { rolUsuario } from '../enums/rolUsuario';

@Injectable()
export default class UsuarioService {
  constructor(private readonly repo: UsuarioRepository) {}

  /*

 to do: ver especificamente las excepciones en base a que error salio en la ejecucion de cada metodo.
        tal vez crear excepciones personalizadas para cada caso.
     */

  public async CrearUsuario(usuario: CrearUsuarioDTO): Promise<Usuario> {
    /*
        validar nombre usuario unico
        validar correo unico
        validar formato de correo

        */

    if (!usuario.nombreCompleto) {
      throw new BadRequestException(
        'Debe completar el campo de nombre de usuario',
      );
    }

    const existeCorreo = await this.repo.buscarPorEmail(usuario.correo);

    if (existeCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    const existeUser = await this.repo.buscarPorUsername(usuario.nombreUsuario);

    if (existeUser) {
      throw new ConflictException('El nombre de usuario ya existe');
    }

    return this.repo.crearUsuario(usuario);
  }
  public async EliminarUsuario(
    idUsuario: string,
    contrasenia: string,
  ): Promise<void> {
    /* validar que el usuario exista */
    /* pedirle que confirme la contrasenia al usuario*/

    const usuario = await this.repo.buscarPorIdConContrasenia(idUsuario);

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${idUsuario} no encontrado`);
    }

    const contraseniaValida = await bcrypt.compare(
      contrasenia,
      usuario.contrasenia,
    );

    if (!contraseniaValida) {
      throw new BadRequestException('La contrasenia es incorrecta');
    }

    await this.repo.eliminarUsuario(idUsuario);
  }

  public async EliminarUsuarioAdmin(
    idUsuario: string,
    idAdmin: string,
  ): Promise<void> {
    /* validar que el usuario exista */

    await this.obtenerUsuarioPorId(idUsuario);

    const usuarioAdmin = await this.obtenerUsuarioPorId(idAdmin);

    if (usuarioAdmin.rol !== rolUsuario.usuarioAdministrador) {
      throw new ForbiddenException(
        'Solo un administrador puede eliminar usuarios',
      );
    }

    await this.repo.eliminarUsuario(idUsuario);
  }

  public async ActualizarUsuario(
    idUsuario: string,
    datos: actualizarUsuarioDTO,
  ): Promise<void> {
    const usuario = await this.obtenerUsuarioPorId(idUsuario);

    if (
      !datos.nombreCompleto &&
      !datos.nombreUsuario &&
      !datos.correo &&
      !datos.numeroTelefono
    ) {
      throw new BadRequestException(
        'Debe completar al menos un campo para actualizar',
      );
    }

    const datosFiltrados = {
      nombreCompleto:
        typeof datos.nombreCompleto === 'string' &&
        datos.nombreCompleto.trim() !== ''
          ? datos.nombreCompleto.trim()
          : usuario.nombreCompleto,
      nombreUsuario:
        typeof datos.nombreUsuario === 'string' &&
        datos.nombreUsuario.trim() !== ''
          ? datos.nombreUsuario.trim()
          : usuario.nombreUsuario,
      correo:
        typeof datos.correo === 'string' && datos.correo.trim() !== ''
          ? datos.correo.trim().toLowerCase()
          : usuario.correo,
      numeroTelefono:
        typeof datos.numeroTelefono === 'string' &&
        datos.numeroTelefono.trim() !== ''
          ? datos.numeroTelefono.trim()
          : usuario.numeroTelefono,
    };

    if (datosFiltrados.correo !== usuario.correo) {
      const existeCorreo = await this.repo.buscarPorEmail(
        datosFiltrados.correo,
      );

      if (existeCorreo) {
        throw new ConflictException(
          'El correo ya está registrado en la base de datos',
        );
      }
    }

    if (datosFiltrados.nombreUsuario !== usuario.nombreUsuario) {
      const existeUser = await this.repo.buscarPorUsername(
        datosFiltrados.nombreUsuario,
      );

      if (existeUser) {
        throw new ConflictException(
          'El nombre de usuario ya esta registrado en la base de datos',
        );
      }
    }

    Object.assign(usuario, datosFiltrados);

    await this.repo.actualizarUsuario(idUsuario, datosFiltrados);
  }

  public async obtenerUsuarioPorId(idUsuario: string): Promise<Usuario> {
    const usuario = await this.repo.buscarPorId(idUsuario);

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${idUsuario} no encontrado`);
    }

    return usuario;
  }

  public async ObtenerUsuarioPorNombreUsuario(
    nombreUsuario: string,
  ): Promise<Usuario | null> {
    return this.repo.buscarPorUsername(nombreUsuario);
  }

  public async ObtenerUsuarioPorCorreo(
    correo: string,
  ): Promise<Usuario | null> {
    return this.repo.buscarPorEmailConContrasenia(correo);
  }

  public async CambiarRolUsuario(
    idUsuario: string,
    idAdmin: string,
    datos: CambiarRolDTO,
  ): Promise<void> {
    const usuarioObjetivo = await this.obtenerUsuarioPorId(idUsuario);

    const usuarioAdmin = await this.obtenerUsuarioPorId(idAdmin);

    // 1. No puede modificarse a sí mismo
    if (usuarioObjetivo.id === usuarioAdmin.id) {
      throw new BadRequestException(
        'Un administrador no puede cambiar su propio rol',
      );
    }

    // 2. No se puede modificar a otro administrador
    if (usuarioObjetivo.rol === rolUsuario.usuarioAdministrador) {
      throw new BadRequestException(
        'No se puede modificar el rol de otro administrador',
      );
    }

    // 3. No se puede asignar rol de administrador
    if (datos.rol === rolUsuario.usuarioAdministrador) {
      throw new BadRequestException(
        'No se puede asignar el rol de administrador',
      );
    }

    await this.repo.cambiarRolUsuario(idUsuario, datos.rol);
  }

  public async registrarPublicacionEliminadaPorModeracion(
    idUsuario: string,
    idModerador: string,
  ): Promise<void> {
    const usuario = await this.obtenerUsuarioPorId(idUsuario);
    const usuarioModerador = await this.obtenerUsuarioPorId(idModerador);

    if (
      usuarioModerador.rol !== rolUsuario.usuarioModerador &&
      usuarioModerador.rol !== rolUsuario.usuarioAdministrador
    ) {
      throw new ForbiddenException(
        'Solo un moderador o administrador puede registrar publicaciones eliminadas por moderación',
      );
    }

    if (usuario.estado === estadosUsuario.BLOQUEADO) {
      return;
    }

    const nuevaCantidad = (usuario.cantidadPublicacionesBloqueadas ?? 0) + 1;

    const datosActualizacion: actualizarPublicacionesBloqueadasDto = {
      cantidadPublicacionesBloqueadas: nuevaCantidad,
      estado: usuario.estado,
      razonBloqueo: usuario.razonBloqueo ?? null,
    };

    if (nuevaCantidad >= 3) {
      datosActualizacion.estado = estadosUsuario.BLOQUEADO;
      datosActualizacion.razonBloqueo =
        'Bloqueado automáticamente tras 3 publicaciones eliminadas por moderación';
    }

    await this.repo.actualizarUsuario(idUsuario, datosActualizacion);
  }

  public async ResetearContraseniaUsuario(
    idUsuario: string,
    actualizarContraseniaDto: actualizarContraseniaDTO,
  ): Promise<void> {
    /* verfifcar que el usuario exista
    verificar que la contrasenia actual sea correcta
    validar que la contrasenia nueva no sea igual a la actual
    */

    const usuario = await this.repo.buscarPorIdConContrasenia(idUsuario);

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${idUsuario} no encontrado`);
    }

    const contraseniaValida = await bcrypt.compare(
      actualizarContraseniaDto.contraseniaActual,
      usuario.contrasenia,
    );

    if (!contraseniaValida) {
      throw new BadRequestException('La contrasenia actual es incorrecta');
    }

    const mismaContrasenia = await bcrypt.compare(
      actualizarContraseniaDto.contraseniaNueva,
      usuario.contrasenia,
    );

    if (mismaContrasenia) {
      throw new BadRequestException(
        'La nueva contrasenia no puede ser igual a la contrasenia actual',
      );
    }

    const hashNueva = await bcrypt.hash(
      actualizarContraseniaDto.contraseniaNueva,
      10,
    );

    await this.repo.resetearContraseniaUsuario(idUsuario, hashNueva);
  }

  public async BloquearUsuario(
    idUsuario: string,
    idModerador: string,
    datos: BloquearUsuarioDTO,
  ): Promise<void> {
    /* verfifcar que el usuario tenga rol mod o admin
    verificar que el usuario bloqueador no sea el mismo que el bloqueado
    validar que el usuario bloqueado no este ya bloqueado
    validar que la razon de bloqueo no este vacia
    */

    const usuario = await this.obtenerUsuarioPorId(idUsuario);

    const usuarioModerador = await this.obtenerUsuarioPorId(idModerador);

    if (
      usuarioModerador.rol !== rolUsuario.usuarioModerador &&
      usuarioModerador.rol !== rolUsuario.usuarioAdministrador
    ) {
      throw new ForbiddenException(
        'Solo un moderador o administrador puede bloquear usuarios',
      );
    }

    if (usuarioModerador.rol === rolUsuario.usuarioModerador) {
      if (usuario.rol !== rolUsuario.usuarioNormal) {
        throw new ForbiddenException(
          'Un moderador solo puede bloquear usuarios normales',
        );
      }
    }

    if (usuarioModerador.rol === rolUsuario.usuarioAdministrador) {
      if (usuario.rol === rolUsuario.usuarioAdministrador) {
        throw new ForbiddenException(
          'Un administrador no puede bloquear a otro administrador',
        );
      }
    }

    if (usuario.estado === estadosUsuario.BLOQUEADO) {
      throw new ConflictException(
        `El usuario con id ${idUsuario} ya se encuentra bloqueado`,
      );
    }

    if (!datos.razonBloqueo?.trim()) {
      throw new BadRequestException('La razón de bloqueo no puede estar vacía');
    }

    if (usuario.id === usuarioModerador.id) {
      throw new BadRequestException(
        'Un usuario no puede bloquearse a sí mismo',
      );
    }

    await this.repo.bloquearUsuario(
      usuario,
      usuarioModerador,
      datos.razonBloqueo.trim(),
    );
  }

  public async ListarUsuarios(): Promise<Usuario[]> {
    return this.repo.listarUsuarios();
  }
}
