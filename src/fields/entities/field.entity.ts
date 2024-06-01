import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../utils/entities/base-entity.entity';

export enum FieldType {
  TEXT = 'text',
  DATE = 'date',
  LIST = 'list',
}

@Entity()
export class Field extends BaseEntity {
  @ApiProperty({
    example: 'Color',
    description: 'The name of the field',
  })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({
    example: 'Text',
    description: 'The type of the',
  })
  @Column('enum', {
    enum: FieldType,
    default: FieldType.TEXT,
  })
  type: FieldType;

  @ApiProperty({
    example: ['Blue', 'Green', 'Red'],
    description: 'Value of field in case field type is "list"',
  })
  @Column('text', { array: true })
  values?: string[];

  @ApiProperty({
    description: "Field's owner",
  })
  @ManyToOne(() => User, (user) => user.fields, {
    nullable: false,
    eager: true,
  })
  owner: User;
}
