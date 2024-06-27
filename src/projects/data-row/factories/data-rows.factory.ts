import { Factory } from 'fishery';

import { CreateDataRowDto } from '../dto/create-data-row.dto';
import { DataRow } from '../entities/data-row.entity';
import { baseEntityFactory } from '../../../common/base-entity/base-entity.factory';
import { dataRowFieldsDtoFactory } from '../data-row-field/factories/data-row-fields.factory';

export const dataRowsDtoFactory = Factory.define<CreateDataRowDto>(() => ({
  fields: dataRowFieldsDtoFactory.buildList(2),
}));

export const dataRowsFactory = Factory.define<DataRow>(({ associations }) => ({
  ...baseEntityFactory.build(),
  fields: associations.fields,
  project: associations.project,
}));
