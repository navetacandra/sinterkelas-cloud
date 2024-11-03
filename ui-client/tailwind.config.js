/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,svelte}"],
  darkMode: "class", // Mengaktifkan mode gelap berbasis kelas
  theme: {
    extend: {
      animation: {
        "cursor-blink": "cursorBlink 0.5s linear infinite",
        "slide-left-in": "slideLeftIn 0.3s ease-out",
        "slide-bottom-in": "slideBottomtIn 0.3s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        cursorBlink: {
          "0%": { "border-right": "2px solid" },
          "50%": { "border-right": "2px solid transparent" },
          "100%": { "border-right": "2px solid" },
        },
        slideLeftIn: {
          "0%": { transform: "translateX(200%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideBottomtIn: {
          "0%": { transform: "translateY(-200%)" },
          "100%": { transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
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
