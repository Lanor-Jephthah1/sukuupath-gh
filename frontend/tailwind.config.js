/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed-variant": "#00522f",
        "on-primary-fixed": "#001b3c",
        "surface-container-low": "#f6f3f2",
        "primary-fixed": "#d5e3ff",
        "tertiary": "#003f23",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#261900",
        "surface-container-highest": "#e5e2e1",
        "primary": "#00366c",
        "surface-tint": "#175ead",
        "inverse-surface": "#303030",
        "on-primary-fixed-variant": "#004689",
        "outline-variant": "#c3c6d5",
        "secondary-container": "#ffbf2e",
        "on-primary-container": "#9ac0ff",
        "on-secondary-container": "#6e4f00",
        "surface": "#fcf9f8",
        "secondary-fixed-dim": "#fbbc2b",
        "tertiary-fixed-dim": "#81d9a2",
        "tertiary-container": "#005934",
        "on-tertiary-container": "#79d09a",
        "inverse-on-surface": "#f3f0ef",
        "surface-container-high": "#eae7e7",
        "primary-container": "#004d95",
        "secondary-fixed": "#ffdea5",
        "on-secondary-fixed-variant": "#5d4200",
        "error": "#ba1a1a",
        "on-surface-variant": "#434653",
        "on-background": "#1b1b1c",
        "tertiary-fixed": "#9df5bd",
        "on-error-container": "#93000a",
        "surface-dim": "#dcd9d9",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#1b1b1c",
        "on-error": "#ffffff",
        "secondary": "#7b5800",
        "surface-bright": "#fcf9f8",
        "on-tertiary": "#ffffff",
        "error-container": "#ffdad6",
        "on-primary": "#ffffff",
        "primary-fixed-dim": "#a8c8ff",
        "background": "#fcf9f8",
        "surface-container": "#f0eded",
        "surface-variant": "#e5e2e1",
        "outline": "#737784",
        "inverse-primary": "#a8c8ff",
        "on-tertiary-fixed": "#002110"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
