-- CreateTable
CREATE TABLE "MapLocationDraft" (
    "id" TEXT NOT NULL,
    "positionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapLocationDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MapLocationDraft_createdAt_idx" ON "MapLocationDraft"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MapLocationDraft_positionNumber_key" ON "MapLocationDraft"("positionNumber");
