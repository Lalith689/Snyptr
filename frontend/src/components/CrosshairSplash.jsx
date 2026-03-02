import React, { useEffect, useState } from 'react';

export default function CrosshairSplash({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15,17,22,0.96)',
        zIndex: 2000,
        display: visible ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="120" height="120" viewBox="0 0 120 120"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.6s, transform 0.6s',
          filter: 'drop-shadow(0 0 16px #00d1b2)',
        }}
      >
        <circle cx="60" cy="60" r="40" stroke="#ff4c29" strokeWidth="4" fill="none" />
        <line x1="60" y1="20" x2="60" y2="40" stroke="#eaeaea" strokeWidth="3" />
        <line x1="60" y1="80" x2="60" y2="100" stroke="#eaeaea" strokeWidth="3" />
        <line x1="20" y1="60" x2="40" y2="60" stroke="#eaeaea" strokeWidth="3" />
        <line x1="80" y1="60" x2="100" y2="60" stroke="#eaeaea" strokeWidth="3" />
        <circle cx="60" cy="60" r="6" fill="#00d1b2" />
      </svg>
    </div>
  );
} 