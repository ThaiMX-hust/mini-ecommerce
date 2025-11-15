/*
  Warnings:

  - You are about to alter the column `version` on the `ProductVariant` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `ProductVariant` MODIFY `version` INTEGER NOT NULL;
