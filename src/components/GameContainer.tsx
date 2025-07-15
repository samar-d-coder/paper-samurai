
import React, { useState } from 'react';
import HomeScreen from './HomeScreen';
import DojoEnvironment from './DojoEnvironment';
import DojoSelection from './DojoSelection';
import ChallengeMode from './ChallengeMode';
import EquipmentSystem from './EquipmentSystem';
import ProgressionSystem from './ProgressionSystem';
import PowerUpSystem from './PowerUpSystem';
import HowToPlay from './HowToPlay';
import { soundManager } from '../utils/SoundManager';

type GameState = 'home' | 'dojo-selection' | 'dojo' | 'boss-fight' | 'challenges' | 'equipment' | 'progression' | 'how-to-play';

const GameContainer = () => {
  const [gameState, setGameState] = useState<GameState>('home');
  const [selectedDojo, setSelectedDojo] = useState<string>('mountain');
  const [selectedBoss, setSelectedBoss] = useState<string>('');
  const [playerLevel, setPlayerLevel] = useState(1);
  const [defeatedBosses, setDefeatedBosses] = useState<string[]>([]);
  const [playerStats, setPlayerStats] = useState({
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    mastery: { crane: 0, dragon: 0, butterfly: 0, samurai: 0, lotus: 0 },
    unlockedPatterns: ['crane', 'butterfly'],
    achievements: [],
    specialAbilities: []
  });
  const [playerCurrency, setPlayerCurrency] = useState(500);
  const [equippedItems, setEquippedItems] = useState({
    paper: null,
    ink: null,
    tool: null
  });
  const [activePowerUps, setActivePowerUps] = useState([]);

  const handleStateChange = (newState: 'home' | 'dojo-selection' | 'dojo' | 'boss-fight' | 'equipment' | 'progression' | 'how-to-play') => {
    setGameState(newState);
    soundManager.playSound('menu-select');
  };
  const handleDojoSelect = (dojoId: string) => {
    setSelectedDojo(dojoId);
    setGameState('dojo');
  };
  const handleBossFight = (bossId: string) => {
    setSelectedBoss(bossId);
    setGameState('boss-fight');
  };
  const handleLevelUp = (newLevel: number) => {
    setPlayerLevel(newLevel);
  };

  const handleBossDefeated = (bossId: string, rewards?: { experience?: number, currency?: number }) => {
    if (!defeatedBosses.includes(bossId)) {
      setDefeatedBosses(prev => [...prev, bossId]);
      if (rewards) {
        if (rewards.experience) {
          handleExperienceGain(rewards.experience);
        }
        if (rewards.currency) {
          setPlayerCurrency(prev => prev + rewards.currency);
        }
      }
    }
  };
  const handleStatsUpdate = (newStats: any) => {
    setPlayerStats(newStats);
    setPlayerLevel(newStats.level);
  };
  const handleExperienceGain = (exp: number) => {
    (window as any).progressionSystem?.addExperience(exp);
  };
  const handlePurchase = (cost: number) => {
    setPlayerCurrency(prev => Math.max(0, prev - cost));
  };
  const handlePowerUpActivated = (powerUp: any) => {
    setActivePowerUps(prev => [...prev, powerUp]);
  };
  const handlePowerUpExpired = (powerUpId: string) => {
    setActivePowerUps(prev => prev.filter(p => p.id !== powerUpId));
  };
  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-amber-50 to-stone-100">
      {gameState === 'home' && (
        <HomeScreen 
          onStateChange={handleStateChange}
          playerLevel={playerLevel}
        />
      )}
      
      {gameState === 'dojo-selection' && (
        <DojoSelection
          onDojoSelect={handleDojoSelect}
          onBack={() => handleStateChange('home')}
          playerLevel={playerLevel}
          onBossFight={handleBossFight}
          defeatedBosses={defeatedBosses}
        />
      )}
      
      {gameState === 'dojo' && (
        <DojoEnvironment
          onStateChange={handleStateChange}
          dojoType={selectedDojo}
          onLevelUp={handleLevelUp}
          playerLevel={playerLevel}
          defeatedBosses={defeatedBosses}
        />
      )}
      {gameState === 'boss-fight' && (
        <DojoEnvironment
          onStateChange={handleStateChange}
          dojoType="boss-arena"
          bossId={selectedBoss}
          onLevelUp={handleLevelUp}
          onBossDefeated={handleBossDefeated}
          playerLevel={playerLevel}
          defeatedBosses={defeatedBosses}
        />
      )}
      {gameState === 'challenges' && (
        <ChallengeMode
          onBack={() => handleStateChange('home')}
          playerLevel={playerLevel}
          onStatsUpdate={handleExperienceGain}
        />
      )}
      {gameState === 'equipment' && (
        <EquipmentSystem
          onBack={() => handleStateChange('home')}
          playerLevel={playerLevel}
          playerCurrency={playerCurrency}
          onEquipmentChange={setEquippedItems}
          onPurchase={handlePurchase}
        />
      )}
      {gameState === 'progression' && (
        <ProgressionSystem
          onStatsUpdate={handleStatsUpdate}
          currentStats={playerStats}
          onBack={() => handleStateChange('home')}
        />
      )}
      {gameState === 'how-to-play' && (
        <HowToPlay
          onClose={() => handleStateChange('home')}
        />
      )}
      <PowerUpSystem
        onPowerUpActivated={handlePowerUpActivated}
        onPowerUpExpired={handlePowerUpExpired}
      />
    </div>
  );
};

export default GameContainer;
