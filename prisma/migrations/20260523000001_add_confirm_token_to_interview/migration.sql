-- AlterTable: Add ConfirmToken to Interview for UC-06 (public confirm/decline via email link)
ALTER TABLE "Interview" ADD COLUMN "ConfirmToken" VARCHAR(128);
CREATE UNIQUE INDEX "Interview_ConfirmToken_key" ON "Interview"("ConfirmToken");
