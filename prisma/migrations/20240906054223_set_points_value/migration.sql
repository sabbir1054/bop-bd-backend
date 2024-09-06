/*
  Warnings:

  - You are about to drop the column `memberCategory` on the `users` table. All the data in the column will be lost.
  - Added the required column `membershipCategory` to the `commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipCategory` to the `reward_points` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MembershipCategory" AS ENUM ('DIAMOND', 'GOLD', 'SILVER', 'PLATINUM', 'NORMAL');

-- AlterTable
ALTER TABLE "commission" ADD COLUMN     "membershipCategory" "MembershipCategory" NOT NULL;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "memberShipCategory" "MembershipCategory" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "reward_points" ADD COLUMN     "membershipCategory" "MembershipCategory" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "memberCategory";

-- DropEnum
DROP TYPE "MemberCategory";

-- CreateTable
CREATE TABLE "pointsValue" (
    "id" TEXT NOT NULL,
    "perPointsTk" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pointsValue_pkey" PRIMARY KEY ("id")
);
