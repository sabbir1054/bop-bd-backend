/*
  Warnings:

  - The values [NEW_MEMBER] on the enum `CommissionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CommissionType_new" AS ENUM ('NORMAL', 'REFFERED_MEMBER', 'SPECIAL_OFFER');
ALTER TABLE "commission" ALTER COLUMN "commissionType" TYPE "CommissionType_new" USING ("commissionType"::text::"CommissionType_new");
ALTER TYPE "CommissionType" RENAME TO "CommissionType_old";
ALTER TYPE "CommissionType_new" RENAME TO "CommissionType";
DROP TYPE "CommissionType_old";
COMMIT;
