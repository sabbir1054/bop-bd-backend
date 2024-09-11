/*
  Warnings:

  - You are about to alter the column `totalRewardPoints` on the `organizations` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "totalRewardPoints" SET DATA TYPE INTEGER;
