"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "qc_theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const m = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
    return m && m.matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);
  // Helps built-in form controls choose correct colors
  root.style.colorScheme = isDark ? "dark" : "light";
}

function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    const initial = stored || getSystemTheme();
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next) => {
    const v = next === "dark" ? "dark" : "light";
    setThemeState(v);
    applyTheme(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, mounted }),
    [theme, setTheme, toggleTheme, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return (
    ctx || {
      theme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
      mounted: false,
    }
  );
}
