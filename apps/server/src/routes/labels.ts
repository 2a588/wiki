import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

export const labelRoutes = new Hono();

labelRoutes.use("*", authMiddleware);

labelRoutes.get("/page/:pageId", (c) => {
  const pageId = Number(c.req.param("pageId"));
  const db = getDb();
  const labels = db.query("SELECT * FROM page_labels WHERE page_id = ? ORDER BY created_at").all(pageId);
  return c.json({ success: true, data: labels });
});

labelRoutes.post("/page/:pageId", async (c) => {
  const pageId = Number(c.req.param("pageId"));
  const { label } = await c.req.json();
  const { userId } = getCurrentUser(c);
  const db = getDb();
  const existing = db.query("SELECT id FROM page_labels WHERE page_id = ? AND label = ?").get(pageId, label);
  if (!existing) {
    db.query("INSERT INTO page_labels (page_id, label, created_by) VALUES (?, ?, ?)").run(pageId, label, userId);
  }
  return c.json({ success: true });
});

labelRoutes.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  db.query("DELETE FROM page_labels WHERE id = ?").run(id);
  return c.json({ success: true });
});

labelRoutes.get("/search/:query", (c) => {
  const query = c.req.param("query");
  const db = getDb();
  const labels = db.query(
    "SELECT DISTINCT label, COUNT(*) as count FROM page_labels WHERE label LIKE ? GROUP BY label ORDER BY count DESC LIMIT 20"
  ).all(`%${query}%`);
  return c.json({ success: true, data: labels });
});

labelRoutes.get("/pages/:label", (c) => {
  const label = c.req.param("label");
  const db = getDb();
  const pages = db.query(`
    SELECT p.*, pl.label, s.name as space_name
    FROM page_labels pl JOIN pages p ON pl.page_id = p.id JOIN spaces s ON p.space_id = s.id
    WHERE pl.label = ? ORDER BY p.updated_at DESC
  `).all(label);
  return c.json({ success: true, data: pages });
});
