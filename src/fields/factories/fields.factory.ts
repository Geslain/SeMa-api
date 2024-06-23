import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

import { CreateFieldDto } from '../dto/create-field.dto';
import { Field, FieldType } from '../entities/field.entity';
import { baseEntityFactory } from '../../common/base-entity/base-entity.factory';
import { usersFactory } from '../../users/factories/users.factory';

export const fieldsDtoFactory = Factory.define<CreateFieldDto>(({ params }) => {
  const type = params.type || faker.helpers.enumValue(FieldType);
  const field: CreateFieldDto = {
    name: faker.word.noun(),
    type,
  };

  field['values'] =
    type === FieldType.LIST
      ? Array.from({
          length: faker.number.int({
            min: 3,
            max: 10,
          }),
        }).map(() => faker.word.noun())
      : null;

  return field;
});

export const fieldsFactory = Factory.define<Field>(() => ({
  ...baseEntityFactory.build(),
  ...fieldsDtoFactory.build(),
  owner: usersFactory.build(),
}));
