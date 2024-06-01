import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';

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
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({
    description: 'User created fields',
  })
  @OneToMany(() => Field, (field) => field.owner)
  fields: Field[];

  /**
   * Compare two string by encrypting the first one given as parameter
   *
   * @param candidatePassword
   */
  async comparePassword(candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  @BeforeInsert()
  async hashPassword() {
    const saltOrRounds = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, saltOrRounds);
  }
}
