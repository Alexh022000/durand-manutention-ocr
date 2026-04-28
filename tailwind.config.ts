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
          secondary: "#7A7376",
          "secondary-dark": "#5C5658",
          "secondary-light": "#E8E5E6",
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
