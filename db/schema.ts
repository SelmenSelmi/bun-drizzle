import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
});

export const questions = mysqlTable("questions", {
  id: int("id").primaryKey().autoincrement(),
  author_name: varchar("author_name", { length: 255 }),
  content: varchar("content", { length: 2000 }).notNull(),
});