/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 4s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'morning-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
        'afternoon-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
        'evening-gradient': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        'night-gradient': 'linear-gradient(135deg, #0f0a1e 0%, #1a0533 50%, #0d0d2b 100%)',
        'star-pattern': 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f0722 100%)',
      },
    },
  },
  plugins: [],
  safelist: [
    // Gradient from/via/to safelist for all theme packs
    {
      pattern: /^from-(violet|indigo|slate|blue|orange|green|emerald|teal|cyan|red|rose|yellow|zinc|neutral|stone|lime|purple|amber|sky|pink|fuchsia|white|black|gray)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
    {
      pattern: /^via-(violet|indigo|slate|blue|orange|green|emerald|teal|cyan|red|rose|yellow|zinc|neutral|stone|lime|purple|amber|sky|pink|fuchsia|white|black|gray)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
    {
      pattern: /^to-(violet|indigo|slate|blue|orange|green|emerald|teal|cyan|red|rose|yellow|zinc|neutral|stone|lime|purple|amber|sky|pink|fuchsia|white|black|gray)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
    // bg colors for task/reward tiles
    {
      pattern: /^bg-(emerald|rose|amber|teal|green|red|lime|orange|yellow|cyan|violet|indigo)-(700|800|900)\/(60|70|80)$/,
    },
    // border colors for task/reward tiles
    {
      pattern: /^border-(emerald|rose|amber|teal|green|red|lime|orange|yellow|cyan|violet|indigo)-(600|700)\/\d+$/,
    },
    // text colors for task/reward tiles
    {
      pattern: /^text-(emerald|rose|amber|teal|green|red|lime|orange|yellow|cyan|violet|indigo)-(100|200)$/,
    },
    // Legacy safelisted classes
    'from-yellow-400', 'to-orange-500',
    'from-blue-500', 'to-indigo-600',
    'from-violet-900', 'to-indigo-900',
    'from-slate-900', 'to-violet-950',
    'bg-green-500', 'bg-green-400', 'bg-green-600',
    'bg-red-500', 'bg-red-400', 'bg-red-600',
    'bg-amber-500', 'bg-amber-400', 'bg-amber-600',
    'bg-violet-500', 'bg-violet-600', 'bg-violet-700',
    'text-green-400', 'text-red-400', 'text-amber-400',
    'border-green-500', 'border-red-500', 'border-amber-500',
  ]
}
