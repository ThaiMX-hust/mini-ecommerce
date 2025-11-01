/*
  Warnings:

  - Added the required column `is_disabled` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ProductVariant` ADD COLUMN `is_disabled` BOOLEAN NOT NULL;
