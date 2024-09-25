/*
  Warnings:

  - You are about to drop the column `assignedbyStaffId` on the `assigned_for_delivery` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "assigned_for_delivery" DROP CONSTRAINT "assigned_for_delivery_assignedbyStaffId_fkey";

-- AlterTable
ALTER TABLE "assigned_for_delivery" DROP COLUMN "assignedbyStaffId";
