/*
  Warnings:

  - You are about to drop the column `isPaid` on the `order_commission_history` table. All the data in the column will be lost.
  - You are about to drop the column `payForOrderId` on the `payCommission` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `payCommission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[amountPay]` on the table `payCommission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "payCommission" DROP CONSTRAINT "payCommission_payForOrderId_fkey";

-- DropIndex
DROP INDEX "payCommission_transactionId_key";

-- AlterTable
ALTER TABLE "order_commission_history" DROP COLUMN "isPaid";

-- AlterTable
ALTER TABLE "payCommission" DROP COLUMN "payForOrderId",
DROP COLUMN "transactionId";

-- CreateTable
CREATE TABLE "transactionInfoForCommissionPay" (
    "id" TEXT NOT NULL,
    "paymentID" TEXT NOT NULL,
    "trxID" TEXT NOT NULL,
    "transactionStatus" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "paymentExecuteTime" TIMESTAMP(3) NOT NULL,
    "merchantInvoiceNumber" TEXT NOT NULL,
    "payerType" TEXT NOT NULL,
    "payerReference" TEXT NOT NULL,
    "customerMsisdn" TEXT NOT NULL,
    "payerAccount" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "statusMessage" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payCommissionId" TEXT NOT NULL,

    CONSTRAINT "transactionInfoForCommissionPay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactionInfoForCommissionPay_paymentID_key" ON "transactionInfoForCommissionPay"("paymentID");

-- CreateIndex
CREATE UNIQUE INDEX "transactionInfoForCommissionPay_trxID_key" ON "transactionInfoForCommissionPay"("trxID");

-- CreateIndex
CREATE UNIQUE INDEX "payCommission_amountPay_key" ON "payCommission"("amountPay");

-- AddForeignKey
ALTER TABLE "transactionInfoForCommissionPay" ADD CONSTRAINT "transactionInfoForCommissionPay_payCommissionId_fkey" FOREIGN KEY ("payCommissionId") REFERENCES "payCommission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
