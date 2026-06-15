import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from '../entity/solicitudEntity';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { SolicitudService } from '../service/solicitudService';
import { SolicitudController } from '../controller/solicitudController';
import { PublicacionModule } from 'src/publicacion/module/publicacionModule';
import { UsuarioModule } from '../../usuario/module/usuarioModule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solicitud]),
    PublicacionModule,
    UsuarioModule,
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService, SolicitudRepository],
  exports: [SolicitudService],
})
export class SolicitudesModule {}
