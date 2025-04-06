import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from 'lib/createEmotionCache';
import { lightTheme, darkTheme } from 'lib/theme';
import AppThemeProvider from 'components/theme/ThemeProvider';
import Layout from 'components/layout/Layout';
import 'styles/globals.css';

// Client-side cache for emotion, shared for the whole session
const clientSideEmotionCache = createEmotionCache();

function MyApp({ Component, emotionCache = clientSideEmotionCache, pageProps }) {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;

  // Ensure theme is applied after hydration to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
    
    // Check for user preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (!savedTheme) {
      // Check for system preference if no saved theme
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  // Toggle theme function to pass to components
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  // Add theme to the context that will be available to all components
  const contextValue = {
    darkMode,
    toggleTheme
  };

  // Use getLayout from the page if available, or use the default Layout
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Ride with Vic</title>
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon */}
        <CssBaseline />
        {mounted && (
          <AppThemeProvider>
            {getLayout(<Component {...pageProps} themeContext={contextValue} />)}
          </AppThemeProvider>
        )}
      </ThemeProvider>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp; 