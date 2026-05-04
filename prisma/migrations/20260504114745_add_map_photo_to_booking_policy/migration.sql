-- AlterTable
ALTER TABLE "BookingPolicyState" ADD COLUMN     "mapPhotoUrl" TEXT;

-- AlterTable
ALTER TABLE "Location" ALTER COLUMN "updatedAt" DROP DEFAULT;
