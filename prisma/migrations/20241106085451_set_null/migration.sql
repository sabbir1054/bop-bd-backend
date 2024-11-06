-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "deliveryCharge" DROP NOT NULL,
ALTER COLUMN "deliveryCharge" DROP DEFAULT;
