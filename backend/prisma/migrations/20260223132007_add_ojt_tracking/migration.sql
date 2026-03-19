-- CreateTable
CREATE TABLE `OjtTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `totalHours` DOUBLE NOT NULL,
    `dutyHoursPerDay` DOUBLE NOT NULL,
    `submissionHours` DOUBLE NOT NULL DEFAULT 0,
    `totalDays` INTEGER NOT NULL,
    `completedHours` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OjtTracking_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DutyLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ojtTrackingId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hoursWorked` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OjtTracking` ADD CONSTRAINT `OjtTracking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DutyLog` ADD CONSTRAINT `DutyLog_ojtTrackingId_fkey` FOREIGN KEY (`ojtTrackingId`) REFERENCES `OjtTracking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
