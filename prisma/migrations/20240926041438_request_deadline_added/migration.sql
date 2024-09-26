-- CreateEnum
CREATE TYPE "DeadlineExtendRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'CANCEL');

-- CreateTable
CREATE TABLE "extendDeadline_request" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "requestStatus" "DeadlineExtendRequestStatus" NOT NULL,

    CONSTRAINT "extendDeadline_request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "extendDeadline_request" ADD CONSTRAINT "extendDeadline_request_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
