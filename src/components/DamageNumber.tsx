
import React, { useState, useEffect } from 'react';

interface DamageNumberProps {
  damage: number;
  x: number;
  y: number;
  type: 'normal' | 'critical' | 'combo' | 'fire' | 'water' | 'wind' | 'earth';
  onComplete: () => void;
}
const DamageNumber = ({ damage, x, y, type, onComplete }: DamageNumberProps) => {
  const [opacity, setOpacity] = useState(1);
  const [offsetY, setOffsetY] = useState(0);
  useEffect(() => {
    const animation = setInterval(() => {
      setOffsetY(prev => prev - 2);
      setOpacity(prev => Math.max(0, prev - 0.02));
    }, 16);
    const timeout = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => {
      clearInterval(animation);
      clearTimeout(timeout);
    };
  }, [onComplete]);
  const getColor = () => {
    switch (type) {
      case 'critical': return '#FF5722';
      case 'combo': return '#E91E63';
      case 'fire': return '#FF5722';
      case 'water': return '#2196F3';
      case 'wind': return '#8BC34A'; 
      case 'earth': return '#795548';
      default: return '#FFFFFF'; 
    }
  };

  const getSize = () => {
    switch (type) {
      case 'critical': return 'text-2xl';
      case 'combo': return 'text-xl';
      default: return 'text-lg';
    }
  };

  return (
    <div
      className={`absolute pointer-events-none font-bold ${getSize()} drop-shadow-lg`}
      style={{
        left: x,
        top: y + offsetY,
        opacity,
        color: getColor(),
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        transform: type === 'critical' ? 'scale(1.2)' : 'scale(1)'
      }}
    >
      -{damage}
      {type === 'critical' && <span className="text-yellow-400 ml-1">!</span>}
      {type === 'combo' && <span className="text-orange-400 ml-1">×</span>}
    </div>
  );
};

export default DamageNumber;
