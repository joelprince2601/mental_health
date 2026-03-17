import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff4500', // Reddit orange
      light: '#ff6a33',
      dark: '#cc3700',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
      light: '#e5e7eb',
      dark: '#cbd5e1',
      contrastText: '#000000',
    },
    background: {
      default: '#0b0b0b',
      paper: '#111213',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cbd5e1',
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    divider: 'rgba(255,255,255,0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0b0b0b',
          color: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
        },
        containedPrimary: {
          color: '#ffffff',
        },
        outlinedPrimary: {
          borderColor: 'rgba(255, 69, 0, 0.6)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        colorPrimary: {
          backgroundColor: '#111213',
          color: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111213',
          color: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#151618',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(255,69,0,0.16)',
            '&:hover': { backgroundColor: 'rgba(255,69,0,0.22)' },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        barColorPrimary: { backgroundColor: '#ff4500' },
      },
    },
  },
})

export default theme
