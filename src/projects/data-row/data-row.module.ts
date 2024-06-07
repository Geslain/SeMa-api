import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldsModule } from '../../fields/fields.module';
import { ProjectsModule } from '../projects.module';

import { DataRowService } from './data-row.service';
import { DataRowController } from './data-row.controller';
import { DataRow } from './entities/data-row.entity';
import { DataRowFieldModule } from './data-row-field/data-row-field.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataRow]),
    FieldsModule,
    ProjectsModule,
    DataRowFieldModule,
  ],
  controllers: [DataRowController],
  providers: [DataRowService],
})
export class DataRowModule {}
