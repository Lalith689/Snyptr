import React, { useMemo, useCallback, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, useTheme, useMediaQuery, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AudioPlayer from './components/AudioPlayer';
import CrosshairSplash from './components/CrosshairSplash';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './pageTransitions.css';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const ErrorAnalysis = React.lazy(() => import('./pages/ErrorAnalysis'));
const LaserTracking = React.lazy(() => import('./pages/LaserTracking'));
const ContactUs = React.lazy(() => import('./pages/ContactUs'));

// Loading component
const PageLoader = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      color: '#eaeaea'
    }}
  >
    <Typography variant="h6">Loading...</Typography>
  </Box>
);

const NavButton = React.memo(({ to, children }) => {
  const navigate = useNavigate();

  const handleClick = useCallback((e) => {
    e.preventDefault();
    if (window.playNavSound) {
      window.playNavSound();
    }
    navigate(to);
  }, [navigate, to]);

  return (
    <Button
      component="a"
      href={to}
      onClick={handleClick}
      sx={{
        color: '#eaeaea',
        background: 'none',
        boxShadow: 'none',
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 600,
        px: 2,
        mx: 0.5,
        borderRadius: 2,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          color: '#ff4c29',
          background: 'rgba(255, 76, 41, 0.1)',
          transform: 'translateY(-1px)',
        },
        '&:last-of-type': {
          mr: 2.5,
        },
      }}
    >
      {children}
    </Button>
  );
});

NavButton.displayName = 'NavButton';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleNavClick = useCallback((to) => {
    if (window.playNavSound) {
      window.playNavSound();
    }
    navigate(to);
    setMobileOpen(false);
  }, [navigate]);

  const navigationItems = useMemo(() => [
    { path: '/', label: 'Home' },
    { path: '/error-analysis', label: 'Error Analysis' },
    { path: '/contact-us', label: 'Contact Us' }
  ], []);

  const drawer = useMemo(() => (
    <List>
      {navigationItems.map((item) => (
        <ListItem 
          button 
          key={item.path}
          onClick={() => handleNavClick(item.path)}
          sx={{
            color: '#ffffff',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 76, 41, 0.1)',
              transform: 'translateX(-4px)',
            }
          }}
        >
          <ListItemText primary={item.label} />
        </ListItem>
      ))}
    </List>
  ), [navigationItems, handleNavClick]);

  const handleLogoClick = useCallback((e) => {
    e.preventDefault();
    handleNavClick('/');
  }, [handleNavClick]);

  return (
    <>
      {showSplash && <CrosshairSplash onFinish={() => setShowSplash(false)} />}
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#0f1116',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <AudioPlayer />
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#0f1116',
            zIndex: 0,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <AppBar 
            position="fixed"
            sx={{
              bgcolor: 'rgba(15,17,22,0.85)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.3)',
              border: 'none',
              zIndex: 1200,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Toolbar sx={{ px: 0, minHeight: { xs: 64, md: 80 }, display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', pl: 0, ml: { xs: 2, md: 4 } }}>
                <Typography
                  component="a"
                  href="/"
                  onClick={handleLogoClick}
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 900,
                    fontSize: { xs: '2rem', md: '2.7rem' },
                    letterSpacing: '3px',
                    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
                    background: 'linear-gradient(90deg, #ff4c29 0%, #00d1b2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 12px rgba(0,0,0,0.35)',
                    cursor: 'pointer',
                    ml: 0,
                    lineHeight: 1.1,
                    pl: 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      filter: 'brightness(1.1)',
                    }
                  }}
                >
                  SNYPTR
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 0 }}>
                {isMobile ? (
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ 
                      color: '#ffffff',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                ) : (
                  <Box>
                    {navigationItems.map((item) => (
                      <NavButton key={item.path} to={item.path}>
                        {item.label}
                      </NavButton>
                    ))}
                  </Box>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          <Drawer
            variant="temporary"
            anchor="right"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                bgcolor: 'rgba(26,28,34,0.95)',
                color: '#eaeaea',
                borderLeft: '1px solid #ff4c29',
                backdropFilter: 'blur(12px)',
                width: 280,
              },
            }}
          >
            {drawer}
          </Drawer>

          <Toolbar />
          <Container component="main" layout maxWidth="lg" sx={{ position: 'relative', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <TransitionGroup>
              <CSSTransition key={location.pathname} classNames="fade-page" timeout={400}>
                <div className="fade-page">
                  <React.Suspense fallback={<PageLoader />}>
                    <Routes location={location}>
                      <Route path="/" element={<Home />} />
                      <Route path="/error-analysis" element={<ErrorAnalysis />} />
                      <Route path="/contact-us" element={<ContactUs />} />
                    </Routes>
                  </React.Suspense>
                </div>
              </CSSTransition>
            </TransitionGroup>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default React.memo(App);