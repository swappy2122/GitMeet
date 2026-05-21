module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        backgroundDeep: '#0B0F19',
        surfaceCard: '#161B22',
        borderNeutral: '#30363D',
        accentPrimary: '#00F2FE',
        accentGreen: '#4AF2A1',
        textCyan: '#E6FBFF'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      borderRadius: {
        xl: '12px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};