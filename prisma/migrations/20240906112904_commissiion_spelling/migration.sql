/*
  Warnings:

  - You are about to drop the column `commisionType` on the `commission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commissionType]` on the table `commission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commissionType` to the `commission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "commission_commisionType_key";

-- AlterTable
ALTER TABLE "commission" DROP COLUMN "commisionType",
ADD COLUMN     "commissionType" "CommissionType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "commission_commissionType_key" ON "commission"("commissionType");
