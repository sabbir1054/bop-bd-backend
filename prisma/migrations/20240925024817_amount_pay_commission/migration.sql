-- DropIndex
DROP INDEX "payCommission_amount_key";

-- CreateTable
CREATE TABLE "deadline_payCommission" (
    "id" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deadline_payCommission_pkey" PRIMARY KEY ("id")
);
