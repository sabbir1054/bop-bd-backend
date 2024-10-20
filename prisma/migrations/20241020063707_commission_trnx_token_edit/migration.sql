-- CreateEnum
CREATE TYPE "CashDeductionType" AS ENUM ('FULL', 'PARTIAL');

-- AlterTable
ALTER TABLE "commissionTrnxToken" ADD COLUMN     "cashDeductionType" "CashDeductionType" NOT NULL DEFAULT 'FULL';
