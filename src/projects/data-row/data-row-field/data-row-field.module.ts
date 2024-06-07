import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataRowFieldService } from './data-row-field.service';
import { DataRowField } from './entities/data-row-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataRowField])],
  providers: [DataRowFieldService],
  exports: [DataRowFieldService],
})
export class DataRowFieldModule {}
