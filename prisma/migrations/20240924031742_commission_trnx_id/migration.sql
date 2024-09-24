-- CreateTable
CREATE TABLE "commissionTrnxToken" (
    "id" TEXT NOT NULL,
    "paymentID" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "commissionTrnxToken_pkey" PRIMARY KEY ("id")
);
