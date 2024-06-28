import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectFields1719506829368 implements MigrationInterface {
  name = 'ProjectFields1719506829368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_field" ("fieldId" uuid NOT NULL, "projectId" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_768365d65f1a466be140d07f6d8" PRIMARY KEY ("fieldId", "projectId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_fields_field" ("projectId" uuid NOT NULL, "fieldId" uuid NOT NULL, CONSTRAINT "PK_0fbb1dbbb3a8e9ed70df0f76180" PRIMARY KEY ("projectId", "fieldId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f87809fd1fc0b377b9d795177" ON "project_fields_field" ("projectId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_184e8c6836d2df74337627dbfc" ON "project_fields_field" ("fieldId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "project_field" ADD CONSTRAINT "FK_0cafeb85ffa9edb6a801be10e3d" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_field" ADD CONSTRAINT "FK_f8f74bd232f018682d838074c07" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_fields_field" ADD CONSTRAINT "FK_8f87809fd1fc0b377b9d7951778" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_fields_field" ADD CONSTRAINT "FK_184e8c6836d2df74337627dbfc0" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_fields_field" DROP CONSTRAINT "FK_184e8c6836d2df74337627dbfc0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_fields_field" DROP CONSTRAINT "FK_8f87809fd1fc0b377b9d7951778"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_field" DROP CONSTRAINT "FK_f8f74bd232f018682d838074c07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_field" DROP CONSTRAINT "FK_0cafeb85ffa9edb6a801be10e3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_2bdb9525946b2361a31b1072237"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_184e8c6836d2df74337627dbfc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f87809fd1fc0b377b9d795177"`,
    );
    await queryRunner.query(`DROP TABLE "project_fields_field"`);
    await queryRunner.query(`DROP TABLE "project_field"`);
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "data_row_field_dataRowId_fkey" FOREIGN KEY ("dataRowId") REFERENCES "data_row"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "data_row_field_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
