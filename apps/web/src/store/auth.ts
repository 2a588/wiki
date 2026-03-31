import { create } from "zustand";

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem("wiki_token", token);
    localStorage.setItem("wiki_user", JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("wiki_token");
    localStorage.removeItem("wiki_user");
    set({ user: null, token: null });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem("wiki_token");
    const userStr = localStorage.getItem("wiki_user");
    if (token && userStr) {
      try {
        set({ user: JSON.parse(userStr), token });
      } catch {
        localStorage.removeItem("wiki_token");
        localStorage.removeItem("wiki_user");
      }
    }
  },
}));
