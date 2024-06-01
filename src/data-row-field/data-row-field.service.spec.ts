import { Test, TestingModule } from '@nestjs/testing';

import { DataRowFieldService } from './data-row-field.service';

describe('DataRowFieldService', () => {
  let service: DataRowFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataRowFieldService],
    }).compile();

    service = module.get<DataRowFieldService>(DataRowFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
