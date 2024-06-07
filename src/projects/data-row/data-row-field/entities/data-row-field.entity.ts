import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DataRow } from '../../entities/data-row.entity';
import { Field } from '../../../../fields/entities/field.entity';

@Entity()
export class DataRowField {
  @ApiProperty({
    example: 'Blue',
    description: "Data row's value",
  })
  @Column({ type: 'varchar' })
  value: string;

  @PrimaryColumn({ type: 'uuid' })
  dataRowId: string;
  @ManyToOne(() => DataRow, (dataRow) => dataRow.fields, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'dataRowId' })
  dataRow: DataRow;

  @PrimaryColumn({ name: 'fieldId', type: 'uuid' })
  fieldId: string;
  @ManyToOne(() => Field, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'fieldId' })
  field: Field;

  @ApiProperty({
    example: '2024-05-30 17:08:03.503496',
    description: "Entity's create date",
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    example: '2024-05-30 17:08:03.503496',
    description: "Entity's update date",
  })
  @UpdateDateColumn()
  updated_at: Date;
}
