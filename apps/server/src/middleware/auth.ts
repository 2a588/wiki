import type { Context, Next } from "hono";

const SESSIONS = new Map<string, { userId: number; username: string }>();

export function createSession(userId: number, username: string): string {
  const token = crypto.randomUUID() + "-" + Date.now();
  SESSIONS.set(token, { userId, username });
  return token;
}

export function getSession(token: string) {
  return SESSIONS.get(token) ?? null;
}

export function deleteSession(token: string) {
  SESSIONS.delete(token);
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  const cookie = c.req.header("Cookie");

  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (cookie) {
    const match = cookie.match(/wiki_session=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  const session = getSession(token);
  if (!session) {
    return c.json({ success: false, error: "Invalid session" }, 401);
  }

  c.set("userId", session.userId);
  c.set("username", session.username);
  await next();
}

export function getCurrentUser(c: Context) {
  return {
    userId: c.get("userId") as number,
    username: c.get("username") as string,
  };
}
