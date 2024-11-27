import { defineConfig, defaultConfig, createSystem } from "@chakra-ui/react"

const config = defineConfig({
  cssVarsRoot: ":where(html)",
  globalCss: {
    "*::selection": {
      bg: "rose.500",
      color: "white"
    },
    "*::-webkit-scrollbar": {
      display: "none"
    },
    "*::-webkit-scrollbar-button": {
      display: "none"
    },
    "*, *::before, *::after": {
      fontFamily: "cursive, system-ui, sans-serif"
    }
  },
  theme: {
    tokens: {
      colors: {
        indigo: {
          50: { value: "#eef2ff" },
          100: { value: "#e0e7ff" },
          200: { value: "#c7d2fe" },
          300: { value: "#a5b4fc" },
          400: { value: "#818cf8" },
          500: { value: "#6366f1" },
          600: { value: "#4f46e5" },
          700: { value: "#4338ca" },
          800: { value: "#3730a3" },
          900: { value: "#312e81" },
          950: { value: "#1e1b4b" }
        },
        violet: {
          50: { value: "#f5f3ff" },
          100: { value: "#ede9fe" },
          200: { value: "#ddd6fe" },
          300: { value: "#c4b5fd" },
          400: { value: "#a78bfa" },
          500: { value: "#8b5cf6" },
          600: { value: "#7c3aed" },
          700: { value: "#6d28d9" },
          800: { value: "#5b21b6" },
          900: { value: "#4c1d95" },
          950: { value: "#2e1065" }
        },
        rose: {
          50: { value: "#fff1f2" },
          100: { value: "#ffe4e6" },
          200: { value: "#fecdd3" },
          300: { value: "#fda4af" },
          400: { value: "#fb7185" },
          500: { value: "#f43f5e" },
          600: { value: "#e11d48" },
          700: { value: "#be123c" },
          800: { value: "#9f1239" },
          900: { value: "#881337" },
          950: { value: "#4c0519" }
        },
        slate: {
          50: { value: "#f8fafc" },
          100: { value: "#f1f5f9" },
          200: { value: "#e2e8f0" },
          300: { value: "#cbd5e1" },
          400: { value: "#94a3b8" },
          500: { vaue: "#64748b" },
          600: { value: "#475569" },
          700: { value: "#334155" },
          800: { value: "#1e293b" },
          900: { value: "#0f172a" },
          950: { value: "#020617" }
        }
      }
    },
    semanticTokens: {
      colors: {
        rose: {
          solid: { value: "{colors.rose.500}" },
          contrast: { value: "{colors.rose.100}" },
          fg: { value: "{colors.rose.700}" },
          muted: { value: "{colors.rose.100}" },
          subtle: { value: "{colors.rose.200}" },
          emphasized: { value: "{colors.rose.300}" },
          focusRing: { value: "{colors.rose.500}" }
        },
        violet: {
          solid: { value: "{colors.violet.500}" },
          contrast: { value: "{colors.violet.100}" },
          fg: { value: "{colors.violet.700}" },
          muted: { value: "{colors.violet.100}" },
          subtle: { value: "{colors.violet.200}" },
          emphasized: { value: "{colors.violet.300}" },
          focusRing: { value: "{colors.violet.500}" }
        },
        indigo: {
          solid: { value: "{colors.indigo.500}" },
          contrast: { value: "{colors.indigo.100}" },
          fg: { value: "{colors.indigo.700}" },
          muted: { value: "{colors.indigo.100}" },
          subtle: { value: "{colors.indigo.200}" },
          emphasized: { value: "{colors.indigo.300}" },
          focusRing: { value: "{colors.indigo.500}" }
        },
        slate: {
          solid: { value: "{colors.slate.500}" },
          contrast: { value: "{colors.slate.100}" },
          fg: { value: "{colors.slate.700}" },
          muted: { value: "{colors.slate.100}" },
          subtle: { value: "{colors.slate.200}" },
          emphasized: { value: "{colors.slate.300}" },
          focusRing: { value: "{colors.slate.500}" }
        }
      }
    }
  }
})

export const system = createSystem(config, defaultConfig)
