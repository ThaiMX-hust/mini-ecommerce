/*
  Warnings:

  - Added the required column `promotion_metadata` to the `ProductPromotions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ProductPromotions` DROP FOREIGN KEY `ProductPromotions_product_id_fkey`;

-- AlterTable
ALTER TABLE `Adjustment` MODIFY `value_type` ENUM('FLASH_SALE', 'SET_PRICE', 'PERCENTAGE', 'FIXED', 'QUANTITY_DISCOUNT', 'BUY_X_GET_Y') NOT NULL;

-- AlterTable
ALTER TABLE `ProductPromotions` ADD COLUMN `promotion_metadata` JSON NOT NULL,
    MODIFY `promotion_description` VARCHAR(191) NULL,
    MODIFY `promotion_type` ENUM('FLASH_SALE', 'SET_PRICE', 'PERCENTAGE', 'FIXED', 'QUANTITY_DISCOUNT', 'BUY_X_GET_Y') NOT NULL;

-- AddForeignKey
ALTER TABLE `ProductPromotions` ADD CONSTRAINT `ProductPromotions_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
