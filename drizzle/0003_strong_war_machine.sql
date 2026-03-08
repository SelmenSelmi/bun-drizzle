CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`author_name` varchar(255),
	`content` varchar(2000) NOT NULL,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `role` varchar(50) NOT NULL;