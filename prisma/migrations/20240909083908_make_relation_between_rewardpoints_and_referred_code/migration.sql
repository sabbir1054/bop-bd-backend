/*
  Warnings:

  - You are about to drop the column `rewardPointsId` on the `refer_code` table. All the data in the column will be lost.
  - Added the required column `buyingRewardPointsId` to the `refer_code` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joiningRewardPointsId` to the `refer_code` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "refer_code" DROP CONSTRAINT "refer_code_rewardPointsId_fkey";

-- AlterTable
ALTER TABLE "refer_code" DROP COLUMN "rewardPointsId",
ADD COLUMN     "buyingRewardPointsId" TEXT NOT NULL,
ADD COLUMN     "joiningRewardPointsId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "refer_code" ADD CONSTRAINT "refer_code_joiningRewardPointsId_fkey" FOREIGN KEY ("joiningRewardPointsId") REFERENCES "reward_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refer_code" ADD CONSTRAINT "refer_code_buyingRewardPointsId_fkey" FOREIGN KEY ("buyingRewardPointsId") REFERENCES "reward_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
