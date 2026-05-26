module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6C63FF",
          primaryDark: "#4F46E5",
          primaryLight: "#EEEDFF",
          accent: "#00D4AA",
          accentDark: "#00A884",
          secondary: "#1A1A3E",
          secondaryLight: "#2A2A4E",
          secondaryDark: "#0B0B2E",
          tertiary: "#EF4444",
        }
      }
    }
  },
  plugins: []
}
