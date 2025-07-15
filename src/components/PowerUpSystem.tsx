import React, { useState, useEffect } from 'react';
import { Zap, Shield, Clock, Target, Sparkles, ScrollText } from 'lucide-react';

interface PowerUp {
  id: string;
  name: string;
  description: string;
  type: 'damage' | 'defense' | 'time' | 'accuracy' | 'special';
  icon: React.ComponentType<any>;
  duration: number;
  effect: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
}

interface ActivePowerUp extends PowerUp {
  timeRemaining: number;
}

interface PowerUpSystemProps {
  onPowerUpActivated: (powerUp: PowerUp) => void;
  onPowerUpExpired: (powerUpId: string) => void;
}

const PowerUpSystem = ({ onPowerUpActivated, onPowerUpExpired }: PowerUpSystemProps) => {
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [availableScrolls, setAvailableScrolls] = useState<PowerUp[]>([]);

  const powerUps: PowerUp[] = [
    {
      id: 'damage-boost',
      name: 'Paper Storm',
      description: 'Double damage for next 3 attacks',
      type: 'damage',
      icon: Zap,
      duration: 15000,
      effect: { damageMultiplier: 2, attacksRemaining: 3 },
      rarity: 'common',
      color: 'text-red-500'
    },
    {
      id: 'time-slow',
      name: 'Temporal Focus',
      description: 'Slow down time during pattern tracing',
      type: 'time',
      icon: Clock,
      duration: 10000,
      effect: { timeScale: 0.5 },
      rarity: 'rare',
      color: 'text-blue-500'
    },
    {
      id: 'shield',
      name: 'Origami Barrier',
      description: 'Block all incoming damage',
      type: 'defense',
      icon: Shield,
      duration: 8000,
      effect: { damageReduction: 1.0 },
      rarity: 'rare',
      color: 'text-green-500'
    },
    {
      id: 'accuracy-boost',
      name: 'Perfect Form',
      description: '+50% accuracy for pattern tracing',
      type: 'accuracy',
      icon: Target,
      duration: 20000,
      effect: { accuracyBonus: 0.5 },
      rarity: 'common',
      color: 'text-purple-500'
    },
    {
      id: 'elemental-fire',
      name: 'Phoenix Flame',
      description: 'Attacks have burning effect',
      type: 'special',
      icon: Sparkles,
      duration: 12000,
      effect: { elementalType: 'fire', bonusDamage: 0.3 },
      rarity: 'epic',
      color: 'text-orange-500'
    },
    {
      id: 'elemental-ice',
      name: 'Frost Seal',
      description: 'Attacks slow enemy movement',
      type: 'special',
      icon: Sparkles,
      duration: 12000,
      effect: { elementalType: 'ice', slowEffect: 0.7 },
      rarity: 'epic',
      color: 'text-cyan-500'
    },
    {
      id: 'multi-strike',
      name: 'Thousand Folds',
      description: 'Next attack hits all enemies',
      type: 'special',
      icon: Zap,
      duration: 5000,
      effect: { multiTarget: true },
      rarity: 'legendary',
      color: 'text-yellow-500'
    }
  ];
  const activatePowerUp = (powerUp: PowerUp) => {
    const activePowerUp: ActivePowerUp = {
      ...powerUp,
      timeRemaining: powerUp.duration
    };
    setActivePowerUps(prev => [...prev, activePowerUp]);
    onPowerUpActivated(powerUp);
    setAvailableScrolls(prev => prev.filter(p => p.id !== powerUp.id));
  };
  const spawnRandomScroll = () => {
    const rarityChances = {
      common: 0.5,
      rare: 0.3,
      epic: 0.15,
      legendary: 0.05
    };  
    const random = Math.random();
    let selectedRarity: keyof typeof rarityChances = 'common';
    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(rarityChances)) {
      cumulative += chance;
      if (random <= cumulative) {
        selectedRarity = rarity as keyof typeof rarityChances;
        break;
      }
    }
    const availablePowerUps = powerUps.filter(p => 
      p.rarity === selectedRarity && 
      !activePowerUps.some(ap => ap.id === p.id) &&
      !availableScrolls.some(as => as.id === p.id)
    );
    if (availablePowerUps.length > 0) {
      const randomPowerUp = availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];
      setAvailableScrolls(prev => [...prev, randomPowerUp]);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePowerUps(prev => {
        const updated = prev.map(powerUp => ({
          ...powerUp,
          timeRemaining: powerUp.timeRemaining - 100
        })).filter(powerUp => {
          if (powerUp.timeRemaining <= 0) {
            onPowerUpExpired(powerUp.id);
            return false;
          }
          return true;
        });
        
        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onPowerUpExpired]);
  useEffect(() => {
    (window as any).powerUpSystem = {
      spawnRandomScroll,
      getActivePowerUps: () => activePowerUps,
      getAvailableScrolls: () => availableScrolls
    };
  }, [activePowerUps, availableScrolls]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div className="absolute top-20 right-4 space-y-2 pointer-events-auto">
        {activePowerUps.map(powerUp => {
          const Icon = powerUp.icon;
          const progress = (powerUp.timeRemaining / powerUp.duration) * 100;
          
          return (
            <div 
              key={powerUp.id}
              className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-3 text-white min-w-48"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-5 h-5 ${powerUp.color}`} />
                <span className="font-semibold text-sm">{powerUp.name}</span>
              </div>
              
              <div className="w-full bg-gray-600 rounded-full h-2 mb-1">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-xs opacity-80">{powerUp.description}</p>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-4 pointer-events-auto">
        {availableScrolls.map(scroll => {
          const Icon = scroll.icon;
          return (
            <div
              key={scroll.id}
              onClick={() => activatePowerUp(scroll)}
              className={`
                cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg
                rounded-lg border-2 p-4 bg-white bg-opacity-90 backdrop-blur-sm
                ${getRarityColor(scroll.rarity)}
                animate-pulse
              `}
            >
              <div className="text-center">
                <div className="relative mb-2">
                  <ScrollText className="w-8 h-8 mx-auto text-amber-600" />
                  <Icon className={`w-4 h-4 absolute top-2 left-1/2 transform -translate-x-1/2 ${scroll.color}`} />
                </div>
                
                <h4 className="font-bold text-xs text-stone-800 mb-1">{scroll.name}</h4>
                <p className="text-xs text-stone-600 max-w-24">{scroll.description}</p>
                
                <div className="mt-2">
                  <span className={`
                    text-xs font-semibold px-2 py-1 rounded-full
                    ${scroll.rarity === 'common' ? 'bg-gray-200 text-gray-700' : ''}
                    ${scroll.rarity === 'rare' ? 'bg-blue-200 text-blue-700' : ''}
                    ${scroll.rarity === 'epic' ? 'bg-purple-200 text-purple-700' : ''}
                    ${scroll.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-700' : ''}
                  `}>
                    {scroll.rarity.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {activePowerUps.some(p => p.effect.elementalType === 'fire') && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-20 animate-pulse" />
        </div>
      )}
      {activePowerUps.some(p => p.effect.elementalType === 'ice') && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-20 animate-pulse" />
        </div>
      )}
    </div>
  );
};


export default PowerUpSystem;