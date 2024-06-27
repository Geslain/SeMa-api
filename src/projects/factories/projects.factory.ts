import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../entities/project.entity';
import { baseEntityFactory } from '../../common/base-entity/base-entity.factory';
import { dataRowsFactory } from '../data-row/factories/data-rows.factory';

export const projectsDtoFactory = Factory.define<CreateProjectDto>(() => ({
  name: faker.word.noun(),
}));

export const projectsFactory = Factory.define<Project>(({ associations }) => ({
  ...baseEntityFactory.build(),
  ...projectsDtoFactory.build(),
  owner: associations.owner,
  dataRows: dataRowsFactory.buildList(2),
}));
