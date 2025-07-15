
import React, { useState, useEffect } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ParticleEffectProps {
  x: number;
  y: number;
  type: 'success' | 'hit' | 'critical';
  onComplete: () => void;
}

const ParticleEffect = ({ x, y, type, onComplete }: ParticleEffectProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = type === 'critical' ? 20 : type === 'hit' ? 15 : 10;
    const colors = {
      success: ['#10b981', '#34d399', '#6ee7b7'],
      hit: ['#f59e0b', '#fbbf24', '#fcd34d'],
      critical: ['#dc2626', '#ef4444', '#f87171']
    };

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6 - 2,
        life: 0,
        maxLife: 60 + Math.random() * 30,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        size: Math.random() * 4 + 2
      });
    }
    setParticles(newParticles);
  }, [x, y, type]);

  useEffect(() => {
    if (particles.length === 0) return;
    let animationFrameId: number;
    const updateParticles = () => {
      setParticles(prev => {
        if (prev.length > 50) {
          prev = prev.slice(-50);
        }
        const updated = prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.2, // gravity
          life: particle.life + 1
        })).filter(particle => particle.life < particle.maxLife);
        return updated;
      });
      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(updateParticles);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateParticles);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
  useEffect(() => {
    if (particles.length > 0) return;
    
    const timer = setTimeout(() => {
      onComplete();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [particles.length, onComplete]);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: 1 - (particle.life / particle.maxLife)
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
