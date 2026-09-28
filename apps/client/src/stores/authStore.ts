import { create } from "zustand";

import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "../services/api/auth";

import type {
  CurrentUser,
  LoginInput,
  RegisterInput,
} from "../services/api/auth";

type AuthState = {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  checkAuth: () => Promise<void>;

  login: (input: LoginInput) => Promise<void>;

  register: (input: RegisterInput) => Promise<void>;

  logout: () => Promise<void>;

  /**
   * Обновляет текущего пользователя в сторе.
   *
   * Используется после редактирования профиля,
   * чтобы не делать лишний запрос /api/auth/me.
   */
  setUser: (user: CurrentUser) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  isLoading: true,

  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const user = await getCurrentUser();

      set({
        user,
        isAuthenticated: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  login: async (input) => {
    const user = await apiLogin(input);

    set({
      user,
      isAuthenticated: true,
    });
  },

  register: async (input) => {
    const user = await apiRegister(input);

    set({
      user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await apiLogout();

    set({
      user: null,
      isAuthenticated: false,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: true,
    });
  },
}));
