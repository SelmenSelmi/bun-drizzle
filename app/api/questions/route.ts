import { pool } from "../../../db/index";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT `id`, `author_name`, `content` FROM `questions` ORDER BY `id` DESC LIMIT 100");
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch questions" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, author } = body;
    if (!content) {
      return new Response(JSON.stringify({ error: "content required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    await pool.query("INSERT INTO `questions` (`author_name`, `content`) VALUES (?, ?)", [author || null, content]);

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to save question" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
