/*
  Warnings:

  - Made the column `deliveryCharge` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "deliveryCharge" SET NOT NULL,
ALTER COLUMN "deliveryCharge" SET DEFAULT 0;
