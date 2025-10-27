/*
  Warnings:

  - You are about to drop the column `product_id` on the `CartItems` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the column `raw_price` on the `product` table. All the data in the column will be lost.
  - Added the required column `product_variant_id` to the `OrderItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CartItems` DROP FOREIGN KEY `CartItems_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItems` DROP FOREIGN KEY `OrderItems_product_id_fkey`;

-- DropIndex
DROP INDEX `CartItems_product_id_fkey` ON `CartItems`;

-- DropIndex
DROP INDEX `OrderItems_product_id_fkey` ON `OrderItems`;

-- AlterTable
ALTER TABLE `CartItems` DROP COLUMN `product_id`,
    ADD COLUMN `product_variant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `OrderItems` DROP COLUMN `product_id`,
    ADD COLUMN `product_variant_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `raw_price`;

-- CreateTable
CREATE TABLE `ProductOption` (
    `product_option_id` VARCHAR(191) NOT NULL,
    `option_name` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`product_option_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductOptionValue` (
    `option_value_id` VARCHAR(191) NOT NULL,
    `product_option_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`option_value_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `product_variant_id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `raw_price` DECIMAL(12, 2) NOT NULL,
    `stock_quantity` INTEGER NOT NULL,
    `is_disabled` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductVariant_sku_key`(`sku`),
    PRIMARY KEY (`product_variant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariantOption` (
    `product_variant_id` VARCHAR(191) NOT NULL,
    `option_value_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`product_variant_id`, `option_value_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CartItems` ADD CONSTRAINT `CartItems_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `ProductVariant`(`product_variant_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItems` ADD CONSTRAINT `OrderItems_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `ProductVariant`(`product_variant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOption` ADD CONSTRAINT `ProductOption_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOptionValue` ADD CONSTRAINT `ProductOptionValue_product_option_id_fkey` FOREIGN KEY (`product_option_id`) REFERENCES `ProductOption`(`product_option_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantOption` ADD CONSTRAINT `ProductVariantOption_option_value_id_fkey` FOREIGN KEY (`option_value_id`) REFERENCES `ProductOptionValue`(`option_value_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariantOption` ADD CONSTRAINT `ProductVariantOption_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `ProductVariant`(`product_variant_id`) ON DELETE CASCADE ON UPDATE CASCADE;
