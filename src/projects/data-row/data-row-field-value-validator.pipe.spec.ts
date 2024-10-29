import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { FieldsService } from '../../fields/fields.service';

import { DataRowFieldValueValidator } from './data-row-field-value-validator.pipe';
import { dataRowsDtoFactory } from './factories/data-rows.factory';

describe('DataRowFieldValueValidator', () => {
  let pipe: DataRowFieldValueValidator;
  let mockFieldService: Partial<jest.Mocked<FieldsService>>;
  let metadata: ArgumentMetadata;

  beforeEach(async () => {
    mockFieldService = {
      validate: jest.fn(),
    };

    pipe = new DataRowFieldValueValidator(
      mockFieldService as unknown as FieldsService,
    );
    metadata = { type: 'body' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should throw error with validation messages', async () => {
    const value = dataRowsDtoFactory.build();

    const validateSpy = jest
      .spyOn(mockFieldService, 'validate')
      .mockImplementationOnce(() => {
        throw new Error('error message');
      });

    await expect(pipe.transform(value, metadata)).rejects.toThrowError(
      new BadRequestException([
        'fields.0.value error message',
        'fields.1.value error message',
      ]),
    );

    expect(validateSpy).toHaveBeenNthCalledWith(
      1,
      value.fields[0].fieldId,
      value.fields[0].value,
    );
    expect(validateSpy).toHaveBeenNthCalledWith(
      2,
      value.fields[1].fieldId,
      value.fields[1].value,
    );
  });

  it('should return initial value when no validation error', async () => {
    const value = dataRowsDtoFactory.build();

    const validateSpy = jest
      .spyOn(mockFieldService, 'validate')
      .mockImplementationOnce(() => {
        return Promise.resolve(true);
      });

    expect(await pipe.transform(value, metadata)).toEqual(value);
    expect(validateSpy).toHaveBeenNthCalledWith(
      1,
      value.fields[0].fieldId,
      value.fields[0].value,
    );
    expect(validateSpy).toHaveBeenNthCalledWith(
      2,
      value.fields[1].fieldId,
      value.fields[1].value,
    );
  });

  it("should return the value without modification if it is not a body or has no fields'", async () => {
    const value = 'foo';

    expect(await pipe.transform(value, { type: 'param' })).toEqual(value);
    expect(mockFieldService.validate).not.toHaveBeenCalled();
  });
});
