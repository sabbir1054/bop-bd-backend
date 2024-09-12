/*
  Warnings:

  - Added the required column `sellingRewardPointsId` to the `refer_code` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refer_code" ADD COLUMN     "sellingRewardPointsId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "refer_code" ADD CONSTRAINT "refer_code_sellingRewardPointsId_fkey" FOREIGN KEY ("sellingRewardPointsId") REFERENCES "reward_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
