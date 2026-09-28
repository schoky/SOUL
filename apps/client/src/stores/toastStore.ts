import { create } from "zustand";

export type ToastKind = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
};

type ToastStore = {
  toasts: Toast[];

  push: (kind: ToastKind, message: string) => void;

  dismiss: (id: string) => void;

  clear: () => void;
};

const DEFAULT_DURATION = 3500;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  push(kind, message) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    set((state) => ({
      toasts: [...state.toasts, { id, kind, message }],
    }));

    setTimeout(() => {
      get().dismiss(id);
    }, DEFAULT_DURATION);
  },

  dismiss(id) {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clear() {
    set({
      toasts: [],
    });
  },
}));
