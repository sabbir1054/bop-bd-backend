/*
  Warnings:

  - Added the required column `comment` to the `extendDeadline_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "extendDeadline_request" ADD COLUMN     "comment" TEXT NOT NULL;
