import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaMigration1704845168490 implements MigrationInterface {
    name = 'SchemaMigration1704845168490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "person" ("id" SERIAL NOT NULL, "createDate" TIMESTAMP, "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "street" character varying NOT NULL, "streetNumber" character varying, "plz" character varying NOT NULL, "city" character varying NOT NULL, "email" character varying, "phoneNumber" character varying NOT NULL, "dateOfBirth" character varying NOT NULL, "allergies" character varying, "comments" character varying, "notification" character varying NOT NULL, "leader" boolean NOT NULL, "subgroupId" integer, CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subgroup" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "groupId" integer, CONSTRAINT "PK_40996811ee9cf487c804bc8a857" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_audit" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "action" character varying NOT NULL, "actionResult" character varying NOT NULL, "additionalData" character varying, "ip" character varying NOT NULL, "userAgent" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_028d1949aea3ccc867e56bd4bb4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reset_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "validTo" TIMESTAMP NOT NULL, "userId" integer, CONSTRAINT "PK_93e1171b4a87d2d0478295f1a99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "person" ADD CONSTRAINT "FK_22a600d14b4e098156a2d21a331" FOREIGN KEY ("subgroupId") REFERENCES "subgroup"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subgroup" ADD CONSTRAINT "FK_d5fb0a1cd28180456cbb65ddb35" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_audit" ADD CONSTRAINT "FK_cbcf47ce8f65b440c11aeecf915" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reset_token" ADD CONSTRAINT "FK_1d61419c157e5325204cbee7a28" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reset_token" DROP CONSTRAINT "FK_1d61419c157e5325204cbee7a28"`);
        await queryRunner.query(`ALTER TABLE "user_audit" DROP CONSTRAINT "FK_cbcf47ce8f65b440c11aeecf915"`);
        await queryRunner.query(`ALTER TABLE "subgroup" DROP CONSTRAINT "FK_d5fb0a1cd28180456cbb65ddb35"`);
        await queryRunner.query(`ALTER TABLE "person" DROP CONSTRAINT "FK_22a600d14b4e098156a2d21a331"`);
        await queryRunner.query(`DROP TABLE "reset_token"`);
        await queryRunner.query(`DROP TABLE "user_audit"`);
        await queryRunner.query(`DROP TABLE "group"`);
        await queryRunner.query(`DROP TABLE "subgroup"`);
        await queryRunner.query(`DROP TABLE "person"`);
    }

}
