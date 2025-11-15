/*
  Warnings:

  - A unique constraint covering the columns `[order_status_code]` on the table `OrderStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `final_total_price` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `OrderStatus_order_status_code_key` ON `OrderStatus`(`order_status_code`);
