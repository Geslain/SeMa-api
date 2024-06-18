import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { mockRepository } from '../../common/tests/mock-repository';
import { FieldsService } from '../../fields/fields.service';
import { ProjectsService } from '../projects.service';

import { DataRowService } from './data-row.service';
import { DataRow } from './entities/data-row.entity';
import { DataRowFieldService } from './data-row-field/data-row-field.service';

describe('DataRowService', () => {
  let service: DataRowService;
  const mockedDataRowRepository = mockRepository();
  const mockedFieldService = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const mockedProjectService = {
    findOne: jest.fn(),
  };
  const mockedDataRowFieldsService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataRowService,
        {
          provide: getRepositoryToken(DataRow),
          useValue: mockedDataRowRepository,
        },
        {
          provide: FieldsService,
          useValue: mockedFieldService,
        },
        {
          provide: ProjectsService,
          useValue: mockedProjectService,
        },
        {
          provide: DataRowFieldService,
          useValue: mockedDataRowFieldsService,
        },
      ],
    }).compile();

    service = module.get<DataRowService>(DataRowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
