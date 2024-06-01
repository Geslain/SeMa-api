import { Module } from '@nestjs/common';

import { DataRowService } from './data-row.service';
import { DataRowController } from './data-row.controller';

@Module({
  controllers: [DataRowController],
  providers: [DataRowService],
})
export class DataRowModule {}
