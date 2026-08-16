-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatarDataUrl` LONGTEXT NULL;

-- CreateTable
CREATE TABLE `UserSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    `dailyGoalMinutes` INTEGER NOT NULL DEFAULT 60,
    `reminderEnabled` BOOLEAN NOT NULL DEFAULT true,
    `reminderTime` VARCHAR(191) NOT NULL DEFAULT '19:00',
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `weeklyProgressEmail` BOOLEAN NOT NULL DEFAULT true,
    `reducedMotion` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserSettings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
