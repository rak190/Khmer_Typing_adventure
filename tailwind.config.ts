import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#28B463',
        adventure: '#1E78E6',
        gold: '#FFC107',
        purple: '#7C4DFF',
        coral: '#FF5A5F',
        sky: '#EBF6FF',
        mint: '#D9F7E9',
        stone: '#F2F4F7',
        slateGame: '#263238',
        ink: '#111827',
      },
      fontFamily: {
        display: ['Moul', 'Kantumruy Pro', 'serif'],
        khmer: ['Noto Sans Khmer', 'Kantumruy Pro', 'Battambang', 'sans-serif'],
        sans: ['Nunito', 'Inter', 'Noto Sans Khmer', 'sans-serif'],
      },
      boxShadow: {
        game: '0 16px 34px rgba(8, 54, 112, 0.18)',
        button: 'inset 0 -5px 0 rgba(0,0,0,.18), 0 9px 18px rgba(0,0,0,.2)',
        glow: '0 0 0 5px rgba(40, 180, 99, .18), 0 0 28px rgba(40, 180, 99, .6)',
      },
      backgroundImage: {
        'sky-radial':
          'radial-gradient(circle at 18% 18%, rgba(255,255,255,.9) 0 8%, transparent 20%), linear-gradient(180deg, #20A7F3 0%, #BFEFFF 55%, #EBF6FF 100%)',
        'jungle-night':
          'radial-gradient(circle at 50% 32%, rgba(20, 172, 209, .58), transparent 32%), linear-gradient(145deg, #06233C 0%, #073B37 55%, #03131D 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
