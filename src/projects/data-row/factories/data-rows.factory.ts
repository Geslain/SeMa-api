import { Factory } from 'fishery';

import { CreateDataRowDto } from '../dto/create-data-row.dto';
import { DataRow } from '../entities/data-row.entity';
import { baseEntityFactory } from '../../../common/base-entity/base-entity.factory';
import { projectFactory } from '../../factories/projects.factory';
import { dataRowFieldsFactory } from '../data-row-field/factories/data-row-fields.factory';

export const dataRowsDtoFactory = Factory.define<CreateDataRowDto>(() => ({
  fields: dataRowFieldsFactory.buildList(2),
}));

export const dataRowsFactory = Factory.define<DataRow>(({ associations }) => ({
  ...baseEntityFactory.build(),
  fields: associations.fields || dataRowFieldsFactory.buildList(2),
  project: associations.project || projectFactory.build(),
}));
