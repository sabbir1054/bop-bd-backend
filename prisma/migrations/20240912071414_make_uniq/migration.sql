/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `used_refferCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "used_refferCode_organizationId_key" ON "used_refferCode"("organizationId");
