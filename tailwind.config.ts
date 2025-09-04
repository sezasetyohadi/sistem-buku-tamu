import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom brand primary blue colors based on the project
        primary: {
          50: '#EBF4FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3D5DC3', // Main brand color
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        // Secondary orange color scheme found in project
        secondary: {
          50: '#FEF3E2',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F29442', // Main secondary color
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Success green color scheme from project
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E', // Main success color
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        // Warning amber color scheme
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Main warning color
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        // Error red color scheme
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444', // Main error color
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        // Admin specific colors
        admin: {
          blue: '#EBF4FF',
          orange: '#FEF3E2',
          green: '#F0FDF4',
          gray: '#F9FAFB',
        },
        // Dark mode specific colors
        dark: {
          background: '#0a0a0a',
          surface: '#1a1a1a',
          border: '#333333',
          primary: '#3b82f6',
          secondary: '#f97316',
          text: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
          },
          card: '#1f1f1f',
          hover: '#2a2a2a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'header-gradient': 'linear-gradient(135deg, #3D5DC3 0%, #2563EB 50%, #1D4ED8 100%)',
        'cta-gradient': 'linear-gradient(135deg, #3D5DC3 0%, #2563EB 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3D5DC3, #2563EB)',
        'gradient-green': 'linear-gradient(135deg, #22C55E, #16A34A)',
        'gradient-orange': 'linear-gradient(135deg, #F29442, #EA580C)',
        'gradient-amber': 'linear-gradient(135deg, #F59E0B, #D97706)',
        'gradient-red': 'linear-gradient(135deg, #EF4444, #DC2626)',
        'gradient-blue-light': 'linear-gradient(135deg, rgba(61, 93, 195, 0.1), rgba(37, 99, 235, 0.1))',
        'gradient-green-light': 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))',
        'gradient-orange-light': 'linear-gradient(135deg, rgba(242, 148, 66, 0.1), rgba(234, 88, 12, 0.1))',
      },
    },
  },
  plugins: [],
}

export default config