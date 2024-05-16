import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: "User's unique id" })
  @PrimaryGeneratedColumn()
  id: number;

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
  password: string;
}
