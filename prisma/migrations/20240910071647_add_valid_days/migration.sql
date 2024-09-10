-- CreateTable
CREATE TABLE "ValidityDays" (
    "id" TEXT NOT NULL,
    "validDays" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidityDays_pkey" PRIMARY KEY ("id")
);
