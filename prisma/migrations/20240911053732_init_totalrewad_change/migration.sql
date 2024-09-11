/*
  Warnings:

  - Made the column `totalRewardPoints` on table `organizations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
UPDATE "organizations" SET "totalRewardPoints" = 0 WHERE "totalRewardPoints" IS NULL;
ALTER TABLE "organizations" ALTER COLUMN "totalRewardPoints" SET NOT NULL,
ALTER COLUMN "totalRewardPoints" SET DEFAULT 0;
