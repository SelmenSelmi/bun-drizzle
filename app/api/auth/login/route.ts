import { pool } from "../../../../db/index";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email and password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [rows] = await pool.query("SELECT `id`, `password`, `name` FROM `users` WHERE `email` = ?", [
      email,
    ]);

    // rows may be an array-like from mysql2
    const user = Array.isArray(rows) && rows.length > 0 ? (rows as any)[0] : null;

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const valid = await bcrypt.compare(password, user.password || "");
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Authentication successful — return basic user info. In a real app set a secure cookie or issue a JWT.
    return new Response(JSON.stringify({ ok: true, user: { id: user.id, name: user.name, email } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    const message = (err as any)?.message ?? String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
