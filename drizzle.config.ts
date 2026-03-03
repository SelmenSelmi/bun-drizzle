import type { Config } from "drizzle-kit";
import fs from "fs";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    port: Number(process.env.DATABASE_PORT),
    ssl: {
      ca: fs.readFileSync("ca.pem").toString(), // <-- your Aiven CA certificate
      rejectUnauthorized: true,
    },
  },
} satisfies Config;