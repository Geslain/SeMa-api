import { FieldType } from '../entities/field.entity';

import { createMockedField } from './test';

describe('createMockedUser function', () => {
  it('should return field of type text without id', () => {
    expect(createMockedField(1, FieldType.text)).toEqual({
      name: `foo1`,
      type: FieldType.text,
    });
  });

  it('should return field of type text with id', () => {
    expect(createMockedField(1, FieldType.text, true)).toEqual({
      id: 1,
      name: `foo1`,
      type: FieldType.text,
    });
  });

  it('should return field of type date with id', () => {
    expect(createMockedField(1, FieldType.date, true)).toEqual({
      id: 1,
      name: `foo1`,
      type: FieldType.date,
    });
  });

  it('should return field of type list with id', () => {
    expect(createMockedField(1, FieldType.list, true)).toEqual({
      id: 1,
      name: `foo1`,
      type: FieldType.list,
      values: ['foo1', 'bar1'],
    });
  });
});
