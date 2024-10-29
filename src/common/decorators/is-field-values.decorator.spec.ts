import { validate } from 'class-validator';

import { FieldType } from '../../fields/entities/field.entity';

import { IsFieldValues } from './is-field-values.decorator';

class TestClass {
  @IsFieldValues()
  values: any[];

  type: FieldType;
}

describe('IsFieldValues Decorator', () => {
  let testClass: TestClass;

  beforeEach(() => {
    testClass = new TestClass();
  });

  it("should pass validation when type is 'LIST' and values array has at least one item", async () => {
    testClass.type = FieldType.LIST;
    testClass.values = ['item1'];

    const errors = await validate(testClass);
    expect(errors.length).toBe(0);
  });

  it("should fail validation when type is 'LIST' and values array is empty", async () => {
    testClass.type = FieldType.LIST;
    testClass.values = [];

    const errors = await validate(testClass);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints?.isFieldValues).toBe(
      "You must add at least one value for type 'list' field",
    );
  });

  it("should pass validation when type is not 'LIST' even if values array is empty", async () => {
    testClass.type = FieldType.TEXT;
    testClass.values = [];

    const errors = await validate(testClass);
    expect(errors.length).toBe(0);
  });
});
