/*
  Warnings:

  - Added the required column `totalWithDeliveryCharge` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryCharge" DOUBLE PRECISION,
ADD COLUMN     "totalWithDeliveryCharge" DOUBLE PRECISION NOT NULL;
