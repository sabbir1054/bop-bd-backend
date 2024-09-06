/*
  Warnings:

  - You are about to drop the column `userId` on the `cart` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cart" DROP CONSTRAINT "cart_userId_fkey";

-- AlterTable
ALTER TABLE "cart" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "isNidVerified" SET DEFAULT false;
