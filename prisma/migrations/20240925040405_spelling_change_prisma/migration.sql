/*
  Warnings:

  - You are about to drop the column `totlaCommission` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "totlaCommission",
ADD COLUMN     "totalCommission" DOUBLE PRECISION NOT NULL DEFAULT 0;
