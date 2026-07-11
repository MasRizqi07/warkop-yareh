/*
  Warnings:

  - Made the column `snapshotName` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `snapshotPrice` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `snapshotTax` on table `order_items` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "community_groups" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "snapshotName" SET NOT NULL,
ALTER COLUMN "snapshotPrice" SET NOT NULL,
ALTER COLUMN "snapshotTax" SET NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3);
