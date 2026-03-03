import { db, pool } from "../../../db/index";
import { users } from "../../../db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "name and email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Use a direct parametrized query to avoid sending `DEFAULT` for `id`.
    await pool.query("INSERT INTO `users` (`name`, `email`) VALUES (?, ?)", [
      name,
      email,
    ]);

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
