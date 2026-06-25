import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ConfigModule,
  ConfigService,
  type ConfigModuleOptions,
} from '@nestjs/config';

import { PublicacionModule } from './publicacion/module/publicacionModule';
import { SolicitudesModule } from './solicitud/module/solicitudModule';
import { UsuarioModule } from './usuario/module/usuarioModule';
import { DenunciaModeracionModule } from './denuncia/module/denunciaModeracionModule';
import { NotificacionModule } from './notificacion/module/notificacionModule';

const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
};

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    EventEmitterModule.forRoot(),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),

        port: Number(config.get<string>('DB_PORT')),

        username: config.get<string>('DB_USER'),

        password: config.get<string>('DB_PASS'),

        database: config.get<string>('DB_NAME'),

        autoLoadEntities: true,

        synchronize: true,
      }),
    }),

    UsuarioModule,
    PublicacionModule,
    SolicitudesModule,
    DenunciaModeracionModule,
    NotificacionModule,
  ],
})
export class AppModule {}
