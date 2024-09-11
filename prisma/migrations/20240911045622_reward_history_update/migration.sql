/*
  Warnings:

  - Added the required column `pointHistoryType` to the `organization_rewad_points_history` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrgaRewardPointHistoryType" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "organization_rewad_points_history" ADD COLUMN     "pointHistoryType" "OrgaRewardPointHistoryType" NOT NULL;
