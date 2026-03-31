import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

export const pageRoutes = new Hono();

pageRoutes.use("*", authMiddleware);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    || `page-${Date.now()}`;
}

// Get page with latest content
pageRoutes.get("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();

  const page = db.query("SELECT * FROM pages WHERE id = ?").get(id) as any;
  if (!page) return c.json({ success: false, error: "Page not found" }, 404);

  const latestVersion = db
    .query("SELECT * FROM page_versions WHERE page_id = ? ORDER BY version DESC LIMIT 1")
    .get(id) as any;

  const attachments = db
    .query("SELECT * FROM attachments WHERE page_id = ? ORDER BY created_at DESC")
    .all(id);

  return c.json({
    success: true,
    data: {
      ...page,
      content: latestVersion?.content ?? "{}",
      version: latestVersion?.version ?? 0,
      attachments,
    },
  });
});

// Create page
pageRoutes.post("/", async (c) => {
  const { spaceId, parentId, title, icon, content } = await c.req.json();
  if (!spaceId || !title) {
    return c.json({ success: false, error: "Space ID and title are required" }, 400);
  }

  const { userId } = getCurrentUser(c);
  const db = getDb();
  const slug = slugify(title);

  const maxPos = db
    .query("SELECT COALESCE(MAX(position), 0) as max_pos FROM pages WHERE space_id = ? AND parent_id IS ?")
    .get(spaceId, parentId ?? null) as any;

  const result = db
    .query("INSERT INTO pages (space_id, parent_id, title, slug, icon, position, created_by) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *")
    .get(spaceId, parentId ?? null, title, slug, icon ?? null, (maxPos.max_pos ?? 0) + 1, userId) as any;

  // Create first version
  db.query("INSERT INTO page_versions (page_id, content, version, created_by) VALUES (?, ?, 1, ?)")
    .run(result.id, content ?? '{"type":"doc","content":[{"type":"paragraph"}]}', userId);

  // Update space updated_at
  db.query("UPDATE spaces SET updated_at = datetime('now') WHERE id = ?").run(spaceId);

  return c.json({ success: true, data: result }, 201);
});

// Update page
pageRoutes.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const { title, content, icon } = await c.req.json();
  const { userId } = getCurrentUser(c);
  const db = getDb();

  const page = db.query("SELECT * FROM pages WHERE id = ?").get(id) as any;
  if (!page) return c.json({ success: false, error: "Page not found" }, 404);

  if (title || icon !== undefined) {
    const slug = title ? slugify(title) : null;
    db.query(
      "UPDATE pages SET title = COALESCE(?, title), slug = COALESCE(?, slug), icon = COALESCE(?, icon), updated_by = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(title ?? null, slug, icon ?? null, userId, id);
  }

  if (content) {
    const latestVersion = db
      .query("SELECT version FROM page_versions WHERE page_id = ? ORDER BY version DESC LIMIT 1")
      .get(id) as any;

    const newVersion = (latestVersion?.version ?? 0) + 1;
    db.query("INSERT INTO page_versions (page_id, content, version, created_by) VALUES (?, ?, ?, ?)")
      .run(id, content, newVersion, userId);
  }

  // Update space updated_at
  db.query("UPDATE spaces SET updated_at = datetime('now') WHERE id = ?").run(page.space_id);

  const updated = db.query("SELECT * FROM pages WHERE id = ?").get(id);
  return c.json({ success: true, data: updated });
});

// Delete page
pageRoutes.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  db.query("DELETE FROM pages WHERE id = ?").run(id);
  return c.json({ success: true });
});

// Get page versions
pageRoutes.get("/:id/versions", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  const versions = db
    .query("SELECT pv.*, u.display_name as author_name FROM page_versions pv JOIN users u ON pv.created_by = u.id WHERE pv.page_id = ? ORDER BY pv.version DESC")
    .all(id);
  return c.json({ success: true, data: versions });
});

// Get specific version content
pageRoutes.get("/:id/versions/:versionId", (c) => {
  const versionId = Number(c.req.param("versionId"));
  const db = getDb();
  const version = db.query("SELECT * FROM page_versions WHERE id = ?").get(versionId);
  if (!version) return c.json({ success: false, error: "Version not found" }, 404);
  return c.json({ success: true, data: version });
});

// Search pages
pageRoutes.get("/search/:query", (c) => {
  const query = c.req.param("query");
  const db = getDb();
  const results = db
    .query("SELECT p.*, pv.content FROM pages p LEFT JOIN page_versions pv ON p.id = pv.page_id AND pv.version = (SELECT MAX(version) FROM page_versions WHERE page_id = p.id) WHERE p.title LIKE ? ORDER BY p.updated_at DESC LIMIT 20")
    .all(`%${query}%`);
  return c.json({ success: true, data: results });
});
