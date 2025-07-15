
import { useState, useEffect } from 'react';

export const useScreenShake = () => {
  const [shaking, setShaking] = useState(false);
  const [intensity, setIntensity] = useState(0);

  const shake = (duration: number = 300, shakeIntensity: number = 10) => {
    setIntensity(shakeIntensity);
    setShaking(true);
    
    setTimeout(() => {
      setShaking(false);
      setIntensity(0);
    }, duration);
  };

  const shakeStyle = shaking ? {
    transform: `translate(${(Math.random() - 0.5) * intensity}px, ${(Math.random() - 0.5) * intensity}px)`,
    transition: 'transform 0.1s'
  } : {};

  return { shake, shakeStyle };
};
