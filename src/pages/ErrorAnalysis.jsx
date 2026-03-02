import React, { useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Container } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

function ErrorAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/analyze', formData);
      setResult(response.data);
    } catch (err) {
      setError('Error analyzing image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      color: '#ffffff',
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'center',
      textShadow: '0 0 5px #ffffff, 0 0 20px #000, 0 0 30px #000',
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/error-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1,
          zIndex: -2,
        }}
      />

      <Container maxWidth="md">
        <div>
          <Typography
            variant="h2"
            align="center"
            className="fade-in-on-load"
            sx={{
              fontSize: { xs: '2rem', sm: '2.7rem', md: '3.2rem' },
              fontWeight: 800,
              mb: 3,
              letterSpacing: 6,
              color: '#eaeaea',
              background: 'linear-gradient(90deg, #ff4c29 0%, #00d1b2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 12px rgba(0,0,0,0.35)',
              fontFamily: 'Montserrat, Inter, Roboto, Helvetica, Arial, sans-serif',
              textTransform: 'uppercase',
              textAlign: 'center',
              mt: { xs: 10, md: 12 },
            }}
          >
            Error Analysis
          </Typography>

          <Paper
            className="fade-in-on-load"
            sx={{
              mt: 4,
              p: 4,
              textAlign: 'center',
              bgcolor: 'rgba(26,28,34,0.95)',
              borderRadius: 3,
              boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
              color: '#eaeaea',
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                component="span"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Select Image
              </Button>
            </label>

            {preview && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
              </Box>
            )}

            {selectedFile && (
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Analyze'}
              </Button>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {result && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="h5" gutterBottom>
                  Analysis Results
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  Detected Error: {result.category}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                  Issue Description:
                </Typography>
                <Typography variant="body1" paragraph>
                  {result.description}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Recommended Solution:
                </Typography>
                <Typography variant="body1">
                  {result.solution}
                </Typography>
              </Box>
            )}
          </Paper>
        </div>
      </Container>
    </Box>
  );
}

export default ErrorAnalysis;