/*
  Warnings:

  - You are about to drop the column `codeUsedorganizationId` on the `refer_code` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "refer_code" DROP CONSTRAINT "refer_code_codeUsedorganizationId_fkey";

-- AlterTable
ALTER TABLE "refer_code" DROP COLUMN "codeUsedorganizationId";
