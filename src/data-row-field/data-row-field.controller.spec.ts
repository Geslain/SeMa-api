import { Test, TestingModule } from '@nestjs/testing';

import { DataRowFieldController } from './data-row-field.controller';
import { DataRowFieldService } from './data-row-field.service';

describe('DataRowFieldController', () => {
  let controller: DataRowFieldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataRowFieldController],
      providers: [DataRowFieldService],
    }).compile();

    controller = module.get<DataRowFieldController>(DataRowFieldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
