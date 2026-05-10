import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { PublicacionController } from '../controllers/publicacionController';
import { Publicacion } from '../entities/publicacionEntity';
import { PublicacionRepository } from '../repositories/repository.publicacion';
import { PublicacionService } from '../services/publicaciones.service';
import { LoggerMiddleware } from 'src/commons/middlewares/logger.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Publicacion])],
  controllers: [PublicacionController],
  providers: [PublicacionService, PublicacionRepository],
})
export class PublicacionesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(PublicacionController);
  }
}
