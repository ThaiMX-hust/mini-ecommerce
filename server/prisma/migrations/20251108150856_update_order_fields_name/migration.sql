/*
  Warnings:

  - You are about to drop the column `final_total_amount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `raw_total_amount` on the `Order` table. All the data in the column will be lost.
  - Added the required column `final_total_price` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `raw_total_price` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` DROP COLUMN `final_total_amount`,
    DROP COLUMN `raw_total_amount`,
    ADD COLUMN `final_total_price` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `raw_total_price` DECIMAL(12, 2) NOT NULL;
