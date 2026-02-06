import React, { createContext, useContext, useEffect, useState } from "react";
import type { ThemeMode } from "@/lib/design-tokens";
import { getThemeCSSVariables } from "@/lib/design-tokens";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "app-theme-mode";
const SYSTEM_PREFERS_DARK = "(prefers-color-scheme: dark)";

/**
 * Get initial theme mode from system preference or localStorage
 */
function getInitialTheme(): ThemeMode {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Check system preference
  if (typeof window !== "undefined" && window.matchMedia(SYSTEM_PREFERS_DARK).matches) {
    return "dark";
  }

  // Default to light
  return "light";
}

/**
 * Apply theme to DOM with CSS variables and classes
 */
function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;

  // Set data attribute for styling
  root.setAttribute("data-theme", mode);
  root.classList.toggle("dark", mode === "dark");

  // Set CSS custom properties
  const variables = getThemeCSSVariables(mode);
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Store preference
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultMode,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => defaultMode || getInitialTheme());
  const [mounted, setMounted] = useState(false);

  // Apply theme on mount and when mode changes
  useEffect(() => {
    applyTheme(mode);
    setMounted(true);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(SYSTEM_PREFERS_DARK);

    const handleChange = (e: MediaQueryListEvent) => {
      const newMode: ThemeMode = e.matches ? "dark" : "light";
      // Only apply if user hasn't explicitly set a preference
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setModeState(newMode);
      }
    };

    // Use addEventListener for modern browsers, fallback to addListener for older ones
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    return undefined;
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState(mode === "light" ? "dark" : "light");
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
