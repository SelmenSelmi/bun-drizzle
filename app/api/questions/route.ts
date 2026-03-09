import { pool } from "../../../db/index";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const topicParam = url.searchParams.get("topicId");

    let sql = "SELECT q.id, q.author_name, q.content, q.topic_id, t.name AS topic_name FROM `questions` q LEFT JOIN `topics` t ON q.topic_id = t.id";
    const params: any[] = [];

    // If a valid topicId is provided and not zero, filter by that topic only
    if (topicParam) {
      const tId = Number(topicParam);
      if (Number.isInteger(tId) && tId > 0) {
        sql += " WHERE q.topic_id = ?";
        params.push(tId);
      }
    }

    sql += " ORDER BY q.id DESC LIMIT 100";

    const [rows] = await pool.query(sql, params);
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
    const { content, author, topicId } = body;
    if (!content) {
      return new Response(JSON.stringify({ error: "content required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (Array.isArray(topicId)) {
      return new Response(JSON.stringify({ error: "topic must be a single id" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const tId = Number(topicId);
    if (!Number.isInteger(tId) || tId <= 0) {
      return new Response(JSON.stringify({ error: "invalid topic id" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // ensure the topic exists
    const [topicRows] = await pool.query("SELECT `id` FROM `topics` WHERE `id` = ? LIMIT 1", [tId]);
    // mysql2 returns [rows, fields]; rows is an array-like
    if (!topicRows || (Array.isArray(topicRows) && (topicRows as any).length === 0)) {
      return new Response(JSON.stringify({ error: "topic not found" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    await pool.query("INSERT INTO `questions` (`author_name`, `content`, `topic_id`) VALUES (?, ?, ?)", [author || null, content, tId]);

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
