/*
  Warnings:

  - A unique constraint covering the columns `[paymentID]` on the table `commissionTrnxToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "commissionTrnxToken_paymentID_key" ON "commissionTrnxToken"("paymentID");
