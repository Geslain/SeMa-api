import { PartialType } from '@nestjs/swagger';

import { CreateDataRowDto } from './create-data-row.dto';

export class UpdateDataRowDto extends PartialType(CreateDataRowDto) {}
