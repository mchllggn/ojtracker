ALTER TABLE "User"
    ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "User"
    ADD COLUMN "emailVerificationOtpHash" TEXT NULL;

ALTER TABLE "User"
    ADD COLUMN "emailVerificationOtpExpiresAt" DATETIME NULL;

ALTER TABLE "User"
    ADD COLUMN "emailVerificationOtpResendAvailableAt" DATETIME NULL;
