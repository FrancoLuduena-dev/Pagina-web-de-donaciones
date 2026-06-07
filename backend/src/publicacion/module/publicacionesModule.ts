import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { PublicacionController } from '../controller/publicacionController';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionRepository } from '../repository/publicacionRepository';
import { PublicacionService } from '../service/publicacionService';

@Module({
  imports: [TypeOrmModule.forFeature([Publicacion])],
  controllers: [PublicacionController],
  providers: [PublicacionService, PublicacionRepository],
  exports: [PublicacionService, PublicacionRepository],
})
export class PublicacionesModule {}
