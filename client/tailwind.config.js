/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotstar: {
          dark: '#0f1014',
          card: '#16181f',
          elevated: '#1e212b',
          border: '#2a2e3d',
          blue: '#0084ff',
          blueHover: '#1a90ff',
          cyan: '#00d2ff',
          gold: '#f59e0b',
          goldDark: '#d97706',
          textMuted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.8), 0 0 20px 2px rgba(0, 132, 255, 0.15)',
        'hero-btn': '0 4px 14px 0 rgba(0, 132, 255, 0.39)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
