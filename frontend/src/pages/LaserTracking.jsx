import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, Alert, Grid, Slider, IconButton, Select, MenuItem, FormControl, InputLabel, Container } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import SettingsIcon from '@mui/icons-material/Settings';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FiberManualRecordOutlinedIcon from '@mui/icons-material/FiberManualRecordOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

// Constants
const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 768;
const TARGET_CENTER_X = SCREEN_WIDTH / 2;
const TARGET_CENTER_Y = SCREEN_HEIGHT / 2;
const BULL_RADIUS = 30;
const TARGET_RADIUS = 200;
const RING_WIDTH = 19;

function LaserTracking() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [laserDetected, setLaserDetected] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [laserThreshold, setLaserThreshold] = useState(220);
  const [minLaserArea, setMinLaserArea] = useState(5);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [ledStatus, setLedStatus] = useState({
    red: false,
    yellow: false,
    green: false
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Get available cameras when component mounts
    getAvailableCameras();
    return () => {
      stopStream();
    };
  }, []);

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      setError('Error accessing camera devices');
      console.error('Camera enumeration error:', err);
    }
  };

  const startStream = async () => {
    try {
      const constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
        connectWebSocket();
        drawTarget(); // Draw target when streaming starts
      }
    } catch (err) {
      setError('Error accessing camera. Please ensure camera permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsStreaming(false);
  };

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:8765');

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.laser_position) {
        processLaserPosition(data.laser_position);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Error connecting to tracking server');
    };
  };

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const processLaserPosition = (position) => {
    const distance = calculateDistance(position.x, position.y, TARGET_CENTER_X, TARGET_CENTER_Y);
    setLaserDetected(true);

    if (distance <= TARGET_RADIUS) {
      const ringNumber = 10 - Math.floor(distance / RING_WIDTH);
      const newScore = Math.max(1, ringNumber);
      setScore(newScore);

      if (distance <= BULL_RADIUS) {
        setLedStatus({ red: false, yellow: false, green: true });
      } else {
        setLedStatus({ red: false, yellow: true, green: false });
      }
    } else {
      setLedStatus({ red: true, yellow: false, green: false });
      setError('Laser outside target bounds');
      setTimeout(() => setError(null), 3000);
    }
  };

  const drawTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw target rings
    for (let i = 1; i <= 10; i++) {
      const radius = TARGET_RADIUS - (i - 1) * RING_WIDTH;
      ctx.beginPath();
      ctx.arc(TARGET_CENTER_X, TARGET_CENTER_Y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = i === 10 ? '#ff0000' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw ring numbers
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(i.toString(), TARGET_CENTER_X + radius - 10, TARGET_CENTER_Y - 10);
    }

    // Draw center dot
    ctx.beginPath();
    ctx.arc(TARGET_CENTER_X, TARGET_CENTER_Y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Draw green circle for target area
    ctx.beginPath();
    ctx.arc(TARGET_CENTER_X, TARGET_CENTER_Y, TARGET_RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();
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
          backgroundImage: 'url(/other.jpg)',
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
            Laser Tracking
          </Typography>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Paper
                className="fade-in-on-load"
                sx={{
                  p: 2,
                  bgcolor: 'rgba(26,28,34,0.95)',
                  borderRadius: 3,
                  boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
                  color: '#eaeaea',
                  border: 'none',
                }}
              >
                <Box sx={{ position: 'relative', width: '100%', height: '600px' }}>
                  <canvas
                    ref={canvasRef}
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#000000',
                    }}
                  />
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: isStreaming && showCamera ? 'block' : 'none',
                    }}
                  />
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={isStreaming ? stopStream : startStream}
                      startIcon={isStreaming ? <VideocamOffIcon /> : <VideocamIcon />}
                      sx={{
                        bgcolor: '#ff0000',
                        color: '#000000',
                        '&:hover': {
                          bgcolor: '#cc0000',
                          color: '#ffffff',
                        },
                      }}
                    >
                      {isStreaming ? 'Stop Tracking' : 'Start Tracking'}
                    </Button>

                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel id="camera-select-label" sx={{ color: '#ff0000' }}>
                        Camera
                      </InputLabel>
                      <Select
                        labelId="camera-select-label"
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        label="Camera"
                        sx={{
                          color: '#ff0000',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#ff0000',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cc0000',
                          },
                        }}
                      >
                        {availableCameras.map((camera) => (
                          <MenuItem key={camera.deviceId} value={camera.deviceId}>
                            {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <IconButton
                    onClick={() => setShowCamera(!showCamera)}
                    sx={{ 
                      color: '#ff0000',
                      '&:hover': {
                        color: '#cc0000',
                      },
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                className="fade-in-on-load"
                sx={{
                  p: 3,
                  bgcolor: 'rgba(26,28,34,0.95)',
                  borderRadius: 3,
                  boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)',
                  color: '#eaeaea',
                  border: 'none',
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#ff0000',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  mb: 3,
                  textShadow: '0 0 10px rgba(255, 0, 0, 0.3)'
                }}>
                  Status
                </Typography>

                <Box sx={{ mb: 4, textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 1,
                    fontSize: '1.1rem'
                  }}>
                    Score: {score}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1.1rem'
                  }}>
                    Laser: {laserDetected ? 'DETECTED' : 'NOT DETECTED'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#ff0000',
                    textAlign: 'left',
                    mb: 2,
                    fontWeight: 'bold',
                    textShadow: '0 0 10px rgba(255, 0, 0, 0.3)'
                  }}>
                    LED Indicators
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {ledStatus.red ? <FiberManualRecordIcon sx={{ color: '#ff0000' }} /> : <FiberManualRecordOutlinedIcon sx={{ color: '#ff0000' }} />}
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>Outside Target</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {ledStatus.yellow ? <FiberManualRecordIcon sx={{ color: '#ffff00' }} /> : <FiberManualRecordOutlinedIcon sx={{ color: '#ffff00' }} />}
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>Near Center</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {ledStatus.green ? <FiberManualRecordIcon sx={{ color: '#00ff00' }} /> : <FiberManualRecordOutlinedIcon sx={{ color: '#00ff00' }} />}
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>Center Hit</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ 
                    color: '#ff0000',
                    textAlign: 'left',
                    mb: 2,
                    fontWeight: 'bold',
                    textShadow: '0 0 10px rgba(255, 0, 0, 0.3)'
                  }}>
                    Settings
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'left',
                      mb: 1
                    }}>
                      Laser Threshold
                    </Typography>
                    <Slider
                      value={laserThreshold}
                      onChange={(e, value) => setLaserThreshold(value)}
                      min={0}
                      max={255}
                      sx={{ 
                        color: '#ff0000',
                        '& .MuiSlider-thumb': {
                          '&:hover': {
                            boxShadow: '0 0 0 8px rgba(255, 0, 0, 0.16)',
                          },
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'left',
                      mb: 1,
                      mt: 2
                    }}>
                      Min Laser Area
                    </Typography>
                    <Slider
                      value={minLaserArea}
                      onChange={(e, value) => setMinLaserArea(value)}
                      min={1}
                      max={20}
                      sx={{ 
                        color: '#ff0000',
                        '& .MuiSlider-thumb': {
                          '&:hover': {
                            boxShadow: '0 0 0 8px rgba(255, 0, 0, 0.16)',
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </div>
      </Container>
    </Box>
  );
}

export default LaserTracking;