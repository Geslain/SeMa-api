import { PartialType } from '@nestjs/swagger';

import { CreateDataRowFieldDto } from './create-data-row-field.dto';

export class UpdateDataRowFieldDto extends PartialType(CreateDataRowFieldDto) {}
