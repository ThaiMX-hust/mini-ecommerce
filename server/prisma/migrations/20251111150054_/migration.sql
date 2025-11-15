/*
  Warnings:

  - A unique constraint covering the columns `[cart_id]` on the table `Adjustment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cart_id` to the `Adjustment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Adjustment` ADD COLUMN `cart_id` VARCHAR(191) NOT NULL,
    MODIFY `order_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Adjustment_cart_id_key` ON `Adjustment`(`cart_id`);

-- AddForeignKey
ALTER TABLE `Adjustment` ADD CONSTRAINT `Adjustment_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `Cart`(`cart_id`) ON DELETE CASCADE ON UPDATE CASCADE;
