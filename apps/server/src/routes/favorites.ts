import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

export const favoriteRoutes = new Hono();

favoriteRoutes.use("*", authMiddleware);

favoriteRoutes.get("/", (c) => {
  const { userId } = getCurrentUser(c);
  const db = getDb();
  const data = db.query(
    "SELECT f.*, p.title, p.icon FROM favorites f JOIN pages p ON f.page_id = p.id WHERE f.user_id = ? ORDER BY f.created_at DESC"
  ).all(userId);
  return c.json({ success: true, data });
});

favoriteRoutes.post("/", async (c) => {
  const { pageId } = await c.req.json();
  const { userId } = getCurrentUser(c);
  const db = getDb();
  db.query("INSERT OR IGNORE INTO favorites (user_id, page_id) VALUES (?, ?)").run(userId, pageId);
  return c.json({ success: true });
});

favoriteRoutes.delete("/:pageId", (c) => {
  const pageId = Number(c.req.param("pageId"));
  const { userId } = getCurrentUser(c);
  const db = getDb();
  db.query("DELETE FROM favorites WHERE user_id = ? AND page_id = ?").run(userId, pageId);
  return c.json({ success: true });
});

favoriteRoutes.get("/check/:pageId", (c) => {
  const pageId = Number(c.req.param("pageId"));
  const { userId } = getCurrentUser(c);
  const db = getDb();
  const row = db.query("SELECT id FROM favorites WHERE user_id = ? AND page_id = ?").get(userId, pageId);
  return c.json({ success: true, data: { favorited: !!row } });
});
