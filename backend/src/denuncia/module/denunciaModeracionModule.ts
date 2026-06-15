import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicacionModule } from '../../publicacion/module/publicacionModule';
import { DenunciaController } from '../controller/denunciaController';
import { Denuncia } from '../entity/denunciaEntity';
import { DenunciaRepository } from '../repository/denunciaRepository';
import { DenunciaService } from '../service/denunciaService';

@Module({
  imports: [TypeOrmModule.forFeature([Denuncia]), PublicacionModule],
  controllers: [DenunciaController],
  providers: [DenunciaRepository, DenunciaService],
  exports: [DenunciaService],
})
export class DenunciaModeracionModule {}
