/*
  Warnings:

  - The values [NORMAL_STAFF] on the enum `StaffRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StaffRole_new" AS ENUM ('ORDER_SUPERVISOR', 'ADMIN', 'STORE_MANAGER', 'DELIVERY_BOY', 'ACCOUNTS_MANAGER', 'PURCHASE_OFFICER');
ALTER TABLE "staff" ALTER COLUMN "role" TYPE "StaffRole_new" USING ("role"::text::"StaffRole_new");
ALTER TYPE "StaffRole" RENAME TO "StaffRole_old";
ALTER TYPE "StaffRole_new" RENAME TO "StaffRole";
DROP TYPE "StaffRole_old";
COMMIT;
