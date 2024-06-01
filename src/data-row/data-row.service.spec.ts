import { Test, TestingModule } from '@nestjs/testing';

import { DataRowService } from './data-row.service';

describe('DataRowService', () => {
  let service: DataRowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataRowService],
    }).compile();

    service = module.get<DataRowService>(DataRowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
