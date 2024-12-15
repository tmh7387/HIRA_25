export const theme = {
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
      gradient: {
        primary: 'from-[#103558] to-[#0D2A45]',
        secondary: 'from-[#027EA7] to-[#026D91]',
        accent: 'from-[#E58F65] to-[#E07C4C]'
      }
    },
    border: {
      light: '#E9E8E8',    // Platinum
      main: '#6E6E6E',     // Dim Gray
      dark: '#103558'      // Prussian Blue
    }
  },
  typography: {
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
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem'     // 48px
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(16, 53, 88, 0.05)',
    md: '0 4px 6px -1px rgba(16, 53, 88, 0.1)',
    lg: '0 10px 15px -3px rgba(16, 53, 88, 0.1)',
    xl: '0 20px 25px -5px rgba(16, 53, 88, 0.1)'
  },
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px'
  }
};

// Common component styles using the theme colors
export const commonStyles = {
  button: {
    base: `px-6 py-3 rounded-lg font-medium transition-all duration-200
      transform hover:-translate-y-0.5 shadow-md hover:shadow-lg`,
    primary: `bg-gradient-to-r from-[${theme.colors.primary.main}] to-[${theme.colors.primary.hover}] 
      text-white hover:from-[${theme.colors.primary.hover}] hover:to-[${theme.colors.primary.dark}]`,
    secondary: `bg-gradient-to-r from-[${theme.colors.secondary.main}] to-[${theme.colors.secondary.hover}] 
      text-white hover:from-[${theme.colors.secondary.hover}] hover:to-[${theme.colors.secondary.dark}]`,
    accent: `bg-gradient-to-r from-[${theme.colors.accent.main}] to-[${theme.colors.accent.hover}] 
      text-white hover:from-[${theme.colors.accent.hover}] hover:to-[${theme.colors.accent.dark}]`
  },
  input: {
    base: `w-full px-4 py-3 rounded-lg border-2 border-[${theme.colors.neutral.light}] bg-white
      focus:ring-2 focus:ring-[${theme.colors.primary.main}] focus:border-[${theme.colors.primary.main}]
      hover:border-[${theme.colors.primary.main}] transition-all duration-200`
  },
  card: {
    base: `bg-white rounded-xl shadow-md border border-[${theme.colors.neutral.light}]
      hover:shadow-lg transition-shadow duration-200`
  },
  section: {
    base: `bg-[${theme.colors.background.paper}] p-6 rounded-xl shadow-lg`
  },
  heading: {
    base: `font-bold text-[${theme.colors.text.primary}]`
  }
};

// Helper functions
export const getGradient = (type = 'primary') => theme.colors.background.gradient[type];
export const getTextColor = (type = 'primary') => theme.colors.text[type];
export const getShadow = (size = 'md') => theme.shadows[size];
export const getSpacing = (size = 'md') => theme.spacing[size];
export const getFontSize = (size = 'base') => theme.typography.fontSize[size];
export const getBorderRadius = (size = 'lg') => theme.borderRadius[size];
