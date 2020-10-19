import {MigrationInterface, QueryRunner} from "typeorm";

export class init1603126879697 implements MigrationInterface {
    name = 'init1603126879697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `username` varchar(190) NOT NULL, `email` varchar(190) NOT NULL, `passwordHash` varchar(190) NOT NULL, UNIQUE INDEX `IDX_78a916df40e02a9deb1c4b75ed` (`username`), UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `photo` (`id` int NOT NULL AUTO_INCREMENT, `hash` varchar(190) NOT NULL, `size` varchar(190) NOT NULL, `format` varchar(190) NOT NULL, `uploaded` tinyint NOT NULL DEFAULT 0, `generatedThumbs` set ('512', '1024', '2048') NOT NULL DEFAULT '', `accessToken` varchar(500) NOT NULL, `accessTokenExpiry` timestamp NULL DEFAULT NULL, `shotAt` timestamp NULL DEFAULT NULL, `createdAt` timestamp NULL DEFAULT NULL, `editedAt` timestamp NULL DEFAULT NULL, `userId` int NULL, INDEX `IDX_43d1a6df29f544bdc57ab4cdc6` (`hash`), UNIQUE INDEX `IDX_491fe52f7ce0f0696fc0b70e7f` (`hash`, `size`, `userId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `photo` ADD CONSTRAINT `FK_4494006ff358f754d07df5ccc87` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `photo` DROP FOREIGN KEY `FK_4494006ff358f754d07df5ccc87`");
        await queryRunner.query("DROP INDEX `IDX_491fe52f7ce0f0696fc0b70e7f` ON `photo`");
        await queryRunner.query("DROP INDEX `IDX_43d1a6df29f544bdc57ab4cdc6` ON `photo`");
        await queryRunner.query("DROP TABLE `photo`");
        await queryRunner.query("DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`");
        await queryRunner.query("DROP INDEX `IDX_78a916df40e02a9deb1c4b75ed` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
    }

}
