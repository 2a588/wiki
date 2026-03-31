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

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Request failed");
  }
  return data.data;
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ user: any; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    register: (data: { username: string; email: string; password: string; displayName: string }) =>
      request<{ user: any; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
    me: () => request<any>("/auth/me"),
  },
  spaces: {
    list: () => request<any[]>("/spaces"),
    get: (id: number) => request<any>(`/spaces/${id}`),
    create: (data: { key: string; name: string; description?: string; icon?: string }) =>
      request<any>("/spaces", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; description?: string; icon?: string }) =>
      request<any>(`/spaces/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/spaces/${id}`, { method: "DELETE" }),
    pages: (id: number) => request<any[]>(`/spaces/${id}/pages`),
  },
  pages: {
    get: (id: number) => request<any>(`/pages/${id}`),
    create: (data: { spaceId: number; parentId?: number | null; title: string; icon?: string; content?: string }) =>
      request<any>("/pages", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { title?: string; content?: string; icon?: string }) =>
      request<any>(`/pages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/pages/${id}`, { method: "DELETE" }),
    versions: (id: number) => request<any[]>(`/pages/${id}/versions`),
    search: (query: string) => request<any[]>(`/pages/search/${encodeURIComponent(query)}`),
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
};
