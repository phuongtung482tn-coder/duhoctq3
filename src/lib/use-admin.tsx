import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AdminModalKey =
  | "editor"
  | "fomo"
  | "analytics"
  | "pages"
  | "abtest"
  | "email"
  | "webhook"
  | "sections"
  | "theme"
  | "guide"
  | "leads"
  | "webmaster"
  | "pixel"
  | "utm"
  | "cron"
  | "storage"
  | "seo"
  | "form"
  | "ai"
  | "contact"
  | "countdown"
  | "adminlink"
  | "tracking"
  | "preview";

const AUTH_KEY = "funnel_admin_authed_v1";

interface AdminContextValue {
  authed: boolean;
  login: (password: string, expected: string) => boolean;
  logout: () => void;
  activeModal: AdminModalKey | null;
  openModal: (key: AdminModalKey) => void;
  closeModal: () => void;
  previewMode: boolean;
  togglePreview: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [activeModal, setActiveModal] = useState<AdminModalKey | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    try {
      setAuthed(window.sessionStorage.getItem(AUTH_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback((password: string, expected: string) => {
    if (password && password === expected) {
      setAuthed(true);
      try {
        window.sessionStorage.setItem(AUTH_KEY, "1");
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthed(false);
    setActiveModal(null);
    try {
      window.sessionStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      authed,
      login,
      logout,
      activeModal,
      openModal: (k: AdminModalKey) => setActiveModal(k),
      closeModal: () => setActiveModal(null),
      previewMode,
      togglePreview: () => setPreviewMode((p) => !p),
    }),
    [authed, login, logout, activeModal, previewMode],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
