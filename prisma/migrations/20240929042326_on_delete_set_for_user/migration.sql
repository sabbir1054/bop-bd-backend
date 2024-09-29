-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "staff" DROP CONSTRAINT "staff_staffInfoId_fkey";

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_staffInfoId_fkey" FOREIGN KEY ("staffInfoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
