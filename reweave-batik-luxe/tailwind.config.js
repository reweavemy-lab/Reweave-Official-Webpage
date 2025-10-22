/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Batik Luxe Palette
        indigo: '#1A2741',
        sand: '#E5D6BF',
        sage: '#9BA48C',
        brown: '#3A2E27',
        gold: '#C4A96A',
        terracotta: '#8C4B36',
        ivory: '#FAF7F2',
        pebble: '#B1ABA2',
        navy: '#0E1824',
        text: '#2E2B28',
      },
      fontFamily: {
        display: ['Canela', 'Neue Haas Grotesk Display', 'serif'],
        body: ['Inter', 'Public Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 10px rgba(0,0,0,0.05)',
        medium: '0 8px 25px rgba(0,0,0,0.1)',
        strong: '0 12px 40px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'batik-pattern': "url('/images/batik-pattern.svg')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
