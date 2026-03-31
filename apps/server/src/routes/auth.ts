import { Hono } from "hono";
import { getDb } from "@wiki/db";
import { hash, compare } from "bcryptjs";
import { createSession, deleteSession, authMiddleware, getCurrentUser } from "../middleware/auth";

export const authRoutes = new Hono();

authRoutes.post("/register", async (c) => {
  const { username, email, password, displayName } = await c.req.json();
  if (!username || !email || !password || !displayName) {
    return c.json({ success: false, error: "All fields are required" }, 400);
  }

  const db = getDb();
  const existing = db.query("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email);
  if (existing) {
    return c.json({ success: false, error: "Username or email already exists" }, 409);
  }

  const passwordHash = await hash(password, 10);
  const result = db
    .query("INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?) RETURNING id, username, email, display_name, created_at, updated_at")
    .get(username, email, passwordHash, displayName) as any;

  const token = createSession(result.id, result.username);

  return c.json({
    success: true,
    data: {
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        displayName: result.display_name,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      },
      token,
    },
  });
});

authRoutes.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) {
    return c.json({ success: false, error: "Username and password are required" }, 400);
  }

  const db = getDb();
  const user = db.query("SELECT * FROM users WHERE username = ?").get(username) as any;
  if (!user) {
    return c.json({ success: false, error: "Invalid credentials" }, 401);
  }

  const valid = await compare(password, user.password_hash);
  if (!valid) {
    return c.json({ success: false, error: "Invalid credentials" }, 401);
  }

  const token = createSession(user.id, user.username);

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    },
  });
});

authRoutes.post("/logout", authMiddleware, (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) deleteSession(token);
  return c.json({ success: true });
});

authRoutes.get("/me", authMiddleware, (c) => {
  const { userId } = getCurrentUser(c);
  const db = getDb();
  const user = db.query("SELECT id, username, email, display_name, created_at, updated_at FROM users WHERE id = ?").get(userId) as any;
  if (!user) return c.json({ success: false, error: "User not found" }, 404);

  return c.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
  });
});
