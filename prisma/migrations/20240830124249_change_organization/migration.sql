/*
  Warnings:

  - You are about to drop the column `businessTypeId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_businessTypeId_fkey";

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "businessTypeId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "businessTypeId";

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "business_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
