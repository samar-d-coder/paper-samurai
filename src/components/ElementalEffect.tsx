import React, { useState, useEffect } from 'react';
import StatusEffect from './StatusEffect';

export interface ElementalStatus {
  type: 'fire' | 'water' | 'wind' | 'earth' | null;
  duration: number;
  value: number; 
  tickInterval?: number;
  appliedAt: number; 
}

interface ElementalEffectProps {
  enemyId: number;
  status: ElementalStatus | null;
  x: number;
  y: number;
  size: number;
  onTick?: (type: ElementalStatus['type'], value: number) => void;
  onExpire?: (enemyId: number) => void;
}

const ElementalEffect: React.FC<ElementalEffectProps> = ({
  enemyId,
  status,
  x,
  y,
  size,
  onTick,
  onExpire
}) => {
  const [currentStatus, setCurrentStatus] = useState<ElementalStatus | null>(status);
  const [lastTickTime, setLastTickTime] = useState<number>(0);
  useEffect(() => {
    setCurrentStatus(status);
    if (status) {
      setLastTickTime(Date.now());
    }
  }, [status]);
  useEffect(() => {
    if (!currentStatus) return;
    
    const now = Date.now();
    const elapsedTime = now - currentStatus.appliedAt;
    if (elapsedTime >= currentStatus.duration) {
      setCurrentStatus(null);
      if (onExpire) onExpire(enemyId);
      return;
    }
    if (currentStatus.type === 'fire' && currentStatus.tickInterval) {
      const timeSinceLastTick = now - lastTickTime;
      
      if (timeSinceLastTick >= currentStatus.tickInterval) {
        if (onTick) onTick('fire', currentStatus.value);
        setLastTickTime(now);
      }
    }
    const checkInterval = currentStatus.type === 'fire' ? 
      Math.min(currentStatus.tickInterval || 1000, 1000) : 
      1000;
    const timer = setTimeout(() => {
      setCurrentStatus(prev => prev ? {...prev} : null);
    }, checkInterval);
    return () => clearTimeout(timer);
  }, [currentStatus, lastTickTime, enemyId, onTick, onExpire]);
  if (!currentStatus) return null;
  return (
    <>
      <StatusEffect 
        type={currentStatus.type}
        x={x}
        y={y}
        size={size}
        duration={currentStatus.duration}
      />
      <div 
        className="absolute rounded-full flex items-center justify-center"
        style={{
          left: x,
          top: y - size/2 - 15,
          transform: 'translateX(-50%)',
          width: 24,
          height: 24,
          backgroundColor: getStatusColor(currentStatus.type),
          boxShadow: `0 0 5px ${getStatusColor(currentStatus.type)}`,
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        {getStatusIcon(currentStatus.type)}
      </div>
    </>
  );
};
const getStatusColor = (type: ElementalStatus['type']) => {
  switch (type) {
    case 'fire': return '#dc2626';
    case 'water': return '#2563eb';
    case 'wind': return '#10b981';
    case 'earth': return '#b45309';
    default: return '#ffffff';
  }
};
const getStatusIcon = (type: ElementalStatus['type']) => {
  switch (type) {
    case 'fire': return '🔥';
    case 'water': return '💧';
    case 'wind': return '💨';
    case 'earth': return '🪨';
    default: return '';
  }
};

export default ElementalEffect;