import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectRelations1717481195673 implements MigrationInterface {
  name = 'CreateProjectRelations1717481195673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "field" DROP CONSTRAINT "FK_37baccff4cdf27af16535c18976"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row" DROP CONSTRAINT "FK_3cd91df0f5c187258c34da6e85e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD "ownerId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_2bdb9525946b2361a31b1072237"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" DROP CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ALTER COLUMN "dataRowId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ALTER COLUMN "fieldId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row" ALTER COLUMN "projectId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ADD CONSTRAINT "FK_37baccff4cdf27af16535c18976" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_2bdb9525946b2361a31b1072237" FOREIGN KEY ("dataRowId") REFERENCES "data_row"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row" ADD CONSTRAINT "FK_3cd91df0f5c187258c34da6e85e" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed"`,
    );
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
      `ALTER TABLE "field" DROP CONSTRAINT "FK_37baccff4cdf27af16535c18976"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row" ALTER COLUMN "projectId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ALTER COLUMN "fieldId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ALTER COLUMN "dataRowId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_5fa3ada56c40fed856be609e8bc" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_row_field" ADD CONSTRAINT "FK_2bdb9525946b2361a31b1072237" FOREIGN KEY ("dataRowId") REFERENCES "data_row"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "ownerId"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "data_row" ADD CONSTRAINT "FK_3cd91df0f5c187258c34da6e85e" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "field" ADD CONSTRAINT "FK_37baccff4cdf27af16535c18976" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
