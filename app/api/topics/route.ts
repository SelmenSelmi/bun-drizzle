import { pool } from "../../../db/index";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT `id`, `name` FROM `topics` ORDER BY `id` ASC");
    return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch topics" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role } = body;
    if (!name) {
      return new Response(JSON.stringify({ error: "name required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Basic role check: only allow if role === 'admin'
    if (role !== "admin") {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    await pool.query("INSERT INTO `topics` (`name`) VALUES (?)", [name]);

    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to save topic" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
