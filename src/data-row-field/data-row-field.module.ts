import { Module } from '@nestjs/common';

import { DataRowFieldService } from './data-row-field.service';
import { DataRowFieldController } from './data-row-field.controller';

@Module({
  controllers: [DataRowFieldController],
  providers: [DataRowFieldService],
})
export class DataRowFieldModule {}
