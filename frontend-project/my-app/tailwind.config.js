export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shake': 'shake 0.2s ease-in-out 0s 2',
      }
    },
  },
  plugins: [],
}

