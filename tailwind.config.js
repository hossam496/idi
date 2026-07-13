/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0B8F52',
          red: '#C62828',
          navy: '#111C44',
          cream: '#FAF8F5',
          surface: '#FFFFFF',
          border: '#E8E8E8',
          textPrimary: '#111C44',
          textSecondary: '#555555',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(17, 28, 68, 0.05), 0 2px 8px -1px rgba(17, 28, 68, 0.02)',
        premiumHover: '0 12px 30px -4px rgba(17, 28, 68, 0.08), 0 4px 12px -2px rgba(17, 28, 68, 0.04)',
        soft: '0 2px 12px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'arch': '2.5rem',
      }
    },
  },
  plugins: [],
}
