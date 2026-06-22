import { Test, TestingModule } from '@nestjs/testing';

import { StatusGuard } from '../../compartidos/guards/statusGuard';
import { AuthGuard } from '../../usuario/auth/authGuard';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionService } from '../service/publicacionService';
import { PublicacionController } from './publicacionController';

describe('PublicacionController', () => {
  let controller: PublicacionController;
  let publicacionService: {
    listarPublico: jest.Mock;
  };

  beforeEach(async () => {
    publicacionService = {
      listarPublico: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicacionController],
      providers: [
        {
          provide: PublicacionService,
          useValue: publicacionService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(StatusGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PublicacionController>(PublicacionController);
  });

  it('se instancia con sus dependencias', () => {
    expect(controller).toBeDefined();
  });

  it('delega el listado público al servicio con los filtros recibidos', async () => {
    const filtros: FiltrosPublicacionDto = {
      q: 'mesa',
    };
    const publicaciones = [] as Publicacion[];

    publicacionService.listarPublico.mockResolvedValue(publicaciones);

    await expect(controller.listarFeedPublico(filtros)).resolves.toBe(
      publicaciones,
    );
    expect(publicacionService.listarPublico).toHaveBeenCalledWith(filtros);
  });
});
