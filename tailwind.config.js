/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        surface: '#0B0B0B',
        card: '#111111',
        'card-hover': '#1a1a1a',
        border: '#222222',
        'text-primary': '#FFFFFF',
        'text-secondary': '#888888',
        'text-muted': '#555555',
        'accent-green': '#4ADE80',
        'accent-blue': '#60A5FA',
        'accent-yellow': '#FACC15',
        'accent-red': '#F87171',
        'accent-purple': '#A78BFA',
        'accent-orange': '#FB923C',
        'accent-pink': '#F472B6',
        'task-olive': '#2D3B2D',
        'task-brown': '#3B2D2D',
        'task-charcoal': '#1E1E2E',
        'task-dark': '#1A1A2E',
        'task-teal': '#1A2E2E',
        'task-purple': '#2D1A3B',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'btn': '14px',
        'input': '12px',
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.6)',
        'glow-green': '0 0 20px rgba(74, 222, 128, 0.15)',
        'glow-blue': '0 0 20px rgba(96, 165, 250, 0.15)',
        'dropdown': '0 16px 48px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
