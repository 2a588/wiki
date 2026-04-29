import { useAuthStore } from "../store/auth";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Request failed");
  return data.data;
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ user: any; token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
    register: (data: { username: string; email: string; password: string; displayName: string }) =>
      request<{ user: any; token: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
    me: () => request<any>("/auth/me"),
  },
  spaces: {
    list: () => request<any[]>("/spaces"),
    get: (id: number) => request<any>(`/spaces/${id}`),
    create: (data: any) => request<any>("/spaces", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/spaces/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/spaces/${id}`, { method: "DELETE" }),
    pages: (id: number) => request<any[]>(`/spaces/${id}/pages`),
  },
  pages: {
    get: (id: number) => request<any>(`/pages/${id}`),
    create: (data: any) => request<any>("/pages", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/pages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/pages/${id}`, { method: "DELETE" }),
    versions: (id: number) => request<any[]>(`/pages/${id}/versions`),
    getVersion: (pageId: number, versionId: number) => request<any>(`/pages/${pageId}/versions/${versionId}`),
    search: (query: string) => request<any[]>(`/pages/search/${encodeURIComponent(query)}`),
    move: (id: number, data: { parentId?: number | null; position?: number }) =>
      request<any>(`/pages/${id}/move`, { method: "PUT", body: JSON.stringify(data) }),
    comments: {
      get: (pageId: number) => request<any[]>(`/pages/${pageId}/comments`),
      create: (pageId: number, data: { content: string; parentId?: number | null }) =>
        request<any>(`/pages/${pageId}/comments`, { method: "POST", body: JSON.stringify(data) }),
      update: (commentId: number, data: { content: string }) =>
        request<any>(`/comments/${commentId}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (commentId: number) => request<void>(`/comments/${commentId}`, { method: "DELETE" }),
    },
  },
  attachments: {
    upload: (file: File, pageId: number) => {
      const form = new FormData();
      form.append("file", file);
      form.append("pageId", String(pageId));
      return request<any>("/attachments", { method: "POST", body: form });
    },
    list: (pageId: number) => request<any[]>(`/attachments/page/${pageId}`),
    delete: (id: number) => request<void>(`/attachments/${id}`, { method: "DELETE" }),
  },
  dashboard: {
    get: () => request<any>("/dashboard"),
  },
  favorites: {
    list: () => request<any[]>("/favorites"),
    add: (pageId: number) => request<void>("/favorites", { method: "POST", body: JSON.stringify({ pageId }) }),
    remove: (pageId: number) => request<void>(`/favorites/${pageId}`, { method: "DELETE" }),
    check: (pageId: number) => request<{ favorited: boolean }>(`/favorites/check/${pageId}`),
  },
  labels: {
    get: (pageId: number) => request<any[]>(`/labels/page/${pageId}`),
    add: (pageId: number, label: string) =>
      request<void>(`/labels/page/${pageId}`, { method: "POST", body: JSON.stringify({ label }) }),
    remove: (id: number) => request<void>(`/labels/${id}`, { method: "DELETE" }),
    search: (query: string) => request<any[]>(`/labels/search/${encodeURIComponent(query)}`),
    pages: (label: string) => request<any[]>(`/labels/pages/${encodeURIComponent(label)}`),
  },
  recycle: {
    list: () => request<any[]>("/recycle"),
    restore: (id: number) => request<void>(`/recycle/${id}/restore`, { method: "POST" }),
    delete: (id: number) => request<void>(`/recycle/${id}`, { method: "DELETE" }),
  },
  mentions: {
    users: (query?: string) => request<any[]>(query ? `/mentions/users/search/${encodeURIComponent(query)}` : "/mentions/users"),
    create: (pageId: number, mentionedUserId: number) =>
      request<void>("/mentions", { method: "POST", body: JSON.stringify({ pageId, mentionedUserId }) }),
    my: () => request<any[]>("/mentions/my"),
  },
};
