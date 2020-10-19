import { MigrationInterface, QueryRunner } from "typeorm";

export class restrictSignups1603132068670 implements MigrationInterface {
    name = "restrictSignups1603132068670";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `photo` DROP FOREIGN KEY `FK_4494006ff358f754d07df5ccc87`",
        );
        await queryRunner.query(
            "CREATE TABLE `config` (`key` varchar(255) NOT NULL, `value` varchar(255) NOT NULL, PRIMARY KEY (`key`)) ENGINE=InnoDB",
        );
        await queryRunner.query(
            "ALTER TABLE `user` ADD `isAdmin` tinyint NOT NULL DEFAULT 0",
        );
        await queryRunner.query(
            "ALTER TABLE `photo` ADD CONSTRAINT `FK_4494006ff358f754d07df5ccc87` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION",
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE `photo` DROP FOREIGN KEY `FK_4494006ff358f754d07df5ccc87`",
        );
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `isAdmin`");
        await queryRunner.query("DROP TABLE `config`");
        await queryRunner.query(
            "ALTER TABLE `photo` ADD CONSTRAINT `FK_4494006ff358f754d07df5ccc87` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION",
        );
    }
}
