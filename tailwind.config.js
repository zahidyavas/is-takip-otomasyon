/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-main': '#0f1115',  // Ekran görüntüsündeki ana arka plan
        'dark-card': '#0f1520',  // Sidebar ve Kart rengi
        'dark-border': '#2a3142', // İnce gri çizgiler
        'brand-green': '#10b981', // Yeşil vurgu rengi
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark"], // Sadece dark tema
  },
}