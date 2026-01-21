import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablesUsersGroups1768747677569 implements MigrationInterface {
  name = 'Migrations1768747677569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."groups_status_enum" AS ENUM('empty', 'notEmpty')`,
    );

    await queryRunner.query(`
        CREATE TABLE "groups" (
            "id" SERIAL NOT NULL,
            "name" character varying NOT NULL,
            "status" "public"."groups_status_enum" NOT NULL DEFAULT 'empty',
            CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id")
         )
    `);

    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('pending', 'active', 'blocked')`,
    );

    await queryRunner.query(`
        CREATE TABLE "users" (
            "id" SERIAL NOT NULL,
            "name" character varying(100) NOT NULL,
            "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending',
            CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
         )
    `);

    await queryRunner.query(`
        CREATE TABLE "user_groups" (
            "user_id" integer NOT NULL,
            "group_id" integer NOT NULL,
            CONSTRAINT "PK_c95039f66f5d7a452fc53945bfe" PRIMARY KEY ("user_id", "group_id")
         )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_95bf94c61795df25a515435010" ON "user_groups" ("user_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_4c5f2c23c34f3921fbad2cd394" ON "user_groups" ("group_id")`,
    );

    await queryRunner.query(`
        ALTER TABLE "user_groups"
          ADD CONSTRAINT "FK_95bf94c61795df25a5154350102"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
        ALTER TABLE "user_groups"
          ADD CONSTRAINT "FK_4c5f2c23c34f3921fbad2cd3940"
            FOREIGN KEY ("group_id") REFERENCES "groups"("id") 
                ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_groups" DROP CONSTRAINT "FK_4c5f2c23c34f3921fbad2cd3940"`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_groups" DROP CONSTRAINT "FK_95bf94c61795df25a5154350102"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c5f2c23c34f3921fbad2cd394"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_95bf94c61795df25a515435010"`,
    );

    await queryRunner.query(`DROP TABLE "user_groups"`);

    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);

    await queryRunner.query(`DROP TABLE "groups"`);

    await queryRunner.query(`DROP TYPE "public"."groups_status_enum"`);
  }
}
