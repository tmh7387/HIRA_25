/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  safelist: [
    {
      pattern: /bg-(primary|secondary|accent|neutral)-(main|hover|light|dark)/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /text-(primary|secondary|accent|neutral)-(main|hover|light|dark)/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /border-(primary|secondary|accent|neutral)-(main|hover|light|dark)/,
      variants: ['hover', 'focus']
    }
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#103558',    // Prussian Blue
          hover: '#0D2A45',   // Darker Prussian Blue
          light: '#E8EDF2',   // Light Prussian Blue
          dark: '#082238'     // Darker shade for emphasis
        },
        secondary: {
          main: '#027EA7',    // Cerulean
          hover: '#026D91',   // Darker Cerulean
          light: '#E5F4F9',   // Light Cerulean
          dark: '#015E7D'     // Darker shade for emphasis
        },
        accent: {
          main: '#E58F65',    // Atomic Tangerine
          hover: '#E07C4C',   // Darker Atomic Tangerine
          light: '#FCF1EC',   // Light Atomic Tangerine
          dark: '#D66B35'     // Darker shade for emphasis
        },
        neutral: {
          main: '#6E6E6E',    // Dim Gray
          light: '#E9E8E8',   // Platinum
          lighter: '#F5F5F5', // Lighter Platinum
          dark: '#4A4A4A',    // Darker Gray
          darker: '#2C2C2C'   // Almost Black
        },
        text: {
          primary: '#103558',   // Prussian Blue for primary text
          secondary: '#6E6E6E', // Dim Gray for secondary text
          accent: '#E58F65',    // Atomic Tangerine for emphasis
          light: '#FFFFFF'      // White for contrast
        },
        background: {
          default: '#FFFFFF',   // White
          paper: '#E9E8E8',    // Platinum
        },
        border: {
          light: '#E9E8E8',    // Platinum
          main: '#6E6E6E',     // Dim Gray
          dark: '#103558'      // Prussian Blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace']
      },
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem' // 30px
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(16, 53, 88, 0.05)',
        DEFAULT: '0 4px 6px -1px rgba(16, 53, 88, 0.1)',
        md: '0 4px 6px -1px rgba(16, 53, 88, 0.1)',
        lg: '0 10px 15px -3px rgba(16, 53, 88, 0.1)',
        xl: '0 20px 25px -5px rgba(16, 53, 88, 0.1)'
      },
      borderRadius: {
        sm: '0.25rem',   // 4px
        DEFAULT: '0.375rem', // 6px
        md: '0.375rem',  // 6px
        lg: '0.5rem',    // 8px
        xl: '0.75rem',   // 12px
        '2xl': '1rem'    // 16px
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class'
    })
  ]
};
