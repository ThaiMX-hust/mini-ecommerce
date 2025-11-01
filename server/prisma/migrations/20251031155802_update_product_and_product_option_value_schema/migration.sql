/*
  Warnings:

  - You are about to drop the column `stock_quantity` on the `product` table. All the data in the column will be lost.
  - Added the required column `value` to the `ProductOptionValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ProductOptionValue` ADD COLUMN `value` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `stock_quantity`;
