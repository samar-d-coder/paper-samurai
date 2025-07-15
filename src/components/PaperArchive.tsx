import React, { useState } from 'react';
import { Scroll, Crown, Sword, Shield, Flame, Snowflake, Zap } from 'lucide-react';
import PaperButton from './PaperButton';
import EnhancedCombatSystem from './EnhancedCombatSystem';
import { soundManager } from '../utils/SoundManager';

interface Boss {
  id: string;
  name: string;
  title: string;
  description: string;
  health: number;
  attacks: string[];
  weakness: string;
  rewards: string[];
  difficulty: number;
  unlocked: boolean;
  defeated: boolean;
  icon: React.ComponentType<any>;
  background: string;
}

interface PaperArchiveProps {
  onBack: () => void;
  onBossFight: (bossId: string) => void;
  playerLevel: number;
  defeatedBosses: string[];
}

const PaperArchive = ({ onBack, onBossFight, playerLevel, defeatedBosses }: PaperArchiveProps) => {
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [showCombat, setShowCombat] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [combatScore, setCombatScore] = useState(0);

  const bosses: Boss[] = [
    {
      id: 'shadow_crane',
      name: 'Kage-Tsuru',
      title: 'The Shadow Crane',
      description: 'A legendary paper crane that gained consciousness in the moonlight. Its wings cut through reality itself.',
      health: 150,
      attacks: ['Shadow Wing Slice', 'Paper Storm', 'Midnight Fold'],
      weakness: 'Light-based attacks',
      rewards: ['Shadow Wing Pattern', '500 XP', 'Crane Master Title'],
      difficulty: 3,
      unlocked: true, 
      defeated: defeatedBosses.includes('shadow_crane'),
      icon: Scroll,
      background: 'from-purple-900 via-indigo-800 to-black'
    },
    {
      id: 'dragon_emperor',
      name: 'Ryu-Kotei',
      title: 'The Paper Dragon Emperor',
      description: 'Ancient ruler of all origami beasts. Its breath turns enemies into flat paper.',
      health: 300,
      attacks: ['Paper Breath', 'Origami Coil', 'Imperial Roar'],
      weakness: 'Fire attacks',
      rewards: ['Dragon Scale Pattern', '1000 XP', 'Emperor\'s Blessing'],
      difficulty: 7,
      unlocked: true, 
      defeated: defeatedBosses.includes('dragon_emperor'),
      icon: Crown,
      background: 'from-red-600 via-orange-500 to-yellow-400'
    },
    {
      id: 'oni_samurai',
      name: 'Akuma-Bushi',
      title: 'The Demon Paper Samurai',
      description: 'A fallen samurai whose soul was bound to origami. Seeks eternal battle.',
      health: 250,
      attacks: ['Demon Slash', 'Paper Katana Storm', 'Oni Fury'],
      weakness: 'Holy attacks',
      rewards: ['Demon Blade Pattern', '750 XP', 'Oni Slayer Title'],
      difficulty: 6,
      unlocked: true,
      defeated: defeatedBosses.includes('oni_samurai'),
      icon: Sword,
      background: 'from-red-900 via-black to-red-800'
    },
    {
      id: 'phoenix_master',
      name: 'Hi-no-Tori',
      title: 'The Eternal Phoenix',
      description: 'Reborn from ashes of ancient scrolls. Controls the flames of rebirth.',
      health: 400,
      attacks: ['Phoenix Fire', 'Rebirth Flame', 'Eternal Burn'],
      weakness: 'Ice attacks',
      rewards: ['Phoenix Feather Pattern', '1500 XP', 'Eternal Flame'],
      difficulty: 10,
      unlocked: true, 
      defeated: defeatedBosses.includes('phoenix_master'),
      icon: Flame,
      background: 'from-orange-400 via-red-500 to-pink-400'
    },
    {
      id: 'ice_kitsune',
      name: 'Yuki-Kitsune',
      title: 'The Nine-Tailed Ice Fox',
      description: 'Mystical fox spirit made of frozen paper. Each tail holds ancient wisdom.',
      health: 350,
      attacks: ['Frozen Illusion', 'Ice Shard Dance', 'Nine-Tail Strike'],
      weakness: 'Fire attacks',
      rewards: ['Kitsune Tail Pattern', '1200 XP', 'Spirit Guide'],
      difficulty: 9,
      unlocked: true, 
      defeated: defeatedBosses.includes('ice_kitsune'),
      icon: Snowflake,
      background: 'from-cyan-300 via-blue-200 to-white'
    },
    {
      id: 'thunder_tengu',
      name: 'Raijin-Tengu',
      title: 'The Storm Paper Tengu',
      description: 'Master of winds and thunder. Its wings create lightning from paper folds.',
      health: 500,
      attacks: ['Thunder Fold', 'Lightning Wing', 'Storm Summon'],
      weakness: 'Earth attacks',
      rewards: ['Thunder Wing Pattern', '2000 XP', 'Storm Lord Title'],
      difficulty: 12,
      unlocked: true, 
      defeated: defeatedBosses.includes('thunder_tengu'),
      icon: Zap,
      background: 'from-yellow-300 via-blue-400 to-purple-600'
    }
  ];

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(Math.min(difficulty, 5)) + '☆'.repeat(Math.max(0, 5 - difficulty));
  };

  const handlePlayerDamage = (damage: number) => {
    setPlayerHealth(prev => Math.max(0, prev - damage));
    if (playerHealth - damage <= 0) {
      handleGameOver();
    }
  };

  const handleScoreUpdate = (points: number) => {
    setCombatScore(prev => prev + points);
  };

  const handleGameOver = () => {
    setShowCombat(false);
    setPlayerHealth(100);
    setCombatScore(0);
  };

  const handleBossFightInArchive = () => {
    if (!selectedBoss) return;
    setShowCombat(true);
    setPlayerHealth(100);
    setCombatScore(0);
    soundManager.playBattleStart();
  };

  const handleBossDefeated = () => {
    if (!selectedBoss) return;
    onBossFight(selectedBoss.id);
    setShowCombat(false);
    setPlayerHealth(100);
    setCombatScore(0);
    alert(`You have defeated ${selectedBoss.name}! You earned: ${selectedBoss.rewards.join(', ')}`);
  };
  if (showCombat && selectedBoss) {
    return (
      <div className={`w-full h-screen bg-gradient-to-br ${selectedBoss.background} text-white overflow-hidden`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{selectedBoss.name}: {selectedBoss.title}</h2>
          <div className="flex items-center gap-4">
            <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              <span className="text-xl">Score: {combatScore}</span>
            </div>
            <PaperButton onClick={() => {
              setShowCombat(false);
              setPlayerHealth(100);
              setCombatScore(0);
            }} variant="secondary">
              Retreat
            </PaperButton>
          </div>
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none">
          {selectedBoss.id === 'shadow_crane' && (
            <div className="absolute inset-0 bg-black bg-opacity-30">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-purple-500 rounded-full opacity-30"
                  style={{
                    width: `${2 + Math.random() * 5}px`,
                    height: `${2 + Math.random() * 5}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    filter: 'blur(2px)',
                    boxShadow: '0 0 8px rgba(147, 51, 234, 0.8)',
                    animation: `float ${3 + Math.random() * 5}s linear infinite`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>
          )}
          {selectedBoss.id === 'dragon_emperor' && (
            <div className="absolute inset-0">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-red-500 rounded-full"
                  style={{
                    width: `${5 + Math.random() * 10}px`,
                    height: `${5 + Math.random() * 10}px`,
                    left: `${Math.random() * 100}%`,
                    bottom: `${Math.random() * 20}%`,
                    opacity: 0.6,
                    filter: 'blur(2px)',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
                    animation: `float ${2 + Math.random() * 4}s ease-in-out infinite alternate`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
              <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-red-900 to-transparent opacity-40" />
            </div>
          )}

          {selectedBoss.id === 'oni_samurai' && (
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-red-600 rounded-full"
                  style={{
                    width: `${3 + Math.random() * 6}px`,
                    height: `${3 + Math.random() * 6}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.5,
                    filter: 'blur(2px)',
                    boxShadow: '0 0 8px rgba(220, 38, 38, 0.8)',
                    animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
              <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-black to-transparent opacity-50" />
            </div>
          )}

          {selectedBoss.id === 'phoenix_master' && (
            <div className="absolute inset-0">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${2 + Math.random() * 8}px`,
                    height: `${2 + Math.random() * 8}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    background: `rgb(${220 + Math.random() * 35}, ${100 + Math.random() * 50}, ${0 + Math.random() * 50})`,
                    opacity: 0.6,
                    filter: 'blur(1px)',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
                    animation: `float ${1 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
              <div 
                className="absolute rounded-full bg-yellow-300 opacity-20" 
                style={{
                  width: '300px',
                  height: '300px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  filter: 'blur(80px)',
                  animation: 'pulse 4s ease-in-out infinite alternate'
                }}
              />
            </div>
          )}

          {selectedBoss.id === 'ice_kitsune' && (
            <div className="absolute inset-0">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-white rounded-full"
                  style={{
                    width: `${1 + Math.random() * 3}px`,
                    height: `${1 + Math.random() * 3}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.7,
                    filter: 'blur(1px)',
                    boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
                    animation: `snowfall ${5 + Math.random() * 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`crystal-${i}`}
                  className="absolute bg-blue-100 rotate-45"
                  style={{
                    width: `${10 + Math.random() * 20}px`,
                    height: `${30 + Math.random() * 50}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.3,
                    filter: 'blur(1px)',
                    boxShadow: '0 0 15px rgba(191, 219, 254, 0.8)',
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              ))}
              <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-100 to-transparent opacity-20" />
            </div>
          )}

          {selectedBoss.id === 'thunder_tengu' && (
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-white opacity-0"
                style={{
                  animation: 'lightning 8s ease-in-out infinite',
                  animationDelay: '1s'
                }}
              />
              <div 
                className="absolute inset-0 bg-white opacity-0"
                style={{
                  animation: 'lightning 8s ease-in-out infinite',
                  animationDelay: '3.5s'
                }}
              />
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-gray-700 rounded-full"
                  style={{
                    width: `${50 + Math.random() * 100}px`,
                    height: `${30 + Math.random() * 50}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 40}%`,
                    opacity: 0.4,
                    filter: 'blur(15px)',
                    animation: `float ${20 + Math.random() * 10}s linear infinite`,
                    animationDelay: `${Math.random() * 10}s`
                  }}
                />
              ))}
              {[...Array(15)].map((_, i) => (
                <div
                  key={`spark-${i}`}
                  className="absolute bg-yellow-300 rounded-full"
                  style={{
                    width: `${1 + Math.random() * 3}px`,
                    height: `${1 + Math.random() * 3}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.8,
                    filter: 'blur(1px)',
                    boxShadow: '0 0 8px rgba(253, 224, 71, 0.8)',
                    animation: `spark ${1 + Math.random() * 2}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="relative z-10">
          <EnhancedCombatSystem
            playerHealth={playerHealth}
            onPlayerDamage={handlePlayerDamage}
            onScoreUpdate={handleScoreUpdate}
            onGameOver={handleBossDefeated}
            bossMode={true}
            bossId={selectedBoss.id}
            ultimateEnabled={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 text-white overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-amber-200">Paper Archive</h1>
            <p className="text-stone-300">Chronicles of legendary paper warriors</p>
          </div>
          <PaperButton onClick={onBack} variant="secondary">
            Return Home
          </PaperButton>
        </div>

        {!selectedBoss ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bosses.map((boss) => {
              const Icon = boss.icon;
              return (
                <div
                  key={boss.id}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    boss.defeated 
                      ? 'border-green-400 bg-green-900 bg-opacity-20 hover:bg-opacity-30'
                      : 'border-amber-400 bg-stone-800 hover:bg-stone-700 hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedBoss(boss)}
                >
                  <div className={`h-32 bg-gradient-to-br ${boss.background} flex items-center justify-center relative`}>
                    <Icon className="w-16 h-16 text-white opacity-80" />
                    {boss.defeated && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-amber-200">{boss.name}</h3>
                      <span className="text-xs text-amber-400">{getDifficultyStars(boss.difficulty)}</span>
                    </div>
                    
                    <p className="text-sm text-stone-400 mb-2">{boss.title}</p>
                    <p className="text-xs text-stone-300 mb-3">{boss.description}</p>

                    <div className={`text-xs font-semibold ${boss.defeated ? 'text-green-400' : 'text-amber-400'}`}>
                      {boss.defeated ? '✓ Defeated' : '⚔ Ready to Fight'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedBoss(null)}
              className="text-amber-400 hover:text-amber-300 mb-6 flex items-center gap-2"
            >
              ← Back to Archive
            </button>

            <div className="bg-stone-800 rounded-lg p-8">
              <div className={`h-64 bg-gradient-to-br ${selectedBoss.background} rounded-lg mb-6 flex items-center justify-center`}>
                <selectedBoss.icon className="w-32 h-32 text-white opacity-80" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-3xl font-bold text-amber-200 mb-2">{selectedBoss.name}</h2>
                  <p className="text-xl text-stone-300 mb-4">{selectedBoss.title}</p>
                  <p className="text-stone-400 mb-6">{selectedBoss.description}</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-amber-400 font-semibold mb-2">Health</h4>
                      <div className="bg-stone-700 rounded-full h-4">
                        <div className="bg-red-500 h-4 rounded-full" style={{ width: '100%' }}>
                          <span className="text-xs text-white px-2">{selectedBoss.health} HP</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-amber-400 font-semibold mb-2">Difficulty</h4>
                      <p className="text-2xl">{getDifficultyStars(selectedBoss.difficulty)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-3">Signature Attacks</h4>
                    <div className="space-y-2">
                      {selectedBoss.attacks.map((attack, index) => (
                        <div key={index} className="bg-stone-700 px-3 py-2 rounded text-sm">
                          {attack}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-amber-400 font-semibold mb-2">Weakness</h4>
                    <div className="bg-blue-900 bg-opacity-50 px-3 py-2 rounded text-sm text-blue-200">
                      {selectedBoss.weakness}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-amber-400 font-semibold mb-3">Victory Rewards</h4>
                    <div className="space-y-1">
                      {selectedBoss.rewards.map((reward, index) => (
                        <div key={index} className="text-green-400 text-sm">
                          • {reward}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <PaperButton
                      onClick={handleBossFightInArchive}
                      variant="primary"
                      disabled={selectedBoss.defeated}
                    >
                      Fight in Archive
                    </PaperButton>
                    
                    <PaperButton
                      onClick={() => onBossFight(selectedBoss.id)}
                      variant="secondary"
                      disabled={selectedBoss.defeated}
                    >
                      Fight in Arena
                    </PaperButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperArchive;
