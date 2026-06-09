import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PublicacionController } from '../controller/publicacionController';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionRepository } from '../repository/publicacionRepository';
import { PublicacionService } from '../service/publicacionService';

import { UsuarioModule } from '../../usuario/module/usuarioModule';

@Module({
  imports: [TypeOrmModule.forFeature([Publicacion]), UsuarioModule],
  controllers: [PublicacionController],
  providers: [PublicacionService, PublicacionRepository],
})
export class PublicacionesModule {}
