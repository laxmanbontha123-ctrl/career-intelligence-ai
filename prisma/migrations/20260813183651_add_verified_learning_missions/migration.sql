-- AlterTable
ALTER TABLE `DailyMission` ADD COLUMN `bestScore` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `requiredScore` INTEGER NOT NULL DEFAULT 80,
    ADD COLUMN `startedAt` DATETIME(3) NULL,
    ADD COLUMN `verificationMode` VARCHAR(191) NOT NULL DEFAULT 'LEARNING_QUIZ',
    ADD COLUMN `verifiedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `MissionLearningContent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `missionId` INTEGER NOT NULL,
    `lessonTitle` VARCHAR(191) NOT NULL,
    `objectivesJson` TEXT NOT NULL,
    `lessonMarkdown` LONGTEXT NOT NULL,
    `practiceMarkdown` LONGTEXT NOT NULL,
    `quizJson` LONGTEXT NOT NULL,
    `sourcesJson` LONGTEXT NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MissionLearningContent_missionId_key`(`missionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MissionAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `missionId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `answersJson` LONGTEXT NOT NULL,
    `score` INTEGER NOT NULL,
    `passed` BOOLEAN NOT NULL DEFAULT false,
    `feedback` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MissionAttempt_missionId_createdAt_idx`(`missionId`, `createdAt`),
    INDEX `MissionAttempt_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MissionLearningContent` ADD CONSTRAINT `MissionLearningContent_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `DailyMission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MissionAttempt` ADD CONSTRAINT `MissionAttempt_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `DailyMission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MissionAttempt` ADD CONSTRAINT `MissionAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
