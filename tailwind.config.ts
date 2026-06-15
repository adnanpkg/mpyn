import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#0F0F0F',
        elevated: '#1A1A1A',
        border: '#2A2A2A',
        text: '#FFFFFF',
        muted: '#888888',
        dim: '#444444',
        shimmer1: '#1A1A1A',
        shimmer2: '#2A2A2A',
      },
      borderRadius: {
        card: '20px',
        pill: '100px',
        input: '14px',
        sheet: '24px 24px 0 0',
      },
      fontFamily: {
        heading: ['var(--font-figtree)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      maxWidth: {
        app: '480px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
};
export default config;
