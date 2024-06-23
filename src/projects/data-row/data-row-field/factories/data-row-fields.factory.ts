import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

import { CreateDataRowFieldDto } from '../dto/create-data-row-field.dto';
import { DataRowField } from '../entities/data-row-field.entity';
import { DataRow } from '../../entities/data-row.entity';
import { Field } from '../../../../fields/entities/field.entity';

export const dataRowFieldsDtoFactory = Factory.define<CreateDataRowFieldDto>(
  () => ({
    value: faker.word.noun(),
    fieldId: faker.string.uuid(),
  }),
);

export const dataRowFieldsFactory = Factory.define<DataRowField>(
  ({ params }) => {
    const dataRow = new DataRow();
    const field = new Field();

    if (params.fieldId) {
      field.id = params.fieldId;
    }

    if (params.dataRowId) {
      dataRow.id = params.dataRowId;
    }

    return {
      ...dataRowFieldsDtoFactory.build({ fieldId: params.fieldId || field.id }),
      dataRowId: params.dataRowId || dataRow.id,
      dataRow,
      field,
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    };
  },
);
