import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ThemeProvider from '../components/theme/ThemeProvider';
import Layout from '../components/layout/Layout';

export default function MyApp(props) {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  // Use getLayout from the page if available, or use the default Layout
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <title>RIDE WITH VIC</title>
      </Head>
      <ThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {getLayout(<Component {...pageProps} />)}
        </LocalizationProvider>
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}; 