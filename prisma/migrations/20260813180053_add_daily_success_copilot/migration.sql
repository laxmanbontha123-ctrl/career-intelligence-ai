-- CreateTable
CREATE TABLE `DailyMission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `dateKey` VARCHAR(10) NOT NULL,
    `missionKey` VARCHAR(120) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `actionUrl` VARCHAR(191) NULL,
    `priority` INTEGER NOT NULL DEFAULT 2,
    `estimatedMinutes` INTEGER NOT NULL DEFAULT 20,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DailyMission_userId_dateKey_idx`(`userId`, `dateKey`),
    INDEX `DailyMission_userId_completed_idx`(`userId`, `completed`),
    UNIQUE INDEX `DailyMission_userId_dateKey_missionKey_key`(`userId`, `dateKey`, `missionKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyCheckIn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `dateKey` VARCHAR(10) NOT NULL,
    `availableMinutes` INTEGER NOT NULL DEFAULT 60,
    `energyLevel` INTEGER NOT NULL DEFAULT 3,
    `focusNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DailyCheckIn_userId_dateKey_idx`(`userId`, `dateKey`),
    UNIQUE INDEX `DailyCheckIn_userId_dateKey_key`(`userId`, `dateKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DailyMission` ADD CONSTRAINT `DailyMission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyCheckIn` ADD CONSTRAINT `DailyCheckIn_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
