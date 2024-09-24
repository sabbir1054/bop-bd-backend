/*
  Warnings:

  - Added the required column `commissionPayType` to the `payCommission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommissionPayType" AS ENUM ('CASH', 'REWARD_POINTS');

-- AlterTable
ALTER TABLE "payCommission" ADD COLUMN     "commissionPayType" "CommissionPayType" NOT NULL;
