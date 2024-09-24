/*
  Warnings:

  - You are about to drop the column `adjustReward` on the `payCommission` table. All the data in the column will be lost.
  - You are about to drop the column `amountPay` on the `payCommission` table. All the data in the column will be lost.
  - You are about to drop the column `totalPayable` on the `payCommission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[amount]` on the table `payCommission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payCommission_amountPay_key";

-- AlterTable
ALTER TABLE "payCommission" DROP COLUMN "adjustReward",
DROP COLUMN "amountPay",
DROP COLUMN "totalPayable",
ADD COLUMN     "amount" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "payCommission_amount_key" ON "payCommission"("amount");
