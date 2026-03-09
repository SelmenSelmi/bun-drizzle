-- Migration: ensure questions reference a valid topic
-- 1) ensure a default 'General' topic exists
INSERT INTO `topics` (`id`,`name`) VALUES (1,'General') ON DUPLICATE KEY UPDATE `name`='General';

-- 2) set existing questions without a topic to 'General'
UPDATE `questions` SET `topic_id` = 1 WHERE `topic_id` = 0 OR `topic_id` IS NULL;

-- 3) make the column NOT NULL
ALTER TABLE `questions` MODIFY `topic_id` INT NOT NULL;

-- 4) add foreign key constraint
ALTER TABLE `questions` ADD CONSTRAINT `fk_questions_topic` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`);
