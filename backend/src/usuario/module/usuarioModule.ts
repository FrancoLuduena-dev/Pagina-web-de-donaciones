import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Usuario from '../entity/usuarioEntity';
import UsuarioController from '../controller/usuarioController';
import UsuarioService from '../service/usuarioService';
import UsuarioRepository from '../repository/usuarioRepository';
import autenticacionUsuario from '../auth/authUsuario';
import { AuthGuard } from '../auth/authGuard';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';
import { StatusGuard } from 'src/compartidos/guards/statusGuard';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    UsuarioRepository,
    autenticacionUsuario,
    AuthGuard,
    RolesGuard,
    StatusGuard,
  ],
  exports: [
    UsuarioService,
    UsuarioRepository,
    autenticacionUsuario,
    AuthGuard,
    RolesGuard,
    StatusGuard,
  ],
})
export class UsuarioModule {}
