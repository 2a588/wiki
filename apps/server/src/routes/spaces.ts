import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

export const spaceRoutes = new Hono();

spaceRoutes.use("*", authMiddleware);

// List all spaces
spaceRoutes.get("/", (c) => {
  const db = getDb();
  const spaces = db.query("SELECT * FROM spaces ORDER BY updated_at DESC").all();
  return c.json({ success: true, data: spaces });
});

// Get single space
spaceRoutes.get("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  const space = db.query("SELECT * FROM spaces WHERE id = ?").get(id) as any;
  if (!space) return c.json({ success: false, error: "Space not found" }, 404);
  return c.json({ success: true, data: space });
});

// Create space
spaceRoutes.post("/", async (c) => {
  const { key, name, description, icon } = await c.req.json();
  if (!key || !name) {
    return c.json({ success: false, error: "Key and name are required" }, 400);
  }

  const { userId } = getCurrentUser(c);
  const db = getDb();

  const existing = db.query("SELECT id FROM spaces WHERE key = ?").get(key);
  if (existing) {
    return c.json({ success: false, error: "Space key already exists" }, 409);
  }

  const space = db
    .query("INSERT INTO spaces (key, name, description, icon, created_by) VALUES (?, ?, ?, ?, ?) RETURNING *")
    .get(key, name, description ?? "", icon ?? "📁", userId);

  return c.json({ success: true, data: space }, 201);
});

// Update space
spaceRoutes.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const { name, description, icon } = await c.req.json();
  const db = getDb();

  const existing = db.query("SELECT * FROM spaces WHERE id = ?").get(id);
  if (!existing) return c.json({ success: false, error: "Space not found" }, 404);

  const space = db
    .query("UPDATE spaces SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon), updated_at = datetime('now') WHERE id = ? RETURNING *")
    .get(name ?? null, description ?? null, icon ?? null, id);

  return c.json({ success: true, data: space });
});

// Delete space
spaceRoutes.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  db.query("DELETE FROM spaces WHERE id = ?").run(id);
  return c.json({ success: true });
});

// Get page tree for a space
spaceRoutes.get("/:id/pages", (c) => {
  const spaceId = Number(c.req.param("id"));
  const db = getDb();
  const pages = db.query("SELECT * FROM pages WHERE space_id = ? ORDER BY position, created_at").all(spaceId) as any[];

  // Build tree
  const pageMap = new Map<number, any>();
  const roots: any[] = [];

  for (const page of pages) {
    pageMap.set(page.id, { ...page, children: [] });
  }

  for (const page of pages) {
    const node = pageMap.get(page.id);
    if (page.parent_id && pageMap.has(page.parent_id)) {
      pageMap.get(page.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return c.json({ success: true, data: roots });
});
