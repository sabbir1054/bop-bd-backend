-- CreateTable
CREATE TABLE "used_refferCode" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refferedCodeId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "used_refferCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "used_refferCode" ADD CONSTRAINT "used_refferCode_refferedCodeId_fkey" FOREIGN KEY ("refferedCodeId") REFERENCES "refer_code"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "used_refferCode" ADD CONSTRAINT "used_refferCode_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
