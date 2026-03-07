CREATE TABLE IF NOT EXISTS `questions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `author_name` varchar(255),
  `content` text NOT NULL,
  CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
