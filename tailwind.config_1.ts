
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        "operator-blue": "#2361a9",
        "operator-gray-bg": "#e9e9ea",
        "operator-table-head": "#bfc0c3",
        "operator-table-row": "#ffffff",
        "operator-table-row-alt": "#f7f7f7",
        "operator-sidebar": "#373c41",
        "operator-sidebar-active": "#2361a9",
        "operator-sidebar-hover": "#295fb7",
        "operator-icon": "#e9e9ea",
        "operator-border": "#cdcdcf",
        // Nuevos colores para los estados
        "status-active": "#22c55e",    // verde
        "status-moving": "#3b82f6",    // azul
        "status-error": "#ef4444",     // rojo
        "status-inactive": "#9ca3af",  // gris
      },
      borderRadius: {
        xl: "1.2rem",
        lg: "0.70rem",
      },
      boxShadow: {
        operator: "0 2px 8px 0 rgba(60,72,88,0.09)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
