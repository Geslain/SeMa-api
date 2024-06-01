import { ApiProperty } from '@nestjs/swagger';
import { Column, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../utils/entities/base-entity.entity';
import { Field } from '../../fields/entities/field.entity';

export class DataRowField extends BaseEntity {
  @ApiProperty({
    example: 'Blue',
    description: "Data row's value",
  })
  @Column({ type: 'varchar' })
  value: string;

  @ManyToOne(() => Field)
  field: Field;
}
