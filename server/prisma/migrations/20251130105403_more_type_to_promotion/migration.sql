-- AlterTable
ALTER TABLE `Adjustment` MODIFY `value_type` ENUM('FLASH_SALE', 'SET_PRICE', 'PERCENTAGE', 'FIXED') NOT NULL;

-- AlterTable
ALTER TABLE `ProductPromotions` MODIFY `promotion_type` ENUM('FLASH_SALE', 'SET_PRICE', 'PERCENTAGE', 'FIXED') NOT NULL;
