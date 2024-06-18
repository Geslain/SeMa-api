import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { mockRepository } from '../../../common/tests/mock-repository';

import { DataRowFieldService } from './data-row-field.service';
import { DataRowField } from './entities/data-row-field.entity';

describe('DataRowFieldService', () => {
  let service: DataRowFieldService;
  const mockedDataRowFieldRepository = mockRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataRowFieldService,
        {
          provide: getRepositoryToken(DataRowField),
          useValue: mockedDataRowFieldRepository,
        },
      ],
    }).compile();

    service = module.get<DataRowFieldService>(DataRowFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
