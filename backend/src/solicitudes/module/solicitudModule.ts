import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Solicitud } from '../entity/solicitudEntity';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { SolicitudService } from '../service/solicitudService';
import { PublicacionesModule } from '../../publicacion/module/publicacionesModule';

@Module({
  imports: [TypeOrmModule.forFeature([Solicitud]), PublicacionesModule],
  providers: [SolicitudService, SolicitudRepository],
  exports: [SolicitudService],
})
export class SolicitudesModule {}
