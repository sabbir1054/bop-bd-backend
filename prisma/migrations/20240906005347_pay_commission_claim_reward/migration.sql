-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "totalRewardPoints" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "payCommission" (
    "id" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "payForOrderId" TEXT NOT NULL,
    "totalPayable" DOUBLE PRECISION NOT NULL,
    "adjustReward" DOUBLE PRECISION NOT NULL,
    "amountPay" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claime_reward" (
    "id" TEXT NOT NULL,
    "claimedAmount" DOUBLE PRECISION NOT NULL,
    "organizationId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claime_reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payCommission_transactionId_key" ON "payCommission"("transactionId");

-- AddForeignKey
ALTER TABLE "payCommission" ADD CONSTRAINT "payCommission_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_systems_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payCommission" ADD CONSTRAINT "payCommission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payCommission" ADD CONSTRAINT "payCommission_payForOrderId_fkey" FOREIGN KEY ("payForOrderId") REFERENCES "order_commission_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claime_reward" ADD CONSTRAINT "claime_reward_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
