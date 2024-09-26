/*
  Warnings:

  - A unique constraint covering the columns `[memberCategory]` on the table `deadline_payCommission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "deadline_payCommission_memberCategory_key" ON "deadline_payCommission"("memberCategory");
