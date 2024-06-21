/*
  Warnings:

  - Added the required column `shipping_address` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_address" TEXT NOT NULL;
