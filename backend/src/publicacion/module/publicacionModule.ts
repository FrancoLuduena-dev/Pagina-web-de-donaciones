import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionRepository } from '../repository/publicacionRepository';
import { PublicacionService } from '../service/publicacionService';
import { UsuarioModule } from '../../usuario/module/usuarioModule';
import { PublicacionController } from '../controller/publicacionController';
@Module({
  imports: [TypeOrmModule.forFeature([Publicacion]), UsuarioModule],
  controllers: [PublicacionController],
  providers: [PublicacionService, PublicacionRepository],
  exports: [PublicacionService, PublicacionRepository],
})
export class PublicacionModule {}
