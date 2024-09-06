/*
  Warnings:

  - You are about to drop the column `new_mem_validity` on the `commission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "commission" DROP COLUMN "new_mem_validity",
ADD COLUMN     "ref_mem_validity" INTEGER;
