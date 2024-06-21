-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_businessTypeId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "businessTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "business_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
