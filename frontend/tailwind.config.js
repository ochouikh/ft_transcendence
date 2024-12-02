/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        third: 'var(--third-color)',
        dark: 'var(--dark-color)',
        bg: 'var(--bg-color)',
        white: 'var(--white-color)',
        gray1: 'var(--gray-shade1)',
        gray2: 'var(--gray-shade2)',
        gray3: 'var(--gray-shade3)',
        gray4: 'var(--gray-shade4)',
        black: 'var(--black-color)',
        invalid: 'var(--invalid-color)',
        border: 'var(--border-color)',
        border2: 'var(--border-color2)',
      },
      screens: {
        smh: {'raw': '(min-height: 800px)'},
        'mobile': '400px',
      },
      backgroundImage: {
        'login': "url('/images/warrior.png')",
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'bottom': '0px 4px 4px 0px rgba(0, 0, 0, 0.5)',
        'right': '4px 0px 4px 0px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
