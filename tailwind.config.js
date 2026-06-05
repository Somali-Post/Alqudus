/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#001D44',
        'navy-dark': '#00153B',
        royal: '#004CB2',
        steel: '#3D5881',
        'cool-slate': '#7E8EA6',
        'light-steel': '#C9CFDA',
        'off-white': '#F7F9FC',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 45px rgba(0, 29, 68, 0.10)',
      },
    },
  },
  plugins: [],
}
