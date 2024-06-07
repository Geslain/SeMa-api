import { Test, TestingModule } from '@nestjs/testing';

import { DataRowController } from './data-row.controller';
import { DataRowService } from './data-row.service';

describe('DataRowController', () => {
  let controller: DataRowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataRowController],
      providers: [DataRowService],
    }).compile();

    controller = module.get<DataRowController>(DataRowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
