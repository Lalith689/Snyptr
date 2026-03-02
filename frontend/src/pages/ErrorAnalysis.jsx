import React, { useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Container, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

// Error descriptions and solutions
const errorDetails = {
  'acute_angle_trigger': {
    title: 'Acute Angle Trigger',
    description: 'Trigger finger is at an acute angle during the trigger press. This can cause lateral deviation and accuracy issues.',
    solution: 'Keep your trigger finger straight and perpendicular to the trigger. Practice smooth, straight-back trigger presses without disturbing your grip.'
  },
  'breath_control': {
    title: 'Breath Control',
    description: 'Improper breathing technique detected. Breathing during the shot can cause movement and affect accuracy.',
    solution: 'Take a deep breath, let it out halfway, hold your breath, then take the shot. Avoid holding your breath too long.'
  },
  'early_recoil': {
    title: 'Early Recoil',
    description: 'Anticipating recoil before the shot is fired. This causes flinching and impacts accuracy significantly.',
    solution: 'Maintain a stable stance and relax your shoulders. Practice dry-fire drills to become accustomed to the trigger reset without anticipating movement.'
  },
  'frontsight_dip': {
    title: 'Front Sight Dip',
    description: 'Front sight dips during or before the trigger break. This indicates loss of focus or trigger control.',
    solution: 'Focus on the front sight throughout the entire shooting sequence. Maintain sight picture until the shot breaks.'
  },
  'overtight_grip': {
    title: 'Overtight Grip',
    description: 'Grip tension is too high, causing hand fatigue and potential accuracy degradation. This can also induce flinching.',
    solution: 'Use a firm but relaxed grip. Your grip pressure should be firm enough to control the weapon but not cause hand fatigue. Practice finding your natural grip pressure.'
  },
  'stance_position': {
    title: 'Stance Position',
    description: 'Body stance is not optimal for stability and control. This affects recoil management and shot consistency.',
    solution: 'Adopt a strong isosceles or weaver stance. Keep feet shoulder-width apart, knees slightly bent, and lean slightly into the weapon. Distribute your weight evenly.'
  },
  'to and fro motion': {
    title: 'To and Fro Motion',
    description: 'Unnecessary back-and-forth movement detected during the shot sequence. This indicates instability or improper breathing.',
    solution: 'Maintain a rock-solid stance. Focus on smooth trigger control without any body movement. Practice balancing breathing with shot execution.'
  }
};

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
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = baseUrl.replace(/\/$/, '') + '/api/analyze';
      console.log('Calling API at:', url);
      const response = await axios.post(url, formData);
      console.log('API Response:', response.data);
      setResult(response.data);
    } catch (err) {
      setError('Error analyzing image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const topError = result && result.error_predictions && result.error_predictions.length > 0
    ? result.error_predictions[0]
    : null;

  const errorDetail = topError ? errorDetails[topError.error_type] : null;

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
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
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

            {loading && (
              <Box sx={{ mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Analyzing image...</Typography>
              </Box>
            )}

            {result && !loading && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="h5" sx={{ mb: 3, color: '#00d1b2', fontWeight: 'bold' }}>
                  Analysis Results
                </Typography>

                {/* Stance Score */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Overall Stance Score: <strong>{(result.stance_score * 100).toFixed(1)}%</strong>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={result.stance_score * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 76, 41, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'linear-gradient(90deg, #ff4c29 0%, #00d1b2 100%)',
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>

                {/* Top Error */}
                {topError && errorDetail && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 3, 
                    bgcolor: 'rgba(255, 76, 41, 0.1)',
                    borderLeft: '4px solid #ff4c29',
                    borderRadius: 2
                  }}>
                    <Typography variant="h6" sx={{ color: '#ff4c29', mb: 1 }}>
                      Primary Error Detected
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {errorDetail.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: '#00d1b2' }}>
                      Confidence: <strong>{(topError.confidence * 100).toFixed(1)}%</strong>
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, color: '#eaeaea' }}>
                      Issue Description:
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ color: '#aaaaaa' }}>
                      {errorDetail.description}
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, color: '#eaeaea' }}>
                      Recommended Solution:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaaaaa' }}>
                      {errorDetail.solution}
                    </Typography>
                  </Box>
                )}

                {/* Other Errors */}
                {result.error_predictions && result.error_predictions.length > 1 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#00d1b2' }}>
                      Other Detected Issues
                    </Typography>
                    {result.error_predictions.slice(1).map((err, idx) => (
                      <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'rgba(0, 209, 178, 0.1)', borderRadius: 2 }}>
                        <Typography variant="body2">
                          <strong>{errorDetails[err.error_type]?.title || err.error_type}:</strong> {(err.confidence * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </div>
      </Container>
    </Box>
  );
}

export default ErrorAnalysis;