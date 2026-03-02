import React from 'react';
import { Box, Typography, Grid, IconButton, Paper, useTheme, useMediaQuery, Container } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

function ContactUs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const socialLinks = [
    {
      icon: <InstagramIcon sx={{ fontSize: 40 }} />,
      label: 'Instagram',
      url: 'https://instagram.com/snyptr',
      color: '#E1306C'
    },
    {
      icon: <FacebookIcon sx={{ fontSize: 40 }} />,
      label: 'Facebook',
      url: 'https://facebook.com/snyptr',
      color: '#4267B2'
    },
    {
      icon: <LinkedInIcon sx={{ fontSize: 40 }} />,
      label: 'LinkedIn',
      url: 'https://linkedin.com/company/snyptr',
      color: '#0077B5'
    },
    {
      icon: <TwitterIcon sx={{ fontSize: 40 }} />,
      label: 'Twitter',
      url: 'https://twitter.com/snyptr',
      color: '#1DA1F2'
    },
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      label: 'Email',
      url: 'mailto:contact@snyptr.com',
      color: '#D44638'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      label: 'Phone',
      url: 'tel:+1234567890',
      color: '#25D366'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      color: '#ffffff',
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'center',
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/contact-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.2,
          zIndex: -1,
        }}
      />

      <Container maxWidth="md">
        <div>
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            className="fade-in-on-load"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.7rem', md: '3.2rem' },
              letterSpacing: 6,
              color: '#eaeaea',
              background: 'linear-gradient(90deg, #ff4c29 0%, #00d1b2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 12px rgba(0,0,0,0.35)',
              fontFamily: 'Montserrat, Inter, Roboto, Helvetica, Arial, sans-serif',
              textTransform: 'uppercase',
              mb: 4,
              textAlign: 'center',
              mt: { xs: 10, md: 12 },
            }}
          >
            Contact Us
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {socialLinks.map((link, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Paper
                  className="fade-in-on-load"
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'rgba(26,28,34,0.95)',
                    borderRadius: 3,
                    boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
                    color: '#eaeaea',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <IconButton
                    sx={{
                      color: link.color,
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {link.icon}
                  </IconButton>
                  <Typography
                    variant="h6"
                    sx={{
                      mt: 1,
                      color: '#ffffff',
                      fontFamily: '"Harlow Solid Italic", "Roboto", sans-serif',
                      fontStyle: 'italic',
                      filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3))',
                    }}
                  >
                    {link.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                color: '#ff0000',
                fontFamily: '"Harlow Solid Italic", "Roboto", sans-serif',
                fontStyle: 'italic',
                mb: 2,
                filter: 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))',
              }}
            >
              Get in Touch
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#ffffff',
                maxWidth: '600px',
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3))',
              }}
            >
              We'd love to hear from you! Whether you have questions about our technology,
              want to collaborate, or just want to say hello, feel free to reach out through
              any of our social media channels or contact methods above.
            </Typography>
          </Box>
        </div>
      </Container>
    </Box>
  );
}

export default ContactUs; 