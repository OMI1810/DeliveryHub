import { Test, TestingModule } from '@nestjs/testing';
import { GeocoodingController } from './geocooding.controller';
import { GeocoodingService } from './geocooding.service';

describe('GeocoodingController', () => {
  let controller: GeocoodingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeocoodingController],
      providers: [GeocoodingService],
    }).compile();

    controller = module.get<GeocoodingController>(GeocoodingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
