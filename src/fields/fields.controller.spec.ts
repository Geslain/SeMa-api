import { Test, TestingModule } from '@nestjs/testing';

import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { FieldType } from './entities/field.entity';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';
import { createMockedField } from './helpers/test';

describe('FieldsController', () => {
  let controller: FieldsController;

  const createFieldDto: CreateFieldDto = createMockedField(1, FieldType.text);
  const updateFieldDto: UpdateFieldDto = createMockedField(11, FieldType.text);
  const fieldId = '123';
  const mockedField = createMockedField(+fieldId, FieldType.text, true);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldsController],
      providers: [
        {
          provide: FieldsService,
          useValue: {
            findAll: jest
              .fn()
              .mockResolvedValue([
                createMockedField(1, FieldType.text),
                createMockedField(2, FieldType.date),
                createMockedField(3, FieldType.list),
              ]),
            create: jest.fn().mockResolvedValue(createFieldDto),
            update: jest.fn().mockResolvedValue(updateFieldDto),
            findOne: jest.fn().mockResolvedValue(mockedField),
            remove: jest.fn().mockResolvedValue(mockedField),
          },
        },
      ],
    }).compile();

    controller = module.get<FieldsController>(FieldsController);
    service = module.get<FieldsService>(FieldsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
