/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `orderOtp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "orderOtp_orderId_key" ON "orderOtp"("orderId");
