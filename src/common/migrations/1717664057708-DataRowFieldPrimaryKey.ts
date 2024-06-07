import { MigrationInterface, QueryRunner } from 'typeorm';

export class DataRowFieldPrimaryKey1717664057708 implements MigrationInterface {
  name = 'DataRowFieldPrimaryKey1717664057708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "PK_b40e3305a097012fae98ee072b9"`,
    );
    await queryRunner.query(`ALTER TABLE "data_row_field" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "PK_792050013cf4517abff734009b0" PRIMARY KEY ("dataRowId", "fieldId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "PK_792050013cf4517abff734009b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "PK_b40e3305a097012fae98ee072b9" PRIMARY KEY ("id")`,
    );
  }
}
