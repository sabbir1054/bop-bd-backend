-- AlterTable
ALTER TABLE "deadline_payCommission" ADD COLUMN     "memberCategory" "MembershipCategory" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "deadlineExtendfor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isSuspend" BOOLEAN NOT NULL DEFAULT false;
