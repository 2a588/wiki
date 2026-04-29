import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getDb } from "@wiki/db";
import { authRoutes } from "./routes/auth";
import { spaceRoutes } from "./routes/spaces";
import { pageRoutes } from "./routes/pages";
import { attachmentRoutes } from "./routes/attachments";
import { commentRoutes } from "./routes/comments";
import { dashboardRoutes } from "./routes/dashboard";
import { favoriteRoutes } from "./routes/favorites";
import { labelRoutes } from "./routes/labels";
import { recycleRoutes } from "./routes/recycle";
import { mentionRoutes } from "./routes/mentions";
import { join, extname } from "path";

const app = new Hono();

app.use("*", logger());
app.use("/api/*", cors({ origin: "*", credentials: true }));

// Initialize DB on startup
getDb();

// API routes
app.route("/api/auth", authRoutes);
app.route("/api/spaces", spaceRoutes);
app.route("/api/pages", pageRoutes);
app.route("/api/attachments", attachmentRoutes);
app.route("/api", commentRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/favorites", favoriteRoutes);
app.route("/api/labels", labelRoutes);
app.route("/api/recycle", recycleRoutes);
app.route("/api/mentions", mentionRoutes);

const UPLOAD_DIR = join(import.meta.dir, "..", "..", "..", "uploads");
const WEB_DIST = join(import.meta.dir, "..", "..", "..", "apps", "web", "dist");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Serve uploaded files
app.get("/uploads/:filename", (c) => {
  const filename = c.req.param("filename");
  const file = Bun.file(join(UPLOAD_DIR, filename));
  if (!file.exists()) return c.json({ error: "Not found" }, 404);
  return new Response(file);
});

// Serve frontend static files
app.get("*", async (c) => {
  let reqPath = new URL(c.req.url).pathname;

  // Try to serve static file
  if (reqPath.startsWith("/assets/") || reqPath.includes(".")) {
    const filePath = join(WEB_DIST, reqPath);
    const file = Bun.file(filePath);
    if (file.exists()) {
      const ext = extname(filePath);
      const mime = MIME_TYPES[ext] || "application/octet-stream";
      return new Response(file, {
        headers: { "Content-Type": mime, "Cache-Control": reqPath.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache" },
      });
    }
  }

  // SPA fallback - serve index.html for all other routes
  const indexFile = Bun.file(join(WEB_DIST, "index.html"));
  return new Response(indexFile, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});

const port = Number(process.env.PORT) || 3456;

console.log(`🚀 Wiki server running at http://0.0.0.0:${port}`);

export default {
  port,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};
