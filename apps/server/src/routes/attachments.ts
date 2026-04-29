import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";
import { join } from "path";
import { existsSync, mkdirSync, unlinkSync } from "fs";

export const attachmentRoutes = new Hono();

attachmentRoutes.use("*", authMiddleware);

const UPLOAD_DIR = join(import.meta.dir, "..", "..", "..", "..", "uploads");

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Upload attachment
attachmentRoutes.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"] as File;
  const pageId = Number(body["pageId"]);

  if (!file || !pageId) {
    return c.json({ success: false, error: "File and pageId are required" }, 400);
  }

  const { userId } = getCurrentUser(c);
  const db = getDb();

  const page = db.query("SELECT id FROM pages WHERE id = ?").get(pageId);
  if (!page) return c.json({ success: false, error: "Page not found" }, 404);

  const ext = file.name.split(".").pop() ?? "";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  await Bun.write(filepath, file);

  const attachment = db
    .query("INSERT INTO attachments (page_id, filename, original_name, mime_type, size, created_by) VALUES (?, ?, ?, ?, ?, ?) RETURNING *")
    .get(pageId, filename, file.name, file.type, file.size, userId);

  return c.json({ success: true, data: attachment }, 201);
});

// List attachments for a page
attachmentRoutes.get("/page/:pageId", (c) => {
  const pageId = Number(c.req.param("pageId"));
  const db = getDb();
  const attachments = db
    .query("SELECT * FROM attachments WHERE page_id = ? ORDER BY created_at DESC")
    .all(pageId);
  return c.json({ success: true, data: attachments });
});

// Download attachment
attachmentRoutes.get("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  const attachment = db.query("SELECT * FROM attachments WHERE id = ?").get(id) as any;
  if (!attachment) return c.json({ success: false, error: "Attachment not found" }, 404);

  const filepath = join(UPLOAD_DIR, attachment.filename);
  const file = Bun.file(filepath);
  if (!file.exists()) return c.json({ success: false, error: "File not found" }, 404);

  return new Response(file, {
    headers: {
      "Content-Type": attachment.mime_type,
      "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.original_name)}"`,
    },
  });
});

// Delete attachment
attachmentRoutes.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb();
  const attachment = db.query("SELECT * FROM attachments WHERE id = ?").get(id) as any;
  if (!attachment) return c.json({ success: false, error: "Attachment not found" }, 404);

  const filepath = join(UPLOAD_DIR, attachment.filename);
  try {
    unlinkSync(filepath);
  } catch (e) {
    console.error("Failed to delete attachment file:", filepath, e);
  }

  db.query("DELETE FROM attachments WHERE id = ?").run(id);
  return c.json({ success: true });
});
