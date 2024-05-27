import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

import { CreateFieldDto } from '../dto/create-field.dto';
import { Field, FieldType } from '../entities/field.entity';
import { baseEntityFactory } from '../../utils/factories/base-entity.factory';
import { userFactory } from '../../users/factories/user.factory';

export const fieldDtoFactory = Factory.define<CreateFieldDto>(() => {
  const field: CreateFieldDto = {
    name: faker.string.alphanumeric(),
    type: faker.helpers.enumValue(FieldType),
    values: [],
  };

  field['values'] =
    field.type === FieldType.list
      ? Array.from({
          length: faker.number.int({
            min: 3,
            max: 10,
          }),
        }).map(() => faker.word.noun())
      : [];

  return field;
});

export const fieldFactory = Factory.define<Field>(() => ({
  ...baseEntityFactory.build(),
  ...fieldDtoFactory.build(),
  owner: userFactory.build(),
}));
