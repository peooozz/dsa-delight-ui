import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        // Surface system
        "surface-lowest": "hsl(var(--surface-lowest))",
        "surface-base": "hsl(var(--surface-base))",
        "surface-low": "hsl(var(--surface-low))",
        "surface-med": "hsl(var(--surface-med))",
        "surface-high": "hsl(var(--surface-high))",
        "surface-highest": "hsl(var(--surface-highest))",
        // Text system
        "text-white": "hsl(var(--text-white))",
        "text-light": "hsl(var(--text-light))",
        "text-dim": "hsl(var(--text-dim))",
        "text-ghost": "hsl(var(--text-ghost))",
        // Accent colors
        blue: "hsl(var(--color-blue))",
        purple: "hsl(var(--color-purple))",
        cyan: "hsl(var(--color-cyan))",
        teal: "hsl(var(--color-teal))",
        green: "hsl(var(--color-green))",
        yellow: "hsl(var(--color-yellow))",
        orange: "hsl(var(--color-orange))",
        red: "hsl(var(--color-red))",
        pink: "hsl(var(--color-pink))",
        // Border variants
        "border-faint": "hsl(var(--foreground) / 0.04)",
        "border-soft": "hsl(var(--foreground) / 0.08)",
        "border-med": "hsl(var(--foreground) / 0.15)",
        "border-glow": "hsl(var(--color-purple) / 0.2)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
