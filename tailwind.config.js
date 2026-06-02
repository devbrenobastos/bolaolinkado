/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#0D0D0D',
        surface01: '#151515',
        surface02: '#1D1D1D',
        surfaceHover: '#262626',
        primaryOrange: '#FF7A00',
        hoverOrange: '#FF8C1A',
        pressedOrange: '#E86D00',
        successColor: '#2ECC71',
        warningColor: '#F1C40F',
        dangerColor: '#FF4D4D',
        infoColor: '#3B82F6',
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        lg: '24px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 0 0 1px rgba(255,122,0,.1), 0 10px 30px rgba(255,122,0,.08)',
        card: '0 4px 20px rgba(0,0,0,.25)',
      }
    },
  },
  plugins: [],
}

