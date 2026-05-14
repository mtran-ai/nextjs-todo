-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "priority" "Priority" NOT NULL DEFAULT 'MEDIUM';
