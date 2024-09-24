/*
  Warnings:

  - You are about to drop the column `payerAccount` on the `transactionInfoForCommissionPay` table. All the data in the column will be lost.
  - You are about to drop the column `payerType` on the `transactionInfoForCommissionPay` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactionInfoForCommissionPay" DROP COLUMN "payerAccount",
DROP COLUMN "payerType";
