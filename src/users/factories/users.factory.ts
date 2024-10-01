import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { baseEntityFactory } from '../../common/base-entity/base-entity.factory';

export const usersDtoFactory = Factory.define<CreateUserDto>(() => ({
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  email: faker.internet.email(),
}));

export const usersFactory = Factory.define<User>(() => {
  return Object.assign(new User(), {
    ...baseEntityFactory.build(),
    ...usersDtoFactory.build(),
    fields: [],
  });
});
