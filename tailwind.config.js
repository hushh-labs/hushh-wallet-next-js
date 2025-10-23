/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'gilroy': ['Gilroy', 'system-ui', 'sans-serif'],
      },
      colors: {
        'ink': '#000000',
        'paper': '#ffffff',
        'muted': '#6b7280',
      },
      animation: {
        'fade-up': 'fadeUp 0.25s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
