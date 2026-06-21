import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuarioModule } from '../../usuario/module/usuarioModule';
import { NotificacionController } from '../controller/notificacionController';
import { Notificacion } from '../entity/notificacionEntity';
import { NotificacionRepository } from '../repository/notificacionRepository';
import { NotificacionService } from '../service/notificacionService';
import { NotificacionSolicitudListener } from '../listener/notificacionSolicitudListener';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion]), UsuarioModule],
  controllers: [NotificacionController],
  providers: [
    NotificacionService,
    NotificacionRepository,
    NotificacionSolicitudListener,
  ],
  exports: [NotificacionService],
})
export class NotificacionModule {}
