-- CreateTable
CREATE TABLE `ResumeAnalysis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `resumeText` LONGTEXT NOT NULL,
    `atsScore` INTEGER NOT NULL,
    `matchedKeywords` TEXT NOT NULL,
    `missingKeywords` TEXT NOT NULL,
    `strengths` TEXT NOT NULL,
    `suggestions` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ResumeAnalysis_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResumeAnalysis` ADD CONSTRAINT `ResumeAnalysis_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
