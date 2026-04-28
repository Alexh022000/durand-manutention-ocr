import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        dm: {
          white: "#FFFFFF",
          red: "#C6000A",
          "red-dark": "#A30008",
          "red-light": "#FCE5E7",
          ink: "#1A1A1A",
          muted: "#6B7280",
          border: "#E5E7EB",
          bg: "#F5F6F8",
          topbar: "#0F1727",
          "topbar-soft": "#1A2439"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,24,39,0.04), 0 8px 24px rgba(17,24,39,0.06)"
      }
    }
  },
  plugins: []
};

export default config;
