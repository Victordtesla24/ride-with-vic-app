import PropTypes from 'prop-types';
import Head from 'next/head';
import { CacheProvider, ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import createEmotionCache from 'components/theme/createEmotionCache';
import theme from 'components/theme/theme';
import AppThemeProvider from 'components/theme/ThemeProvider';
import Layout from 'components/layout/Layout';

// Client-side cache for emotion, shared for the whole session
const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ride with Vic</title>
      </Head>
      <AppThemeProvider>
        <EmotionThemeProvider theme={theme}>
          <CssBaseline />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </EmotionThemeProvider>
      </AppThemeProvider>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
}; 