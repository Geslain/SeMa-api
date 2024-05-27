import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

import { Field } from '../../fields/entities/field.entity';
import { BaseEntity } from '../../utils/entities/base-entity.entity';

@Entity()
export class User extends BaseEntity {
  @ApiProperty({ example: 'Lullaby', description: "User's firstname" })
  @Column({ type: 'varchar' })
  firstname: string;

  @ApiProperty({ example: 'Norton', description: "User's lastname" })
  @Column({ type: 'varchar' })
  lastname: string;

  @ApiProperty({
    example: 'lullaby.norton@gmail.com',
    description: "User's email",
  })
  @Column({ type: 'varchar' })
  email: string;

  @ApiProperty({ example: '1234567890', description: "User's password" })
  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @ApiProperty({
    description: 'User created fields',
  })
  @OneToMany(() => Field, (field) => field.owner)
  fields: Field[];
}
