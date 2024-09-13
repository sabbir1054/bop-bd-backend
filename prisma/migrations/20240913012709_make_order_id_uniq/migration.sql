/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `order_payment_info` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "order_payment_info_orderId_key" ON "order_payment_info"("orderId");
