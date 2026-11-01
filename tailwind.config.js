/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teak: {
          bg: '#f8faf7',
          grid: '#eceeea',
          border: '#dfe0de',
          subtle: '#f0f2ef',
          dark: '#2a0f14',
          body: '#544145',
          muted: '#766e70',
          yellow: '#fae261',
          yellowHover: '#f9e47d',
          yellowActive: '#e6bf24',
          green: '#03af54',
          blue: '#a6d4e7',
          pink: '#ff4eaf',
          orange: '#ff571a',
        },
        brand: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#2a0f14',
          600: '#1f0a0e',
          700: '#fae261',
          800: '#544145',
          900: '#2a0f14',
        },
        surface: {
          bg: '#f8faf7',
          card: '#ffffff',
          border: '#dfe0de',
          subtle: '#f0f2ef',
        },
        text: {
          primary: '#2a0f14',
          secondary: '#544145',
          muted: '#766e70',
        }
      },
      fontFamily: {
        display: ['"ABC Solar"', '"ABC Solar Display Medium"', 'sans-serif'],
        sans: ['"Haffer"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Haffer Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(42, 15, 20, 0.04), 0 1px 3px rgba(42, 15, 20, 0.02)',
        'card-hover': '0 12px 28px -4px rgba(42, 15, 20, 0.08), 0 4px 10px rgba(42, 15, 20, 0.03)',
        'yellow-pill': '0 2px 8px rgba(250, 226, 97, 0.45)',
        'yellow-glow': '0 4px 20px rgba(250, 226, 97, 0.55)',
      }
    },
  },
  plugins: [],
}
