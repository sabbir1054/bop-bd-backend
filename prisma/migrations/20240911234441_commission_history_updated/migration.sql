/*
  Warnings:

  - Added the required column `commissionId` to the `order_commission_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_commission_history" ADD COLUMN     "commissionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "order_commission_history" ADD CONSTRAINT "order_commission_history_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "commission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
