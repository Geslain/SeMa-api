import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

export const userDtoFactory = Factory.define<CreateUserDto>(() => ({
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password({
    length: 20,
    pattern: /[A-Za-z\d@$!%*?&]/,
  }),
}));

export const userFactory = Factory.define<User>(() => ({
  id: faker.string.uuid(),
  fields: [],
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
  ...userDtoFactory.build(),
}));
