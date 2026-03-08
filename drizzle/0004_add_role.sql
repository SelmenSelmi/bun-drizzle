-- Add role column to users; default to 'user' for existing rows
ALTER TABLE `users` ADD COLUMN `role` varchar(50) NOT NULL DEFAULT 'user';
UPDATE users
SET role = 'admin'
WHERE email = 'selmenselmi5@gmail.com';