import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { PublicacionController } from '../controllers/publicacionController';
import { Publicacion } from '../entities/publicacionEntity';
import { PublicacionRepository } from '../repositories/publicacionRepository';
import { PublicacionService } from '../services/publicacionService';

@Module({
  imports: [TypeOrmModule.forFeature([Publicacion])],
  controllers: [PublicacionController],
  providers: [PublicacionService, PublicacionRepository],
})
export class PublicacionesModule {}
