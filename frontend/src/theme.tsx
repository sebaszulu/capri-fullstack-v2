import { createSystem, defaultConfig } from "@chakra-ui/react"
import { buttonRecipe } from "./theme/button.recipe"

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      fontSize: "16px",
    },
    body: {
      fontSize: "0.875rem",
      margin: 0,
      padding: 0,
      fontFamily: "'DM Sans', sans-serif",
    },
    ".main-link": {
      color: "ui.main",
      fontWeight: "600",
      transition: "color 0.2s ease",
      _hover: {
        color: "ui.dark",
      },
    },
    // Animaciones globales
    "@keyframes fadeInUp": {
      from: {
        opacity: 0,
        transform: "translateY(20px)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
    "@keyframes fadeIn": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    "@keyframes slideInLeft": {
      from: {
        opacity: 0,
        transform: "translateX(-20px)",
      },
      to: {
        opacity: 1,
        transform: "translateX(0)",
      },
    },
    "@keyframes pulse": {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },
    "@keyframes countUp": {
      from: { opacity: 0, transform: "scale(0.5)" },
      to: { opacity: 1, transform: "scale(1)" },
    },
    ".animate-fade-in-up": {
      animation: "fadeInUp 0.5s ease-out forwards",
    },
    ".animate-fade-in": {
      animation: "fadeIn 0.4s ease-out forwards",
    },
    ".animate-slide-in-left": {
      animation: "slideInLeft 0.4s ease-out forwards",
    },
    ".stagger-1": { animationDelay: "0.1s" },
    ".stagger-2": { animationDelay: "0.2s" },
    ".stagger-3": { animationDelay: "0.3s" },
    ".stagger-4": { animationDelay: "0.4s" },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Cormorant Garamond', Georgia, serif" },
        body: { value: "'DM Sans', -apple-system, sans-serif" },
      },
      colors: {
        // Paleta principal inspirada en el hotel
        ui: {
          main: { value: "#1A5F4A" }, // Verde bosque tropical
          light: { value: "#2D8B6E" }, // Verde más claro
          dark: { value: "#0D3D2E" }, // Verde oscuro profundo
          accent: { value: "#3BBFA3" }, // Turquesa piscina
        },
        brand: {
          50: { value: "#E8F5F1" },
          100: { value: "#C5E8DD" },
          200: { value: "#9DD9C7" },
          300: { value: "#6EC9AE" },
          400: { value: "#3BBFA3" }, // Turquesa piscina
          500: { value: "#1A5F4A" }, // Verde principal
          600: { value: "#155040" },
          700: { value: "#0D3D2E" },
          800: { value: "#082A1F" },
          900: { value: "#041710" },
        },
        nature: {
          forest: { value: "#1A5F4A" }, // Verde bosque
          pool: { value: "#4DD0C4" }, // Turquesa agua
          poolDark: { value: "#2BA89C" }, // Turquesa profundo
          sand: { value: "#F7F4EF" }, // Arena cálida
          sky: { value: "#87CEEB" }, // Cielo azul
          sunset: { value: "#FF8A65" }, // Coral atardecer
          gold: { value: "#D4A853" }, // Dorado premium
        },
        structure: {
          dark: { value: "#1C1C1C" }, // Negro estructura hotel
          steel: { value: "#2D2D2D" }, // Gris acero
          white: { value: "#FFFFFF" }, // Blanco fachada
        },
      },
    },
    semanticTokens: {
      colors: {
        // Colores semánticos para modo claro/oscuro
        "bg.canvas": {
          value: {
            _light: "{colors.nature.sand}",
            _dark: "{colors.structure.dark}",
          },
        },
        "bg.subtle": {
          value: { _light: "#FFFFFF", _dark: "{colors.structure.steel}" },
        },
        "bg.muted": {
          value: { _light: "{colors.brand.500}", _dark: "{colors.brand.700}" },
        },
        "fg.default": {
          value: { _light: "{colors.structure.dark}", _dark: "#FFFFFF" },
        },
        "fg.muted": {
          value: { _light: "#5A6B63", _dark: "#A0ADA6" },
        },
        "border.default": {
          value: { _light: "#E2E8E5", _dark: "#3D4A44" },
        },
        "accent.default": {
          value: { _light: "{colors.brand.400}", _dark: "{colors.brand.400}" },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
})
