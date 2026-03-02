import React, { useEffect, useRef } from 'react';
import { particlesCursor } from 'https://unpkg.com/threejs-toys@0.0.8/build/threejs-toys.module.cdn.min.js';
import { useParticle } from '../contexts/ParticleContext';

const ParticleCursor = () => {
  const containerRef = useRef(null);
  const { isParticleActive } = useParticle();

  useEffect(() => {
    if (containerRef.current && isParticleActive) {
      const pc = particlesCursor({
        el: containerRef.current,
        gpgpuSize: 128,
        color: 0xff0000,
        colors: [0x00fffc, 0x00fffc],
        coordScale: 1.5,
        pointSize: 2,
        noiseIntensity: 0.001,
        noiseTimeCoef: 0.0001,
        pointDecay: 0.0025,
        sleepRadiusX: 50,
        sleepRadiusY: 50,
        sleepTimeCoefX: 0.001,
        sleepTimeCoefY: 0.002
      });

      return () => {
        if (pc && pc.destroy) {
          pc.destroy();
        }
      };
    }
  }, [isParticleActive]);

  if (!isParticleActive) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
        '--hue': '223',
        '--trans-dur': '0.4s',
        '--trans-timing': 'cubic-bezier(0.65, 0, 0.35, 1)',
        fontSize: 'calc(40px + (80 - 40) * (100vw - 320px) / (2560 - 320))'
      }}
    />
  );
};

export default ParticleCursor; 