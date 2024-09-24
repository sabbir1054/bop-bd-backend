/*
  Warnings:

  - You are about to drop the column `paymentMethodId` on the `payCommission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payCommission" DROP CONSTRAINT "payCommission_paymentMethodId_fkey";

-- AlterTable
ALTER TABLE "payCommission" DROP COLUMN "paymentMethodId";
