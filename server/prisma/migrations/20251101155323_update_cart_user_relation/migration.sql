/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Cart` DROP FOREIGN KEY `Cart_user_id_fkey`;

-- DropIndex
DROP INDEX `Cart_user_id_fkey` ON `Cart`;

-- CreateIndex
CREATE UNIQUE INDEX `Cart_user_id_key` ON `Cart`(`user_id`);

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
