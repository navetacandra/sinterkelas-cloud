/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,svelte}"],
  darkMode: "class", // Mengaktifkan mode gelap berbasis kelas
  theme: {
    extend: {
      boxShadow: {
        "neo-sm": "2px 4px 0px #000",
        neo: "4px 6px 0px #000",
      },
      colors: {
        cyan: "#87CEEB",
        green: "#90EE90",
        yellow: "#F4D738",
        orange: "#FF7A5C",
        pink: "#FFB2EF",
        purple: "#A388EE",
        darker: {
          cyan: "#69D2E7",
          green: "#7FBC8C",
          yellow: "#E3A018",
          orange: "#FF6B6B",
          pink: "#FF69B4",
          purple: "#9723C9",
        },
      },
    },
  },

  plugins: [],
};
