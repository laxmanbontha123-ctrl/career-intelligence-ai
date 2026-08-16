-- CreateTable
CREATE TABLE `Opportunity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'INTERNSHIP',
    `description` TEXT NOT NULL,
    `location` VARCHAR(191) NULL,
    `workMode` VARCHAR(191) NULL,
    `applicationUrl` TEXT NULL,
    `deadline` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Opportunity_active_idx`(`active`),
    INDEX `Opportunity_type_idx`(`type`),
    INDEX `Opportunity_deadline_idx`(`deadline`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpportunitySkill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opportunityId` INTEGER NOT NULL,
    `skillName` VARCHAR(191) NOT NULL,
    `requiredLevel` INTEGER NOT NULL DEFAULT 1,

    INDEX `OpportunitySkill_skillName_idx`(`skillName`),
    UNIQUE INDEX `OpportunitySkill_opportunityId_skillName_key`(`opportunityId`, `skillName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedOpportunity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `opportunityId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SavedOpportunity_userId_createdAt_idx`(`userId`, `createdAt`),
    UNIQUE INDEX `SavedOpportunity_userId_opportunityId_key`(`userId`, `opportunityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OpportunitySkill` ADD CONSTRAINT `OpportunitySkill_opportunityId_fkey` FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedOpportunity` ADD CONSTRAINT `SavedOpportunity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedOpportunity` ADD CONSTRAINT `SavedOpportunity_opportunityId_fkey` FOREIGN KEY (`opportunityId`) REFERENCES `Opportunity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
