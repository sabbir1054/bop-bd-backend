/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `assigned_for_delivery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "assigned_for_delivery_orderId_key" ON "assigned_for_delivery"("orderId");
