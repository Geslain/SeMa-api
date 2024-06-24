import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../../../common/base-entity/base-entity.entity';
import { DataRowField } from '../data-row-field/entities/data-row-field.entity';
import { Project } from '../../entities/project.entity';

@Entity()
export class DataRow extends BaseEntity {
  @ApiProperty({
    example: [DataRowField],
    description: 'Every field for a data row',
  })
  @OneToMany(
    /* istanbul ignore next */ () => DataRowField,
    /* istanbul ignore next */ (dataRowField) => dataRowField.dataRow,
    {
      eager: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  fields: DataRowField[];

  @ApiProperty({
    example: 'd13f7357-a2f4-4043-a5b7-7c9617c66e8d',
    description: 'Project uuid for data row',
  })
  @ManyToOne(
    /* istanbul ignore next */ () => Project,
    /* istanbul ignore next */ (project) => project.dataRows,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  project: Project;
}
