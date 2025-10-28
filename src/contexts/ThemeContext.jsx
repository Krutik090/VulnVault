// =======================================================================
// FILE: src/contexts/ThemeContext.jsx (UPDATED - Export COLOR_THEMES)
// PURPOSE: Theme context with color palette support
// =======================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ✅ UPDATED: Color themes with proper labels and color classes for UI display
export const COLOR_THEMES = [
  { value: "blue", label: "Blue", colorClass: "bg-blue-600" },
  { value: "green", label: "Green", colorClass: "bg-green-600" },
  { value: "purple", label: "Purple", colorClass: "bg-purple-600" },
  { value: "red", label: "Red", colorClass: "bg-red-600" },
  { value: "orange", label: "Orange", colorClass: "bg-orange-600" }
];

// --- Context + PROVIDER ---
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Default to user's preferred color scheme, or fallback to 'light'
  const getInitialTheme = () => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme-mode");
      if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };

  const getInitialColor = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme-color");
      const validColor = COLOR_THEMES.find(t => t.value === stored);
      if (validColor) return stored;
    }
    return COLOR_THEMES[0].value; // Default to first color (blue)
  };

  const [theme, setTheme] = useState(getInitialTheme); // "light" | "dark"
  const [color, setColor] = useState(getInitialColor); // "blue" | "green" | etc

  // --- Toggle dark/light ---
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // --- Apply theme class to <html> ---
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme-mode", theme);
  }, [theme]);

  // --- Apply color theme class to <html> (for CSS vars, etc.) ---
  useEffect(() => {
    COLOR_THEMES.forEach((c) => document.documentElement.classList.remove(`theme-${c.value}`));
    document.documentElement.classList.add(`theme-${color}`);
    localStorage.setItem("theme-color", color);
  }, [color]);

  // --- Sync with OS preference if not yet manually set ---
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const storedTheme = localStorage.getItem("theme-mode");
      if (!storedTheme) setTheme(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, color, toggleTheme, setColor, COLOR_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

// --- Usage hook ---
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
