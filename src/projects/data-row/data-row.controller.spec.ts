import { Test, TestingModule } from '@nestjs/testing';

import { DataRowController } from './data-row.controller';
import { DataRowService } from './data-row.service';

describe('DataRowController', () => {
  let controller: DataRowController;
  const mockedDataRowService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataRowController],
      providers: [{ provide: DataRowService, useValue: mockedDataRowService }],
    }).compile();

    controller = module.get<DataRowController>(DataRowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
