import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneFieldType1729887275332 implements MigrationInterface {
  name = 'AddPhoneFieldType1729887275332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."field_type_enum" RENAME TO "field_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."field_type_enum" AS ENUM('text', 'phone', 'date', 'list')`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "type" TYPE "public"."field_type_enum" USING "type"::"text"::"public"."field_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "type" SET DEFAULT 'text'`,
    );
    await queryRunner.query(`DROP TYPE "public"."field_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."field_type_enum_old" AS ENUM('text', 'date', 'list')`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "type" TYPE "public"."field_type_enum_old" USING "type"::"text"::"public"."field_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "type" SET DEFAULT 'text'`,
    );
    await queryRunner.query(`DROP TYPE "public"."field_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."field_type_enum_old" RENAME TO "field_type_enum"`,
    );
  }
}
