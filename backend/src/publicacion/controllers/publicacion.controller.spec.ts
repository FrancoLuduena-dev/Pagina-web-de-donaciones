import { Test, TestingModule } from '@nestjs/testing';
import { PublicacionController } from './publicacionController';

describe('PublicacionController', () => {
  let controller: PublicacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicacionController],
    }).compile();

    controller = module.get<PublicacionController>(PublicacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
