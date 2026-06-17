import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Usuario from '../entity/usuarioEntity';
import UsuarioController from '../controller/usuarioController';
import UsuarioService from '../service/usuarioService';
import UsuarioRepository from '../repository/usuarioRepository';
import autenticacionUsuario from '../auth/authUsuario';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    UsuarioRepository,
    autenticacionUsuario,
  ],
  exports: [UsuarioService, UsuarioRepository, autenticacionUsuario],
})
export class UsuarioModule {}
