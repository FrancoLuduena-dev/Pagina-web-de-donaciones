import { estadosUsuario } from "../enums/estados_usuario.enum";
import { rolUsuario } from "../enums/rol_usuario.enum";
import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  IsOptional, 
  IsEnum, 
  IsNumber 
} from 'class-validator';

export default class Crear_Usuario_Dto {

  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  nombreCompleto: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  nombreUsuario: string;

  @IsEmail({ message: 'El correo ingresado no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contraseña: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono es obligatorio' })
  numeroTelefono: string;

  @IsEnum(rolUsuario)
  rol: rolUsuario;

  @IsEnum(estadosUsuario)
  estado: estadosUsuario;

  @IsNumber()
  @IsOptional()
  idBloqueador?: number | null;

  @IsString()
  @IsOptional()
  razonBloqueo?: string | null;
}