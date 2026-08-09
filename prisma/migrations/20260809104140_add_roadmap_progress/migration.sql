-- CreateTable
CREATE TABLE `RoadmapProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `taskKey` VARCHAR(191) NOT NULL,
    `skill` VARCHAR(191) NOT NULL,
    `phase` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RoadmapProgress_userId_idx`(`userId`),
    UNIQUE INDEX `RoadmapProgress_userId_taskKey_key`(`userId`, `taskKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoadmapProgress` ADD CONSTRAINT `RoadmapProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
