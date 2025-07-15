import React, { useState, useEffect } from 'react';

interface StatusEffectProps {
  type: 'fire' | 'water' | 'wind' | 'earth' | null;
  x: number;
  y: number;
  size: number;
  duration: number;
  onComplete?: () => void;
}
const StatusEffect: React.FC<StatusEffectProps> = ({ 
  type, 
  x, 
  y, 
  size, 
  duration, 
  onComplete 
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
    maxLife: number;
  }>>([]);
  
  const [active, setActive] = useState(true);
  const getColors = () => {
    switch (type) {
      case 'fire':
        return ['#dc2626', '#ef4444', '#f87171', '#fca5a5'];
      case 'water':
        return ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
      case 'wind':
        return ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
      case 'earth':
        return ['#b45309', '#d97706', '#f59e0b', '#fbbf24'];
      default:
        return ['#ffffff'];
    }
  };
  useEffect(() => {
    if (!type) return;
    const colors = getColors();
    const particleCount = type === 'wind' ? 20 : 15;
    const newParticles = [];   
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      const particleSize = Math.random() * (size / 5) + (size / 10); 
      newParticles.push({
        id: i,
        x: x + (Math.random() - 0.5) * size / 2,
        y: y + (Math.random() - 0.5) * size / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: particleSize,
        opacity: 1,
        life: 0,
        maxLife: 30 + Math.random() * 30
      });
    }  
    setParticles(newParticles);  
    const timer = setTimeout(() => {
      setActive(false);
      if (onComplete) onComplete();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [type, x, y, size, duration, onComplete]);
  useEffect(() => {
    if (particles.length === 0 || !active) return;
    let animationFrameId: number;
    const updateParticles = () => {
      setParticles(prev => {
        if (prev.length > 50) {
          prev = prev.slice(-50);
        }
        const updatedParticles = prev.map(particle => {
          let vx = particle.vx;
          let vy = particle.vy;
          switch (type) {
            case 'fire':
              vy -= 0.05;
              break;
            case 'water':
              vy += 0.03;
              vx *= 0.98;
              break;
            case 'wind':
              const angle = Math.atan2(particle.y - y, particle.x - x);
              vx += Math.cos(angle + Math.PI) * 0.1;
              vy += Math.sin(angle + Math.PI) * 0.1;
              break;
            case 'earth':
              vy += 0.1;
              vx *= 0.95;
              break;
          }
          return {
            ...particle,
            x: particle.x + vx,
            y: particle.y + vy,
            vx,
            vy,
            life: particle.life + 1,
            opacity: 1 - (particle.life / particle.maxLife)
          };
        }).filter(particle => particle.life < particle.maxLife);
        if (updatedParticles.length === 0 && prev.length > 0) {
          if (onComplete) onComplete();
          setActive(false);
          return [];
        }
        return updatedParticles;
      });
      if (active) {
        animationFrameId = requestAnimationFrame(updateParticles);
      }
    };
    animationFrameId = requestAnimationFrame(updateParticles);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [type, x, y, active, onComplete]); 
  if (!type || !active) return null;
  return (
    <div className="absolute pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
      {particles.map(particle => {
        const colors = getColors();
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: color,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size / 2}px ${color}`,
              transform: `translate(-50%, -50%)`
            }}
          />
        );
      })}
    </div>
  );
};


export default StatusEffect;