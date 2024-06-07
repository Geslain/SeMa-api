import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

import { BaseEntity } from './base-entity.entity';

export const baseEntityFactory = Factory.define<BaseEntity>(() => ({
  id: faker.string.uuid(),
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
}));
