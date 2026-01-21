import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupStatusTrigger1768747677570 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_group_status()
      RETURNS TRIGGER AS $$
      DECLARE
        target_group_id INTEGER;
        users_count INTEGER;
      BEGIN
        target_group_id :=
          CASE
            WHEN TG_OP = 'DELETE' THEN OLD.group_id
            ELSE NEW.group_id
          END;

        SELECT COUNT(*)
        INTO users_count
        FROM user_groups
        WHERE user_groups.group_id = target_group_id;

        UPDATE groups
        SET status =
          CASE
            WHEN users_count = 0 THEN 'empty'::groups_status_enum
            ELSE 'notEmpty'::groups_status_enum
          END
        WHERE id = target_group_id;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_update_group_status ON user_groups;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_update_group_status
      AFTER INSERT OR DELETE
      ON user_groups
      FOR EACH ROW
      EXECUTE FUNCTION update_group_status();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_update_group_status ON user_groups;
    `);

    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_group_status;
    `);
  }
}
