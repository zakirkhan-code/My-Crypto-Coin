/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.{css}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7e7',
          400: '#f59e0b',
          500: '#d97706',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        yellow: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626',
        },
        purple: {
          900: '#581c87',
        }
      },
      backdropBlur: {
        'lg': '16px',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-gradient-to-br',
    'from-blue-900',
    'to-purple-900',
    'from-gray-900',
    'to-blue-900',
    'bg-white/10',
    'backdrop-blur-lg',
    'animate-spin',
  ]
}