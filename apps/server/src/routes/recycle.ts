import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

export const recycleRoutes = new Hono();

recycleRoutes.use("*", authMiddleware);

recycleRoutes.get("/", (c) => {
  const db = getDb();
  const pages = db.query(`
    SELECT p.id, p.title, p.icon, p.deleted_at, u.display_name as deleted_by_name
    FROM pages p JOIN users u ON p.created_by = u.id
    WHERE p.deleted_at IS NOT NULL
    ORDER BY p.deleted_at DESC LIMIT 50
  `).all();
  return c.json({ success: true, data: pages });
});

recycleRoutes.post("/:id/restore", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  db.query("UPDATE pages SET deleted_at = NULL, updated_at = datetime('now') WHERE id = ?").run(id);
  return c.json({ success: true });
});

recycleRoutes.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  db.query("DELETE FROM pages WHERE id = ?").run(id);
  return c.json({ success: true });
});
