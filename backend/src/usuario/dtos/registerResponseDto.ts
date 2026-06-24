export default class RegisterResponseDto {
  message!: string;
  user!: {
    id: string;
    correo: string;
    nombreUsuario: string;
  };
}
