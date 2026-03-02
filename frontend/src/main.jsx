import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff4c29',
      light: '#ff7034',
      dark: '#c2331a',
    },
    secondary: {
      main: '#00d1b2',
    },
    background: {
      default: '#0f1116',
      paper: '#1a1c22',
    },
    text: {
      primary: '#eaeaea',
      secondary: 'rgba(234, 234, 234, 0.7)',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      color: '#eaeaea',
    },
    h2: {
      fontWeight: 600,
      color: '#eaeaea',
    },
    h3: {
      fontWeight: 600,
      color: '#eaeaea',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #ff4c29 0%, #ff7034 100%)',
          color: '#eaeaea',
          transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), background 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: 'none',
          '&:hover': {
            background: 'linear-gradient(90deg, #ff7034 0%, #ff4c29 100%)',
            color: '#fff',
            transform: 'scale(1.07)',
            boxShadow: '0 4px 20px 0 rgba(255,76,41,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1c22',
          color: '#eaeaea',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1c22',
          color: '#eaeaea',
          border: '1px solid #23242a',
          boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#00d1b2',
          '&:hover': {
            color: '#ff4c29',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f1116',
          color: '#eaeaea',
          scrollbarColor: '#ff4c29 #1a1c22',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: '#ff4c29',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            borderRadius: '4px',
            backgroundColor: '#1a1c22',
          },
        },
        // Animations
        '@global': {
          '.fade-in-on-scroll': {
            opacity: 0,
            transform: 'translateY(40px)',
            transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)',
          },
          '.fade-in-on-scroll.visible': {
            opacity: 1,
            transform: 'none',
          },
          '.fade-in-on-load': {
            opacity: 0,
            animation: 'fadeInLoad 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
          },
          '@keyframes fadeInLoad': {
            '0%': { opacity: 0, transform: 'translateY(40px)' },
            '100%': { opacity: 1, transform: 'none' },
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);