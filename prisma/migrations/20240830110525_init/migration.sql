/*
  Warnings:

  - You are about to drop the column `userId` on the `feedbacks` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `shop_name` on the `users` table. All the data in the column will be lost.
  - Added the required column `isNidVerified` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_userId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customerId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_product_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_ownerId_fkey";

-- AlterTable
ALTER TABLE "cart" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "feedbacks" DROP COLUMN "userId",
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "ownerId",
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "shop_name",
ADD COLUMN     "isNidVerified" BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_seller_id_fkey" FOREIGN KEY ("product_seller_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
