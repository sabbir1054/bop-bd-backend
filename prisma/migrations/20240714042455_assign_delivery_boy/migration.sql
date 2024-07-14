-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "deliveryArea" TEXT;

-- CreateTable
CREATE TABLE "assigned_for_delivery" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedbyStaffId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "deliveryBoyId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "assigned_for_delivery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "assigned_for_delivery" ADD CONSTRAINT "assigned_for_delivery_assignedbyStaffId_fkey" FOREIGN KEY ("assignedbyStaffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_for_delivery" ADD CONSTRAINT "assigned_for_delivery_deliveryBoyId_fkey" FOREIGN KEY ("deliveryBoyId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_for_delivery" ADD CONSTRAINT "assigned_for_delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
