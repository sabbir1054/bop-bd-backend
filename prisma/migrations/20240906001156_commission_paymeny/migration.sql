-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('NORMAL', 'NEW_MEMBER', 'SPECIAL_OFFER');

-- CreateEnum
CREATE TYPE "OrderPaymentCategory" AS ENUM ('MOBILE_BANKING', 'BANK_TRANSACTION', 'CASH_ON_DELIVERY');

-- CreateEnum
CREATE TYPE "RewardPointsType" AS ENUM ('JOINING', 'BUYING');

-- CreateTable
CREATE TABLE "commission" (
    "id" TEXT NOT NULL,
    "commisionType" "CommissionType" NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "new_mem_validity" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refer_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "commissionId" TEXT NOT NULL,
    "codeOwnerorganizationId" TEXT NOT NULL,
    "codeUsedorganizationId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refer_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_systems_options" (
    "id" TEXT NOT NULL,
    "paymentCategory" "OrderPaymentCategory" NOT NULL,
    "methodName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_systems_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_payment_info" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentSystemOptionsId" TEXT NOT NULL,

    CONSTRAINT "order_payment_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_commission_history" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_commission_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_points" (
    "id" TEXT NOT NULL,
    "rewardType" "RewardPointsType" NOT NULL,
    "points" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_rewad_points_history" (
    "id" TEXT NOT NULL,
    "rewardPointsId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "organizationId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_rewad_points_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commission_commisionType_key" ON "commission"("commisionType");

-- CreateIndex
CREATE UNIQUE INDEX "refer_code_code_key" ON "refer_code"("code");

-- AddForeignKey
ALTER TABLE "refer_code" ADD CONSTRAINT "refer_code_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "commission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refer_code" ADD CONSTRAINT "refer_code_codeOwnerorganizationId_fkey" FOREIGN KEY ("codeOwnerorganizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refer_code" ADD CONSTRAINT "refer_code_codeUsedorganizationId_fkey" FOREIGN KEY ("codeUsedorganizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_systems_options" ADD CONSTRAINT "payment_systems_options_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_payment_info" ADD CONSTRAINT "order_payment_info_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_payment_info" ADD CONSTRAINT "order_payment_info_paymentSystemOptionsId_fkey" FOREIGN KEY ("paymentSystemOptionsId") REFERENCES "payment_systems_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_commission_history" ADD CONSTRAINT "order_commission_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_rewad_points_history" ADD CONSTRAINT "organization_rewad_points_history_rewardPointsId_fkey" FOREIGN KEY ("rewardPointsId") REFERENCES "reward_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_rewad_points_history" ADD CONSTRAINT "organization_rewad_points_history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
