ALTER TABLE `User`
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `emailVerificationOtpHash` VARCHAR(191) NULL,
    ADD COLUMN `emailVerificationOtpExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `emailVerificationOtpResendAvailableAt` DATETIME(3) NULL;
