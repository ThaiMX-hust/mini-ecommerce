/*
  Warnings:

  - Added the required column `promotion_metadata` to the `ProductPromotions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Adjustment` MODIFY `value_type` ENUM('FLASH_SALE', 'SET_PRICE', 'PERCENTAGE', 'FIXED', 'QUANTITY_DISCOUNT', 'BUY_X_GET_Y') NOT NULL;

-- AlterTable
ALTER TABLE `ProductPromotions` ADD COLUMN `promotion_metadata` JSON NOT NULL,
    MODIFY `promotion_description` VARCHAR(191) NULL,
    MODIFY `promotion_type` ENUM('FLASH_SALE', 'SET_PRICE', 'PERCENTAGE', 'FIXED', 'QUANTITY_DISCOUNT', 'BUY_X_GET_Y') NOT NULL;
