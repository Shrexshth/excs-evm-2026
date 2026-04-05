import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "20px",
        background: "var(--surface-2)",
        border: "1px solid var(--border-md)",
        boxShadow: "var(--sh-xs)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "var(--font-label)",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        color: "var(--fg-muted)",
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}>
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </span>
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}