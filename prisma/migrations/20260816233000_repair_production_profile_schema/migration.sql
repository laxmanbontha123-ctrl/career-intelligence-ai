-- Repair migration for production schema drift.
-- Safe to run when any/all of these objects already exist.

SET @db_name = DATABASE();

-- Add User.avatarDataUrl when missing.
SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'User'
        AND COLUMN_NAME = 'avatarDataUrl'
    ),
    'SELECT 1',
    'ALTER TABLE `User` ADD COLUMN `avatarDataUrl` LONGTEXT NULL'
  )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add LearnerProfile.contactPhone when missing.
SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'LearnerProfile'
        AND COLUMN_NAME = 'contactPhone'
    ),
    'SELECT 1',
    'ALTER TABLE `LearnerProfile` ADD COLUMN `contactPhone` VARCHAR(191) NULL'
  )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create UserSettings when missing.
SET @sql = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'UserSettings'
    ),
    'SELECT 1',
    'CREATE TABLE `UserSettings` (
      `id` INTEGER NOT NULL AUTO_INCREMENT,
      `userId` INTEGER NOT NULL,
      `timezone` VARCHAR(191) NOT NULL DEFAULT ''Asia/Kolkata'',
      `dailyGoalMinutes` INTEGER NOT NULL DEFAULT 60,
      `reminderEnabled` BOOLEAN NOT NULL DEFAULT true,
      `reminderTime` VARCHAR(191) NOT NULL DEFAULT ''19:00'',
      `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
      `weeklyProgressEmail` BOOLEAN NOT NULL DEFAULT true,
      `reducedMotion` BOOLEAN NOT NULL DEFAULT false,
      `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      `updatedAt` DATETIME(3) NOT NULL,
      UNIQUE INDEX `UserSettings_userId_key` (`userId`),
      PRIMARY KEY (`id`),
      CONSTRAINT `UserSettings_userId_fkey`
        FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
  )
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
