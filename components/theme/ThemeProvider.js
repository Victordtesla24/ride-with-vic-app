/**
 * ThemeProvider Component
 * Provides a centralized theme for the RIDE WITH VIC application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create context for theme modes
const ThemeContext = createContext({
  toggleColorMode: () => {},
  mode: 'light',
});

// Use the theme context
export const useTheme = () => useContext(ThemeContext);

// Define theme settings
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode
          primary: {
            main: '#3498db',
            light: '#5dade2',
            dark: '#2980b9',
            contrastText: '#fff',
          },
          secondary: {
            main: '#2ecc71',
            light: '#58d68d',
            dark: '#27ae60',
            contrastText: '#fff',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: '#2c3e50',
            secondary: '#7f8c8d',
          },
          success: {
            main: '#2ecc71',
            light: '#58d68d',
            dark: '#27ae60',
          },
          warning: {
            main: '#f39c12',
            light: '#f5b041',
            dark: '#d68910',
          },
          error: {
            main: '#e74c3c',
            light: '#ec7063',
            dark: '#c0392b',
          },
          info: {
            main: '#3498db',
            light: '#5dade2',
            dark: '#2980b9',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Dark mode
          primary: {
            main: '#3498db',
            light: '#5dade2',
            dark: '#2980b9',
            contrastText: '#fff',
          },
          secondary: {
            main: '#2ecc71',
            light: '#58d68d',
            dark: '#27ae60',
            contrastText: '#fff',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ecf0f1',
            secondary: '#bdc3c7',
          },
          success: {
            main: '#2ecc71',
            light: '#58d68d',
            dark: '#27ae60',
          },
          warning: {
            main: '#f39c12',
            light: '#f5b041',
            dark: '#d68910',
          },
          error: {
            main: '#e74c3c',
            light: '#ec7063',
            dark: '#c0392b',
          },
          info: {
            main: '#3498db',
            light: '#5dade2',
            dark: '#2980b9',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.2,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        containedPrimary: ({ theme }) => ({
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        outlinedPrimary: ({ theme }) => ({
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});

export default function ThemeProvider({ children }) {
  // Use localStorage to persist theme mode
  const [mode, setMode] = useState('light');

  // Initialize mode from localStorage on client side
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Create theme based on current mode
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ toggleColorMode, mode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
} 