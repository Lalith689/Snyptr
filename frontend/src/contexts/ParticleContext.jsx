import React, { createContext, useState, useContext } from 'react';

const ParticleContext = createContext();

export const ParticleProvider = ({ children }) => {
  const [isParticleActive, setIsParticleActive] = useState(true);

  return (
    <ParticleContext.Provider value={{ isParticleActive, setIsParticleActive }}>
      {children}
    </ParticleContext.Provider>
  );
};

export const useParticle = () => useContext(ParticleContext); 