import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicacionModule } from '../../publicacion/module/publicacionModule';
import { DenunciaController } from '../controller/denunciaController';
import { Denuncia } from '../entity/denunciaEntity';
import { DenunciaRepository } from '../repository/denunciaRepository';
import { DenunciaService } from '../service/denunciaService';
import { UsuarioModule } from 'src/usuario/module/usuarioModule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Denuncia]),
    PublicacionModule,
    UsuarioModule,
  ],
  controllers: [DenunciaController],
  providers: [DenunciaRepository, DenunciaService],
  exports: [DenunciaService],
})
export class DenunciaModeracionModule {}
