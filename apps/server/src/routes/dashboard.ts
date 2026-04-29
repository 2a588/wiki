import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

export const dashboardRoutes = new Hono();

dashboardRoutes.use("*", authMiddleware);

dashboardRoutes.get("/", (c) => {
  const { userId } = getCurrentUser(c);
  const db = getDb();

  const recentPages = db.query(`
    SELECT p.id, p.title, p.icon, p.updated_at, s.name as space_name, s.key as space_key
    FROM pages p JOIN spaces s ON p.space_id = s.id
    WHERE p.created_by = ? OR p.updated_by = ?
    ORDER BY p.updated_at DESC LIMIT 10
  `).all(userId, userId);

  const favorites = db.query(`
    SELECT p.id, p.title, p.icon, p.updated_at, s.name as space_name, s.key as space_key
    FROM favorites f JOIN pages p ON f.page_id = p.id JOIN spaces s ON p.space_id = s.id
    WHERE f.user_id = ? ORDER BY f.created_at DESC LIMIT 10
  `).all(userId);

  const spaces = db.query(`
    SELECT s.*, (SELECT COUNT(*) FROM pages WHERE space_id = s.id AND deleted_at IS NULL) as page_count
    FROM spaces s ORDER BY s.updated_at DESC LIMIT 8
  `).all();

  const recentActivity = db.query(`
    SELECT pv.page_id, p.title, p.icon, pv.version, pv.created_at, u.display_name
    FROM page_versions pv JOIN pages p ON pv.page_id = p.id JOIN users u ON pv.created_by = u.id
    WHERE pv.created_by = ?
    ORDER BY pv.created_at DESC LIMIT 10
  `).all(userId);

  return c.json({
    success: true,
    data: { recentPages, favorites, spaces, recentActivity },
  });
});
