import React, { useRef } from 'react';

const AudioPlayer = () => {
  const audioRef = useRef(null);

  const playClickSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio to start
      audioRef.current.play();
    }
  };

  // Expose the playClickSound function globally
  React.useEffect(() => {
    window.playNavSound = playClickSound;
    return () => {
      window.playNavSound = null;
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="C:\Users\prana\PycharmProjects\app\public\gunshot.mp3" // You'll need to add this sound file to your public folder
      preload="auto"
      style={{ display: 'none' }}
    />
  );
};

export default AudioPlayer; 