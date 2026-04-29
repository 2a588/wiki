import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

export const mentionRoutes = new Hono();

mentionRoutes.use("*", authMiddleware);

mentionRoutes.get("/users", (c) => {
  const db = getDb();
  const users = db.query("SELECT id, username, display_name FROM users ORDER BY display_name LIMIT 20").all();
  return c.json({ success: true, data: users });
});

mentionRoutes.get("/users/search/:query", (c) => {
  const query = c.req.param("query");
  const db = getDb();
  const users = db.query(
    "SELECT id, username, display_name FROM users WHERE username LIKE ? OR display_name LIKE ? LIMIT 10"
  ).all(`%${query}%`, `%${query}%`);
  return c.json({ success: true, data: users });
});

mentionRoutes.post("/", async (c) => {
  const { pageId, mentionedUserId } = await c.req.json();
  const { userId } = getCurrentUser(c);
  const db = getDb();
  db.query("INSERT INTO mentions (page_id, mentioned_user_id, created_by) VALUES (?, ?, ?)")
    .run(pageId, mentionedUserId, userId);
  return c.json({ success: true });
});

mentionRoutes.get("/my", (c) => {
  const { userId } = getCurrentUser(c);
  const db = getDb();
  const data = db.query(`
    SELECT m.*, p.title as page_title, p.icon as page_icon, u.display_name as mentioned_by_name
    FROM mentions m JOIN pages p ON m.page_id = p.id JOIN users u ON m.created_by = u.id
    WHERE m.mentioned_user_id = ? ORDER BY m.created_at DESC LIMIT 20
  `).all(userId);
  return c.json({ success: true, data: data });
});
