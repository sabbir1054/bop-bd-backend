/*
  Warnings:

  - Added the required column `validDays` to the `reward_points` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reward_points" ADD COLUMN     "validDays" INTEGER NOT NULL;
