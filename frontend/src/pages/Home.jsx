import React from 'react';
import { Box, Typography, Button, Grid, Paper, Container, AppBar, Toolbar } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

// Allow scrolling on the Home page

const features = [
  {
    icon: <AnalyticsIcon sx={{ fontSize: 36, color: '#00d1b2' }} />,
    title: 'Error Analysis',
    desc: 'Upload your shooting images for instant ML-powered feedback. Get detailed analysis of your form and technique with personalized improvement suggestions.'
  },
  {
    icon: <PlayCircleOutlineIcon sx={{ fontSize: 36, color: '#00d1b2' }} />,
    title: 'Interactive Training',
    desc: 'Engage with interactive drills and exercises designed to improve your accuracy and consistency.'
  }
];

export default function Home() {
  const [scrollY, setScrollY] = React.useState(0);
  const threshold = 100; // Lowered threshold for earlier animation
  const maxTranslate = 150; // Reduced for less distance
  const centerStop = 0.5; // Center of viewport

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Animation Progress Values ---
  // Heading fades and moves up from scrollY = 0 to headingFadeEnd
  const headingFadeStart = 0;
  const headingFadeEnd = 15; // Extremely fast fade, minimal scroll
  const headingProgress = Math.max(0, Math.min(1, (scrollY - headingFadeStart) / (headingFadeEnd - headingFadeStart)));

  // Define vh before any use
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Cards animate from 200px below center to center
  const cardsScrollRange = 120;
  const cardsStart = headingFadeEnd - 20;
  const cardsEnd = cardsStart + cardsScrollRange;
  const cardsProgress = Math.max(0, Math.min(1, (scrollY - cardsStart) / (cardsEnd - cardsStart)));
  let forceHideCards = scrollY <= 1;
  let cardsTranslateY, cardsOpacity;
  if (forceHideCards) {
    cardsTranslateY = 40;
    cardsOpacity = 0;
  } else if (scrollY <= cardsStart) {
    cardsTranslateY = 40;
    cardsOpacity = 0;
  } else {
    cardsTranslateY = (1 - cardsProgress) * 40;
    cardsTranslateY = Math.max(cardsTranslateY, 0);
    cardsOpacity = cardsProgress;
  }

  // --- Heading Animation ---
  let headingTranslateY = -headingProgress * (vh * 0.25); // Move up by 25% of viewport
  let headingOpacity = 1 - headingProgress;
  const headingFixed = headingProgress < 1;
  const headingStatic = headingProgress >= 1;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        background: 'none',
        '::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {/* Full viewport background image */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          background: 'url(/home.jpg) center center / cover no-repeat',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Dark overlay for better text visibility */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          background: 'rgba(15,17,22,0.7)',
          pointerEvents: 'none',
        }}
      />
      {/* Main content overlay */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100vw',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 0,
          background: 'none',
          transition: 'justify-content 0.5s, padding-top 0.5s',
          overflow: 'hidden',
          px: 0,
          mx: 0,
        }}
      >
        {/* Centered heading and subheading */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 2,
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: headingOpacity,
            transform: `translateY(${headingTranslateY}px)`,
            transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)',
            mt: '15vh',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '3.5rem', sm: '5rem', md: '7rem' },
              letterSpacing: 8,
              color: '#fff',
              textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 0 2px #000, 0 0 8px #000',
              WebkitTextStroke: '1px rgba(0,0,0,0.25)',
              mb: 1,
              textTransform: 'uppercase',
            }}
          >
            SNYPTR
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 400,
              letterSpacing: 4,
              mb: 2,
              textShadow: '0 2px 12px rgba(0,0,0,0.25)',
              fontSize: { xs: '1.2rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            INNOVATIVE SHOOTING SOLUTIONS
          </Typography>
        </Box>
        {/* Features on top of background, only show after scroll */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 0,
            opacity: cardsOpacity,
            position: 'relative',
            zIndex: 2,
            transform: `translateY(${cardsTranslateY}px)`,
            transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
            minHeight: cardsOpacity > 0 ? '60vh' : 0,
            pointerEvents: cardsOpacity > 0.5 ? 'auto' : 'none',
            mt: 0,
            ...(forceHideCards && { opacity: 0, pointerEvents: 'none' }),
            px: 2,
            mx: 0,
          }}
        >
          <Grid container spacing={6} justifyContent="center" sx={{ maxWidth: 1200, width: '100%', m: 0, px: { xs: 1, sm: 2, md: 4 }, mx: 'auto' }}>
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 8,
                    p: 7,
                    minWidth: 350 ,
                    maxWidth: 410,
                    minHeight: 230,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'rgba(0, 0, 0, 1)',
                    color: '#fff',
                    boxShadow: '0 12px 48px 0 rgba(0,0,0,0.9)',
                    border: '2px solid #222',
                    transition: 'box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      boxShadow: '0 8px 32px 0 rgba(0,209,178,0.7)',
                      transform: 'translateY(-6px) scale(1.03)',
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#fff', fontSize: '1.7rem', textAlign: 'left' }}>{feature.title}</Typography>
                  <Typography sx={{ color: '#fff', fontWeight: 400, fontSize: '1.2rem', textAlign: 'left' }}>{feature.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}