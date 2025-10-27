/*
  Warnings:

  - You are about to drop the column `is_disabled` on the `ProductVariant` table. All the data in the column will be lost.
  - Added the required column `image_urls` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ProductVariant` DROP COLUMN `is_disabled`,
    ADD COLUMN `image_urls` JSON NOT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `restored_at` DATETIME(3) NULL;
