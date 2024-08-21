-- CreateTable
CREATE TABLE "orderOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "countSend" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orderOtp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orderOtp" ADD CONSTRAINT "orderOtp_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
