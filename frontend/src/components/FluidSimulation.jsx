import React, { useEffect, useRef } from 'react';

const FluidSimulation = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.97,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 30,
      SPLAT_RADIUS: 0.2,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLOR_UPDATE_SPEED: 10,
      PAUSED: false
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const drawSplat = (ctx) => {
      const now = Date.now();
      if (now - lastTimeRef.current > 16) { // ~60fps
        const x = mouseRef.current.x;
        const y = mouseRef.current.y;
        const prevX = prevMouseRef.current.x;
        const prevY = prevMouseRef.current.y;
        
        // Calculate movement vector
        const dx = x - prevX;
        const dy = y - prevY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Draw multiple splats along the movement path for continuity
        const steps = Math.max(1, Math.floor(distance / 5));
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const splatX = prevX + dx * t;
          const splatY = prevY + dy * t;
          const radius = config.SPLAT_RADIUS * (15 + Math.sin(now * 0.01) * 5); // Subtle size variation

          ctx.beginPath();
          const gradient = ctx.createRadialGradient(splatX, splatY, 0, splatX, splatY, radius);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
          gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(splatX, splatY, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        lastTimeRef.current = now;
      }
    };

    const animate = () => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply gentle fade out
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      // Draw new splat
      drawSplat(ctx);

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();
    
    // Initialize prevMouseRef
    prevMouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    mouseRef.current = { ...prevMouseRef.current };
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default FluidSimulation; 