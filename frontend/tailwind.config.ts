import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F7F6FB',
        surface: '#FFFFFF',
        'surface-hover': '#F3F0FA',
        border: '#E8E6EF',
        primary: {
          50: '#F5F0FF',
          100: '#EEE7FF',
          200: '#D8C7FF',
          500: '#6E32E3',
          600: '#5925BC',
          700: '#471A9B',
          800: '#37127C',
        },
        accent: {
          orange: '#FC9F0A',
          pink: '#F4569E',
          blue: '#3B82F6',
          emerald: '#10B981',
        },
        heading: '#151515',
        subtext: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        card: '0 4px 12px -2px rgba(89, 37, 188, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        floating: '0 10px 25px -5px rgba(89, 37, 188, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};

export default config;
