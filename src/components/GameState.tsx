
import React, { useState, useEffect } from 'react';
import { Heart, Star, Trophy } from 'lucide-react';

interface GameStateProps {
  health: number;
  maxHealth: number;
  score: number;
  level: number;
  onHealthChange: (health: number) => void;
}
const GameState = ({ health, maxHealth, score, level, onHealthChange }: GameStateProps) => {
  const [powerUps, setPowerUps] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  useEffect(() => {
    if (score >= 1000 && !achievements.includes('score_1000')) {
      setAchievements(prev => [...prev, 'score_1000']);
    }
    if (score >= 5000 && !achievements.includes('score_5000')) {
      setAchievements(prev => [...prev, 'score_5000']);
    }
  }, [score, achievements]);
  const spawnPowerUp = () => {
    const powerUpTypes = ['health', 'strength', 'speed'];
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    setPowerUps(prev => [...prev, randomType]);
    setTimeout(() => {
      setPowerUps(prev => prev.filter(p => p !== randomType));
    }, 5000);
  };
  useEffect(() => {
    const powerUpInterval = setInterval(() => {
      if (Math.random() < 0.1) { 
        spawnPowerUp();
      }
    }, 3000);

    return () => clearInterval(powerUpInterval);
  }, []);
  const usePowerUp = (type: string) => {
    switch (type) {
      case 'health':
        onHealthChange(Math.min(maxHealth, health + 20));
        break;
      case 'strength':
        break;
      case 'speed':
        break;
    }
    setPowerUps(prev => prev.filter(p => p !== type));
  };
  const healthPercentage = (health / maxHealth) * 100;
  return (
    <div className="absolute top-4 left-4 space-y-3 z-10">
      <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-sm font-bold">Health</span>
        </div>
        <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-300"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <div className="text-xs mt-1">{health}/{maxHealth}</div>
      </div>
      <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 text-white">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold">Score: {score.toLocaleString()}</span>
        </div>
        <div className="text-xs opacity-70">Level {level}</div>
      </div>
      {powerUps.length > 0 && (
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3">
          <div className="text-white text-xs mb-2">Power-ups Available:</div>
          <div className="space-y-1">
            {powerUps.map((powerUp, index) => (
              <button
                key={index}
                onClick={() => usePowerUp(powerUp)}
                className="w-full text-left px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-500 transition-colors"
              >
                {powerUp === 'health' && '❤️ Health Boost'}
                {powerUp === 'strength' && '💪 Strength Boost'}
                {powerUp === 'speed' && '⚡ Speed Boost'}
              </button>
            ))}
          </div>
        </div>
      )}
      {achievements.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-3 text-white animate-pulse">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold">Achievement Unlocked!</span>
          </div>
          <div className="text-xs">
            {achievements.includes('score_1000') && 'First Thousand!'}
            {achievements.includes('score_5000') && 'Master Warrior!'}
            {achievements.includes('ultimate-master') && 'Ultimate Samurai!'}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameState;
