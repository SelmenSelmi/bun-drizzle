import { db, pool } from "../../../db/index";
import { users } from "../../../db/schema";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "name, email and password required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return new Response(
        JSON.stringify({ error: "password must be at least 8 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password before storing
    const hashed = await bcrypt.hash(password, 10);

    // Use a direct parametrized query to avoid sending `DEFAULT` for `id`.
    await pool.query(
      "INSERT INTO `users` (`name`, `email`, `password`) VALUES (?, ?, ?)",
      [name, email, hashed]
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // Log full error server-side for debugging
    // eslint-disable-next-line no-console
    console.error(err);
    const message = (err as any)?.message ?? String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
