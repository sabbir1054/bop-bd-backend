/*
  Warnings:

  - You are about to drop the `ValidityDays` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ValidityDays";

-- CreateTable
CREATE TABLE "validDays" (
    "id" TEXT NOT NULL,
    "validDays" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validDays_pkey" PRIMARY KEY ("id")
);
