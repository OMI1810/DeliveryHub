import { Test, TestingModule } from '@nestjs/testing';
import { GeocoodingService } from './geocooding.service';

describe('GeocoodingService', () => {
  let service: GeocoodingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeocoodingService],
    }).compile();

    service = module.get<GeocoodingService>(GeocoodingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
