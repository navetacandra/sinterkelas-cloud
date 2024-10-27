/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,svelte}",
  ],
  darkMode: 'class', // Mengaktifkan mode gelap berbasis kelas
  theme: {
    extend: {
      colors: {
        light: {
          background: '#EFEFEF',
          primary: '#87CEEB',
          accent1: '#FFD700',
          accent2: '#FFB6C1',
        },
        dark: {
          background: '#2C2C2C',
          primary: '#1E90FF',
          accent1: '#32CD32',
          accent2: '#8A2BE2',
        },
      },
    },
  },

  plugins: [],
}

