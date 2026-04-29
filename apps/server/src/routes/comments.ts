import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { authMiddleware, getCurrentUser } from "../middleware/auth";

export const commentRoutes = new Hono();

commentRoutes.use("*", authMiddleware);

// Get page comments
commentRoutes.get("/pages/:pageId/comments", (c) => {
  const pageId = Number(c.req.param("pageId"));
  const db = getDb();

  const page = db.query("SELECT id FROM pages WHERE id = ?").get(pageId) as any;
  if (!page) return c.json({ success: false, error: "Page not found" }, 404);

  const comments = db
    .query("SELECT c.*, u.username as author_name, u.display_name FROM comments c JOIN users u ON c.created_by = u.id WHERE c.page_id = ? ORDER BY c.created_at ASC")
    .all(pageId);

  return c.json({ success: true, data: comments });
});

// Create comment
commentRoutes.post("/pages/:pageId/comments", async (c) => {
  const pageId = Number(c.req.param("pageId"));
  const { content, parentId } = await c.req.json();
  const { userId } = getCurrentUser(c);
  const db = getDb();

  const page = db.query("SELECT id FROM pages WHERE id = ?").get(pageId) as any;
  if (!page) return c.json({ success: false, error: "Page not found" }, 404);

  if (parentId !== undefined && parentId !== null) {
    const parentComment = db.query("SELECT * FROM comments WHERE id = ?").get(parentId) as any;
    if (!parentComment || parentComment.page_id !== pageId) {
      return c.json({ success: false, error: "Parent comment not found" }, 404);
    }
  }

  const result = db
    .query("INSERT INTO comments (page_id, parent_id, content, created_by) VALUES (?, ?, ?, ?) RETURNING *")
    .run(pageId, parentId ?? null, content, userId);

  const commentWithAuthor = db
    .query("SELECT c.*, u.username as author_name, u.display_name FROM comments c JOIN users u ON c.created_by = u.id WHERE c.id = ?")
    .get(result.id);

  return c.json({ success: true, data: commentWithAuthor }, 201);
});

// Update comment
commentRoutes.put("/comments/:id", async (c) => {
  const commentId = Number(c.req.param("id"));
  const { content } = await c.req.json();
  const { userId } = getCurrentUser(c);
  const db = getDb();

  const comment = db.query("SELECT * FROM comments WHERE id = ?").get(commentId) as any;
  if (!comment) return c.json({ success: false, error: "Comment not found" }, 404);

  if (comment.created_by !== userId) {
    return c.json({ success: false, error: "Unauthorized" }, 403);
  }

  db.query(
    "UPDATE comments SET content = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(content, commentId);

  const updatedComment = db
    .query("SELECT c.*, u.username as author_name, u.display_name FROM comments c JOIN users u ON c.created_by = u.id WHERE c.id = ?")
    .get(commentId);

  return c.json({ success: true, data: updatedComment });
});

// Delete comment
commentRoutes.delete("/comments/:id", (c) => {
  const commentId = Number(c.req.param("id"));
  const { userId } = getCurrentUser(c);
  const db = getDb();

  const comment = db.query("SELECT * FROM comments WHERE id = ?").get(commentId) as any;
  if (!comment) return c.json({ success: false, error: "Comment not found" }, 404);

  if (comment.created_by !== userId) {
    return c.json({ success: false, error: "Unauthorized" }, 403);
  }

  db.query("DELETE FROM comments WHERE id = ?").run(commentId);
  return c.json({ success: true });
});
