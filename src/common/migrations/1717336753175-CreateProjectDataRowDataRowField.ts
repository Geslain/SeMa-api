import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectDataRowDataRowField1717336753175
  implements MigrationInterface
{
  name = 'CreateProjectDataRowDataRowField1717336753175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "data_row_field" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "dataRowId" uuid, "fieldId" uuid, CONSTRAINT "PK_b40e3305a097012fae98ee072b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_row" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "projectId" uuid, CONSTRAINT "PK_51d60da0265d89be3139930c1af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "type" SET DEFAULT 'text'`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_2bdb9525946b2361a31b1072237" FOREIGN KEY ("dataRowId") REFERENCES "data_row"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row" ADD CONSTRAINT "FK_3cd91df0f5c187258c34da6e85e" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_row" DROP CONSTRAINT "FK_3cd91df0f5c187258c34da6e85e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_2bdb9525946b2361a31b1072237"`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "values" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP TABLE "data_row"`);
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(`DROP TABLE "data_row_field"`);
  }
}
