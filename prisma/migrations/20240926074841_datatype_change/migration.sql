-- AlterTable
ALTER TABLE "organization_rewad_points_history" ALTER COLUMN "points" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "totalRewardPoints" SET DEFAULT 0,
ALTER COLUMN "totalRewardPoints" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "reward_points" ALTER COLUMN "points" SET DEFAULT 0,
ALTER COLUMN "points" SET DATA TYPE DOUBLE PRECISION;
