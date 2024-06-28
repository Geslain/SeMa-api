import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectMessageTemplate1719578472282 implements MigrationInterface {
  name = 'ProjectMessageTemplate1719578472282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "project" ADD "messageTemplate" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP COLUMN "messageTemplate"`,
    );
  }
}
