import React, { useState, useEffect } from 'react';
import OrigamiSamurai from './OrigamiSamurai';
import PaperButton from './PaperButton';
import GameState from './GameState';
import TrainingChallenges from './TrainingChallenges';
import EnhancedCombatSystem from './EnhancedCombatSystem';
import PaperFoldingGame from './PaperFoldingGame';
import RewardScreen from './RewardScreen';
import '../styles/EnhancedBackgrounds.css';
import '../styles/BossEffects.css';
import { soundManager } from '../utils/SoundManager';
import { Scroll, Crown, Sword, Shield, Zap } from 'lucide-react';

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
  icon: React.ReactNode;
  background: string;
}
interface DojoEnvironmentProps {
  onStateChange: (state: 'home' | 'dojo-selection') => void;
  dojoType?: string;
  bossId?: string;
  onLevelUp?: (level: number) => void;
  onBossDefeated?: (bossId: string) => void;
  playerLevel?: number;
  defeatedBosses?: string[];
}
const DojoEnvironment = ({ 
  onStateChange, 
  dojoType = 'mountain', 
  bossId,
  onLevelUp,
  onBossDefeated,
  playerLevel = 1,
  defeatedBosses = []
}: DojoEnvironmentProps) => {
  const [windIntensity, setWindIntensity] = useState(0);
  const [samuraiForm, setSamuraiForm] = useState<'humanoid' | 'crane'>('humanoid');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(playerLevel);
  const [gameActive, setGameActive] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showPaperFolding, setShowPaperFolding] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showRewardScreen, setShowRewardScreen] = useState(false);
  const [defeatedBossId, setDefeatedBossId] = useState<string>('');
  const [showBossSelection, setShowBossSelection] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [showCombat, setShowCombat] = useState(false);
  
  const bosses: Boss[] = [
    {
      id: 'shadow_crane',
      name: 'Shadow Crane',
      title: 'Master of Darkness',
      description: 'A legendary crane origami master corrupted by shadow energy. Its movements are swift and unpredictable.',
      health: 150,
      attacks: ['Shadow Strike', 'Wing Slash', 'Dark Cyclone'],
      weakness: 'Light-based attacks',
      rewards: ['Shadow Essence', 'Crane Technique Scroll', 'Dark Paper'],
      difficulty: 3,
      unlocked: true, 
      defeated: defeatedBosses.includes('shadow_crane'),
      icon: <Scroll className="h-8 w-8 text-purple-600" />,
      background: 'shadow-boss-bg'
    },
    {
      id: 'dragon_emperor',
      name: 'Dragon Emperor',
      title: 'Flame of Destruction',
      description: 'An ancient dragon origami that breathes devastating fire. Its scales are nearly impenetrable.',
      health: 200,
      attacks: ['Flame Breath', 'Tail Swipe', 'Inferno Roar'],
      weakness: 'Water-based attacks',
      rewards: ['Dragon Scale', 'Fire Essence', 'Emperor\'s Crest'],
      difficulty: 4,
      unlocked: true, 
      defeated: defeatedBosses.includes('dragon_emperor'),
      icon: <Crown className="h-8 w-8 text-red-600" />,
      background: 'dragon-boss-bg'
    },
    {
      id: 'oni_samurai',
      name: 'Oni Samurai',
      title: 'Demon Warrior',
      description: 'A fearsome samurai possessed by oni spirits. Wields a blade of pure energy that can cut through anything.',
      health: 180,
      attacks: ['Demon Slash', 'Spirit Barrage', 'Oni Transformation'],
      weakness: 'Purification techniques',
      rewards: ['Oni Mask Fragment', 'Demon Essence', 'Cursed Blade Technique'],
      difficulty: 4,
      unlocked: true, 
      defeated: defeatedBosses.includes('oni_samurai'),
      icon: <Sword className="h-8 w-8 text-red-800" />,
      background: 'oni-boss-bg'
    },
    {
      id: 'phoenix_master',
      name: 'Phoenix Master',
      title: 'Eternal Flame',
      description: 'A master who has bonded with the essence of the phoenix. Can resurrect from defeat once per battle.',
      health: 160,
      attacks: ['Rebirth Flame', 'Wing Tempest', 'Solar Flare'],
      weakness: 'Void-based attacks',
      rewards: ['Phoenix Feather', 'Resurrection Scroll', 'Sun Fragment'],
      difficulty: 5,
      unlocked: true, 
      defeated: defeatedBosses.includes('phoenix_master'),
      icon: <Crown className="h-8 w-8 text-orange-500" />,
      background: 'phoenix-boss-bg'
    },
    {
      id: 'ice_kitsune',
      name: 'Ice Kitsune',
      title: 'Nine-Tailed Frost',
      description: 'A mystical nine-tailed fox with mastery over ice and illusion. Can create duplicates of itself.',
      health: 170,
      attacks: ['Frost Bite', 'Mirror Image', 'Blizzard Dance'],
      weakness: 'Fire-based attacks',
      rewards: ['Kitsune Tail', 'Frost Crystal', 'Illusion Technique'],
      difficulty: 4,
      unlocked: true, 
      defeated: defeatedBosses.includes('ice_kitsune'),
      icon: <Shield className="h-8 w-8 text-blue-400" />,
      background: 'ice-boss-bg'
    },
    {
      id: 'thunder_tengu',
      name: 'Thunder Tengu',
      title: 'Storm Lord',
      description: 'A powerful tengu that commands lightning and storms. Its speed is unmatched when charged with electricity.',
      health: 190,
      attacks: ['Lightning Strike', 'Thunder Clap', 'Storm Surge'],
      weakness: 'Grounding techniques',
      rewards: ['Tengu Feather', 'Lightning Core', 'Wind Manipulation Scroll'],
      difficulty: 5,
      unlocked: true, 
      defeated: defeatedBosses.includes('thunder_tengu'),
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      background: 'thunder-boss-bg'
    }
  ];
  useEffect(() => {
    if (bossId) {
      const boss = bosses.find(b => b.id === bossId);
      if (boss) {
        setSelectedBoss(boss);
        setShowCombat(true);
        setGameActive(true);
        soundManager.playSound('boss-encounter');
      }
    }
  }, [bossId]);
  const getDifficultyStars = (difficulty: number) => {
    const maxStars = 5;
    let stars = '';
    for (let i = 0; i < maxStars; i++) {
      stars += i < difficulty ? '★' : '☆';
    }
    return stars;
  };
  const handlePlayerDamage = (damage: number) => {
    setPlayerHealth(prev => {
      const newHealth = Math.max(0, prev - damage);
      if (newHealth <= 0) {
        handleGameOver();
      }
      return newHealth;
    });
    soundManager.playSound('player-hit');
  };
  const handleScoreUpdate = (points: number) => {
    setScore(prev => {
      const newScore = prev + points;
      if (newScore >= level * 100) {
        setLevel(prevLevel => {
          const newLevel = prevLevel + 1;
          if (onLevelUp) {
            onLevelUp(newLevel);
          }
          return newLevel;
        });
        soundManager.playSound('level-up');
      }
      return newScore;
    });
  };
  const handleGameOver = () => {
    setGameOver(true);
    setGameActive(false);
    soundManager.playSound('game-over');
  };
  const handleBossDefeated = (bossId: string) => {
    setDefeatedBossId(bossId);
    setShowRewardScreen(true);
    if (onBossDefeated) {
      onBossDefeated(bossId);
    }
    soundManager.playSound('victory');
  };
  const handleBossSelect = (boss: Boss) => {
    setSelectedBoss(boss);
    setShowCombat(true);
    setGameActive(true);
    soundManager.playSound('boss-encounter');
  };
  const toggleBossSelection = () => {
    setShowBossSelection(prev => !prev);
    if (!showBossSelection) {
      soundManager.playSound('menu-open');
    }
  };
  const getDojoBackground = () => {
    if (showCombat && selectedBoss) {
      return `${selectedBoss.background} bg-animated-gradient`;
    }
    switch (dojoType) {
      case 'forest':
        return 'dojo-forest-bg bg-animated-gradient';
      case 'waterfall':
        return 'dojo-waterfall-bg bg-animated-gradient';
      case 'temple':
        return 'dojo-temple-bg bg-animated-gradient';
      case 'volcano':
        return 'dojo-volcano-bg bg-animated-gradient';
      case 'glacier':
        return 'dojo-glacier-bg bg-animated-gradient';
      case 'boss-arena':
        return bossId?.includes('shadow') 
          ? 'shadow-boss-bg bg-animated-gradient' 
          : bossId?.includes('dragon') 
            ? 'dragon-boss-bg bg-animated-gradient' 
            : bossId?.includes('oni')
              ? 'oni-boss-bg bg-animated-gradient'
              : bossId?.includes('phoenix')
                ? 'phoenix-boss-bg bg-animated-gradient'
                : bossId?.includes('ice')
                  ? 'ice-boss-bg bg-animated-gradient'
                  : bossId?.includes('thunder')
                    ? 'thunder-boss-bg bg-animated-gradient'
                    : 'boss-arena-bg bg-animated-gradient';
      default:
        return 'dojo-mountain-bg bg-animated-gradient';
    }
  };
  const getDojoElements = () => {
    if (dojoType === 'boss-arena') {
      return (
        <>
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="boss-lightning"
              style={{
                left: `${5 + i * 5}%`,
                top: `${Math.random() * 70}%`,
                height: `${150 + Math.random() * 250}px`,
                width: `${1 + Math.random() * 3}px`,
                animationDelay: `${Math.random() * 4}s`,
                transform: `rotate(${-5 + Math.random() * 10}deg)`,
                opacity: 0.7 + Math.random() * 0.3
              }}
            />
          ))}
          {bossId?.includes('shadow') && [...Array(8)].map((_, i) => (
            <div
              key={`shadow-lightning-${i}`}
              className="boss-lightning"
              style={{
                left: `${20 + i * 8}%`,
                top: `${Math.random() * 40}%`,
                height: `${200 + Math.random() * 300}px`,
                width: `${2 + Math.random() * 4}px`,
                animationDelay: `${Math.random() * 3}s`,
                filter: 'blur(3px)',
                opacity: 0.8
              }}
            />
          ))}
          <div className="floating-particles">
            {[...Array(40)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${2 + Math.random() * 5}px`,
                  height: `${2 + Math.random() * 5}px`,
                  backgroundColor: bossId?.includes('shadow') ? '#8a2be2' : bossId?.includes('dragon') ? '#ff4500' : '#ffffff',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.7,
                  filter: `blur(${Math.random() + 0.5}px)`,
                  boxShadow: `0 0 ${Math.random() * 8 + 3}px ${bossId?.includes('shadow') ? '#8a2be2' : bossId?.includes('dragon') ? '#ff4500' : '#ffffff'}`,
                  animation: `float ${3 + Math.random() * 7}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  zIndex: Math.floor(Math.random() * 5)
                }}
              />
            ))}
          </div>
          {bossId?.includes('dragon') && (
            <div className="lava-bubble-container">
              {[...Array(15)].map((_, i) => (
                <div
                  key={`lava-${i}`}
                  className="lava-bubble"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    bottom: `-20px`,
                    animationDelay: `${Math.random() * 4}s`,
                    width: `${10 + Math.random() * 20}px`,
                    height: `${10 + Math.random() * 20}px`,
                  }}
                />
              ))}
              <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-red-900 to-transparent opacity-30" />
            </div>
          )}
        </>
      );
    }
    switch (dojoType) {
      case 'forest':
        return (
          <>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-t-full opacity-80"
                style={{
                  left: `${2 + i * 3.5}%`,
                  top: `${10 + Math.random() * 40}%`,
                  width: `${8 + Math.random() * 8}px`,
                  height: `${40 + Math.random() * 35}%`,
                  backgroundColor: `rgb(${20 + Math.random() * 30}, ${100 + Math.random() * 50}, ${20 + Math.random() * 30})`,
                  transform: `rotate(${-5 + Math.random() * 10}deg)`,
                  animation: `sway ${2 + Math.random() * 4}s ease-in-out infinite alternate`,
                  animationDelay: `${Math.random() * 2}s`,
                  zIndex: Math.floor(Math.random() * 3)
                }}
              />
            ))}
            {[...Array(15)].map((_, i) => (
              <div
                key={`leaf-${i}`}
                className="absolute bg-green-500 rounded-full opacity-60"
                style={{
                  left: `${5 + i * 6}%`,
                  top: `${5 + Math.random() * 20}%`,
                  width: `${20 + Math.random() * 30}px`,
                  height: `${15 + Math.random() * 20}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `sway ${3 + Math.random() * 3}s ease-in-out infinite alternate`,
                  animationDelay: `${Math.random() * 3}s`,
                  boxShadow: '0 0 5px rgba(0, 100, 0, 0.3)',
                  zIndex: 2
                }}
              />
            ))}
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-green-900 to-green-700 to-transparent opacity-60" />
            <div className="animated-clouds" style={{ opacity: 0.5, filter: 'hue-rotate(60deg)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-green-50 to-transparent opacity-20" />
          </>
        );
      case 'waterfall':
        return (
          <>
            <div className="absolute right-10 top-0 w-24 h-full bg-gradient-to-b from-cyan-300 to-blue-400 opacity-70">
              {[...Array(15)].map((_, i) => (
                <div
                  key={`stream-${i}`}
                  className="absolute w-0.5 h-full bg-white opacity-50"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animation: `fall ${0.3 + Math.random() * 0.7}s linear infinite`,
                    filter: 'blur(0.5px)'
                  }}
                />
              ))}
            </div>
            <div className="absolute right-40 top-0 w-16 h-full bg-gradient-to-b from-cyan-200 to-blue-300 opacity-50">
              {[...Array(10)].map((_, i) => (
                <div
                  key={`stream2-${i}`}
                  className="absolute w-0.5 h-full bg-white opacity-40"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animation: `fall ${0.4 + Math.random() * 0.8}s linear infinite`,
                    filter: 'blur(0.5px)'
                  }}
                />
              ))}
            </div>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-cyan-300 rounded-full opacity-70"
                style={{
                  width: `${1 + Math.random() * 3}px`,
                  height: `${1 + Math.random() * 3}px`,
                  left: `${50 + Math.random() * 40}%`,
                  top: `${Math.random() * 80}%`,
                  filter: 'blur(1px)',
                  animation: `float ${1 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: '0 0 2px rgba(255, 255, 255, 0.7)'
                }}
              />
            ))}
            <div className="animated-clouds" />
          </>
        );
      case 'volcano':
        return (
          <>
            <div 
              className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-red-700 via-red-600 to-orange-400 opacity-60" 
              style={{ animation: 'lavaGlow 4s infinite alternate' }}
            />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div 
                style={{ 
                  width: '300px', 
                  height: '200px', 
                  background: 'radial-gradient(ellipse at center, #4a1c1c 0%, #3a0a0a 70%, transparent 100%)',
                  borderRadius: '50% 50% 0 0',
                  transform: 'scaleX(2.5)',
                  opacity: 0.8
                }} 
              />
            </div>
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="lava-bubble"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 10}%`,
                  width: `${5 + Math.random() * 15}px`,
                  height: `${5 + Math.random() * 15}px`,
                  animationDelay: `${Math.random() * 4}s`,
                  boxShadow: '0 0 15px rgba(255, 100, 0, 0.7)'
                }}
              />
            ))}
            {[...Array(3)].map((_, i) => (
              <div
                key={`lava-stream-${i}`}
                className="absolute bg-gradient-to-b from-yellow-500 to-red-600"
                style={{
                  width: `${5 + Math.random() * 10}px`,
                  height: `${100 + Math.random() * 150}px`,
                  left: `${30 + i * 20}%`,
                  bottom: '0',
                  opacity: 0.8,
                  filter: 'blur(2px)',
                  boxShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
                  animation: `lavaFlow ${3 + Math.random() * 2}s infinite alternate`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
            {[...Array(30)].map((_, i) => (
              <div
                key={`ember-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${1 + Math.random() * 3}px`,
                  height: `${1 + Math.random() * 3}px`,
                  backgroundColor: Math.random() > 0.5 ? '#ff4500' : '#ffcc00',
                  left: `${Math.random() * 100}%`,
                  bottom: `${10 + Math.random() * 30}%`,
                  filter: 'blur(1px)',
                  boxShadow: `0 0 ${Math.random() * 5 + 3}px ${Math.random() > 0.5 ? '#ff4500' : '#ffcc00'}`,
                  animation: `float ${2 + Math.random() * 4}s linear infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
            {[...Array(15)].map((_, i) => (
              <div
                key={`smoke-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${20 + Math.random() * 30}px`,
                  height: `${20 + Math.random() * 30}px`,
                  backgroundColor: '#888888',
                  left: `${20 + Math.random() * 60}%`,
                  bottom: `${30 + Math.random() * 40}%`,
                  opacity: 0.3,
                  filter: 'blur(8px)',
                  animation: `float ${5 + Math.random() * 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </>
        );
      case 'temple':
        return (
          <>
            {[...Array(8)].map((_, i) => (
              <div 
                key={`pillar-${i}`}
                className="absolute bg-gradient-to-b from-amber-300 to-amber-200 rounded-t-sm"
                style={{
                  left: `${5 + i * 13}%`,
                  bottom: '0',
                  width: '35px',
                  height: '220px',
                  boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'
                }}
              >
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-48 h-10 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-t-sm shadow-lg" />               
                {[...Array(5)].map((_, j) => (
                  <div 
                    key={`pillar-detail-${i}-${j}`}
                    className="absolute left-0 w-full h-1 bg-amber-400"
                    style={{ top: `${20 + j * 15}%` }}
                  />
                ))}
              </div>
            ))}
            <div className="absolute bottom-0 w-full h-20 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 opacity-90" />
            <div 
              className="absolute bg-gradient-to-t from-amber-200 to-amber-100"
              style={{
                bottom: '20px',
                left: '20%',
                width: '60%',
                height: '40px',
                borderRadius: '4px 4px 0 0',
              }}
            />
            {[...Array(12)].map((_, i) => (
              <div
                key={`lantern-${i}`}
                className="absolute"
                style={{
                  left: `${5 + i * 8}%`,
                  top: `${15 + Math.random() * 50}%`,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite alternate`,
                  animationDelay: `${Math.random() * 2}s`,
                  zIndex: Math.floor(Math.random() * 5)
                }}
              >
                <div className="w-6 h-8 bg-red-600 rounded-md relative">
                  <div className="absolute inset-1 bg-yellow-300 opacity-70 rounded-sm animate-pulse" 
                       style={{ boxShadow: '0 0 10px rgba(255, 255, 0, 0.8), 0 0 20px rgba(255, 255, 0, 0.4)' }} />
                </div>
                <div className="w-1 h-4 bg-amber-900 mx-auto" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-100 to-transparent opacity-40" />
            <div className="animated-clouds" style={{ opacity: 0.3, filter: 'sepia(0.5)' }} />
          </>
        );
      case 'glacier':
        return (
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={`ice-formation-${i}`}
                className="absolute bottom-0"
                style={{
                  left: `${2 + i * 9}%`,
                  width: `${25 + Math.random() * 40}px`,
                  height: `${120 + Math.random() * 180}px`,
                  background: 'linear-gradient(to bottom, rgba(224, 242, 254, 0.9), rgba(186, 230, 253, 0.7))',
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                  transform: `rotate(${-5 + Math.random() * 10}deg)`,
                  boxShadow: '0 0 20px rgba(186, 230, 253, 0.5)',
                  zIndex: Math.floor(Math.random() * 3)
                }}
              >
                <div 
                  className="absolute"
                  style={{
                    left: '20%',
                    top: '30%',
                    width: '60%',
                    height: '40%',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0))',
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                  }}
                />
              </div>
            ))}
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-cyan-100 to-transparent opacity-40" />
            {[...Array(50)].map((_, i) => (
              <div
                key={`snow-${i}`}
                className="absolute bg-white rounded-full"
                style={{
                  width: `${1 + Math.random() * 4}px`,
                  height: `${1 + Math.random() * 4}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 80}%`,
                  opacity: 0.8,
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 2px rgba(255, 255, 255, 0.8)',
                  animation: `snowfall ${5 + Math.random() * 7}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
            <div className="absolute bottom-0 w-full">
              <svg className="w-full h-64" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0 300 L200 100 L400 200 L600 50 L800 150 L1000 100 L1200 250 L1200 300 Z" fill="#e0f2fe" opacity="0.6" />
                <path d="M0 300 L150 200 L350 250 L550 150 L750 200 L950 120 L1200 300 Z" fill="#bae6fd" opacity="0.4" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 to-transparent opacity-30" />
          </>
        );
      case 'mountain':
        return (
          <>
            <div className="animated-mountains">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0 300 L100 200 L200 250 L300 180 L400 220 L500 150 L600 200 L700 120 L800 180 L900 140 L1000 190 L1100 160 L1200 210 L1200 300 Z" fill="#4b3621" opacity="0.5" />
                <path d="M0 300 L150 150 L250 200 L350 120 L450 180 L550 100 L650 170 L750 90 L850 140 L950 80 L1050 150 L1150 110 L1200 130 L1200 300 Z" fill="#6d5a4a" opacity="0.7" />
                <path d="M0 300 L200 80 L400 180 L600 40 L800 130 L1000 70 L1200 150 L1200 300 Z" fill="#8b7355" opacity="0.9" />
                <path d="M0 80 L200 80 L400 180 L600 40 L800 130 L1000 70 L1200 150 L1200 140 L1000 60 L800 120 L600 30 L400 170 L200 70 L0 70 Z" fill="#f5f5f5" opacity="0.7" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-gray-200 to-transparent opacity-20" />
            <div className="animated-clouds" style={{ opacity: 0.7 }} />
            {[...Array(15)].map((_, i) => (
              <div
                key={`tree-${i}`}
                className="absolute bottom-0"
                style={{
                  left: `${5 + i * 7}%`,
                  zIndex: Math.floor(Math.random() * 3)
                }}
              >
                <div 
                  className="w-2 h-16 bg-gradient-to-t from-amber-900 to-amber-800 mx-auto"
                  style={{ borderRadius: '1px' }}
                />
                <div 
                  className="w-0 h-0 mx-auto"
                  style={{
                    borderLeft: '15px solid transparent',
                    borderRight: '15px solid transparent',
                    borderBottom: '25px solid #2d4a22',
                    marginTop: '-8px',
                    filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))',
                  }}
                />
                <div 
                  className="w-0 h-0 mx-auto"
                  style={{
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    borderBottom: '20px solid #3a5f2c',
                    marginTop: '-15px',
                    filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))',
                  }}
                />
                <div 
                  className="w-0 h-0 mx-auto"
                  style={{
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderBottom: '18px solid #476a39',
                    marginTop: '-12px',
                    filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))',
                  }}
                />
              </div>
            ))}
            {[...Array(8)].map((_, i) => (
              <div
                key={`rock-${i}`}
                className="absolute bottom-0 rounded-t-lg bg-gradient-to-b from-gray-500 to-gray-700"
                style={{
                  left: `${10 + i * 10}%`,
                  width: `${10 + Math.random() * 20}px`,
                  height: `${15 + Math.random() * 25}px`,
                  transform: `rotate(${-5 + Math.random() * 10}deg)`,
                  boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
                  zIndex: 1
                }}
              />
            ))}
            <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-amber-800 to-amber-700 opacity-80" />
          </>
        );
      default:
        return (
          <>
            <div className="animated-mountains">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0 300 L200 100 L400 200 L600 50 L800 150 L1000 100 L1200 250 L1200 300 Z" fill="#8b7355" opacity="0.8" />
                <path d="M0 300 L150 200 L350 250 L550 150 L750 200 L950 120 L1200 300 Z" fill="#5d4e37" opacity="0.6" />
              </svg>
            </div>
            <div className="animated-clouds" />
          </>
        );
    }
  };
  useEffect(() => {
    const windInterval = setInterval(() => {
      setWindIntensity(0.3 + Math.random() * 0.7);
    }, 3000);

    return () => clearInterval(windInterval);
  }, []);
  const handleTransformation = () => {
    setSamuraiForm(prev => prev === 'humanoid' ? 'crane' : 'humanoid');
  };
  const handleClaimRewards = (rewards: any[]) => {
    rewards.forEach(reward => {
      if (reward.type === 'currency') {
        console.log(`Added ${reward.amount} currency`);
      } else if (reward.type === 'experience') {
        console.log(`Added ${reward.amount} experience`);
        if (onLevelUp) {
          onLevelUp(level + 1);
        }
      } else if (reward.type === 'item' || reward.type === 'pattern') {
        console.log(`Added ${reward.name} to inventory`);
      }
    });
  };
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setPlayerHealth(100);
    setScore(0);
    setLevel(1);
  };
  const handleChallengeComplete = (reward: number) => {
    setScore(prev => prev + reward);
    setShowChallenges(false);
  };
  const handlePaperFoldingComplete = (success: boolean, type: 'attack' | 'defense') => {
    setShowPaperFolding(false);
    
    if (success) {
      if (type === 'attack') {
        const bonusPoints = 200 + Math.floor(Math.random() * 100);
        setScore(prev => prev + bonusPoints);
      } else {
        const healAmount = Math.min(maxHealth - playerHealth, 30);
        setPlayerHealth(prev => prev + healAmount);
      }
      if (score + (type === 'attack' ? 250 : 0) >= level * 1000) {
        setLevel(prev => prev + 1);
        onLevelUp?.(level + 1);
      }
    }
  };
  return (
    <div className={`w-full h-screen relative overflow-hidden ${getDojoBackground()}`}>
      {getDojoElements()}
      <div className="enhanced-background">
        {dojoType !== 'boss-arena' && dojoType !== 'volcano' && dojoType !== 'glacier' && !showCombat && (
          <div className="animated-clouds" style={{ opacity: 0.4 }} />
        )}
      </div>
      {showCombat && selectedBoss && (
        <div className="absolute inset-0 pointer-events-none">
          {selectedBoss.id === 'shadow_crane' && (
            <>
              {[...Array(40)].map((_, i) => (
                <div
                  key={`shadow-particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${2 + Math.random() * 5}px`,
                    height: `${2 + Math.random() * 5}px`,
                    backgroundColor: '#8a2be2',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.7,
                    filter: `blur(${Math.random() + 0.5}px)`,
                    boxShadow: `0 0 ${Math.random() * 8 + 3}px #8a2be2`,
                    animation: `float ${3 + Math.random() * 7}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    zIndex: Math.floor(Math.random() * 5)
                  }}
                />
              ))}
              <div 
                className="absolute bottom-0 w-full"
                style={{
                  height: '150px',
                  background: 'linear-gradient(to top, rgba(75, 0, 130, 0.4), transparent)',
                  filter: 'blur(15px)'
                }}
              />
            </>
          )}
          {selectedBoss.id === 'dragon_emperor' && (
            <>
              {[...Array(40)].map((_, i) => (
                <div
                  key={`fire-particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${2 + Math.random() * 5}px`,
                    height: `${2 + Math.random() * 5}px`,
                    backgroundColor: Math.random() > 0.5 ? '#ff4500' : '#ffcc00',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.7,
                    filter: `blur(${Math.random() + 0.5}px)`,
                    boxShadow: `0 0 ${Math.random() * 8 + 3}px ${Math.random() > 0.5 ? '#ff4500' : '#ffcc00'}`,
                    animation: `float ${3 + Math.random() * 7}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    zIndex: Math.floor(Math.random() * 5)
                  }}
                />
              ))}
              <div 
                className="absolute bottom-0 w-full"
                style={{
                  height: '100px',
                  background: 'linear-gradient(to top, rgba(255, 69, 0, 0.4), transparent)',
                  filter: 'blur(10px)'
                }}
              />
            </>
          )}
          {selectedBoss.id === 'oni_samurai' && (
            <>
              {[...Array(30)].map((_, i) => (
                <div
                  key={`oni-particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                    backgroundColor: '#ff0000',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.6,
                    filter: `blur(${Math.random() + 0.5}px)`,
                    boxShadow: `0 0 ${Math.random() * 6 + 2}px #ff0000`,
                    animation: `float ${2 + Math.random() * 5}s linear infinite`,
                    animationDelay: `${Math.random() * 3}s`,
                    zIndex: Math.floor(Math.random() * 5)
                  }}
                />
              ))}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.3) 100%)',
                }}
              />
            </>
          )}
          {selectedBoss.id === 'phoenix_master' && (
            <>
              {[...Array(40)].map((_, i) => (
                <div
                  key={`phoenix-particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${2 + Math.random() * 6}px`,
                    height: `${2 + Math.random() * 6}px`,
                    backgroundColor: Math.random() > 0.5 ? '#ff4500' : '#ffa500',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.7,
                    filter: `blur(${Math.random() + 0.5}px)`,
                    boxShadow: `0 0 ${Math.random() * 10 + 5}px ${Math.random() > 0.5 ? '#ff4500' : '#ffa500'}`,
                    animation: `float ${2 + Math.random() * 4}s linear infinite`,
                    animationDelay: `${Math.random() * 3}s`,
                    zIndex: Math.floor(Math.random() * 5)
                  }}
                />
              ))}
              <div 
                className="absolute"
                style={{
                  left: '50%',
                  top: '40%',
                  transform: 'translate(-50%, -50%)',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 69, 0, 0.4) 50%, transparent 70%)',
                  filter: 'blur(20px)',
                  animation: 'pulse 4s infinite alternate'
                }}
              />
            </>
          )}
          {selectedBoss.id === 'ice_kitsune' && (
            <>
              {[...Array(30)].map((_, i) => (
                <div
                  key={`snowflake-${i}`}
                  className="absolute"
                  style={{
                    width: `${3 + Math.random() * 5}px`,
                    height: `${3 + Math.random() * 5}px`,
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 10}%`,
                    opacity: 0.8,
                    filter: 'blur(1px)',
                    boxShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
                    animation: `snowfall ${5 + Math.random() * 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
              {[...Array(15)].map((_, i) => (
                <div
                  key={`ice-crystal-${i}`}
                  className="absolute"
                  style={{
                    width: `${10 + Math.random() * 20}px`,
                    height: `${20 + Math.random() * 40}px`,
                    backgroundColor: 'rgba(200, 235, 255, 0.4)',
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    boxShadow: '0 0 10px rgba(200, 235, 255, 0.6)',
                    filter: 'blur(2px)'
                  }}
                />
              ))}
              <div 
                className="absolute bottom-0 w-full"
                style={{
                  height: '80px',
                  background: 'linear-gradient(to top, rgba(200, 235, 255, 0.3), transparent)',
                  filter: 'blur(15px)'
                }}
              />
            </>
          )}
          {selectedBoss.id === 'thunder_tengu' && (
            <>
              {[...Array(5)].map((_, i) => (
                <div
                  key={`lightning-${i}`}
                  className="absolute"
                  style={{
                    width: `${1 + Math.random() * 3}px`,
                    height: `${100 + Math.random() * 200}px`,
                    backgroundColor: '#ffff00',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 50}%`,
                    opacity: 0,
                    filter: 'blur(3px)',
                    boxShadow: '0 0 20px rgba(255, 255, 0, 0.8)',
                    animation: `lightning ${2 + Math.random() * 5}s infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    transform: `rotate(${-10 + Math.random() * 20}deg)`
                  }}
                />
              ))}
              {[...Array(10)].map((_, i) => (
                <div
                  key={`cloud-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${50 + Math.random() * 100}px`,
                    height: `${30 + Math.random() * 50}px`,
                    backgroundColor: 'rgba(50, 50, 70, 0.6)',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 40}%`,
                    filter: 'blur(10px)',
                    animation: `float ${10 + Math.random() * 20}s linear infinite`,
                    animationDelay: `${Math.random() * 10}s`
                  }}
                />
              ))}
              {[...Array(20)].map((_, i) => (
                <div
                  key={`spark-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                    backgroundColor: '#ffff00',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.7,
                    filter: 'blur(2px)',
                    boxShadow: '0 0 5px rgba(255, 255, 0, 0.8)',
                    animation: `spark ${1 + Math.random() * 2}s infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-amber-200 to-amber-100 opacity-80">
        <div 
          className="w-full h-full bg-repeat" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-opacity='0.1'%3E%3Cpath d='M0 0h40v1H0zM0 10h40v1H0zM0 20h40v1H0zM0 30h40v1H0z' fill='%23000'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-40"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)',
              animation: `float ${2 + Math.random() * 3}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `translateX(${windIntensity * 100}px)`
            }}
          />
        ))}
      </div>
      {(gameActive || showCombat) && (
        <GameState
          health={playerHealth}
          maxHealth={maxHealth}
          score={score}
          level={level}
          onHealthChange={setPlayerHealth}
        />
      )}
      {(gameActive || showCombat) && (
        <EnhancedCombatSystem
          playerHealth={playerHealth}
          onPlayerDamage={handlePlayerDamage}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
          bossMode={!!bossId || !!selectedBoss}
          bossId={bossId || selectedBoss?.id}
          ultimateEnabled={true}
        />
      )}
      <div className="absolute left-1/2 bottom-32 transform -translate-x-1/2">
        <OrigamiSamurai 
          form={samuraiForm} 
          windIntensity={windIntensity}
          onTransform={handleTransformation}
        />
      </div>
      {showBossSelection && !showCombat && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <div className="bg-amber-50 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Boss Challenges</h2>
            <p className="text-stone-600 mb-6">Defeat powerful origami masters to earn unique rewards and techniques.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bosses.map(boss => (
                <div 
                  key={boss.id}
                  className={`relative border rounded-lg p-4 transition-all ${boss.unlocked ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1' : 'opacity-60 cursor-not-allowed'} ${
                    boss.defeated ? 'bg-green-50 border-green-200' : boss.unlocked ? 'bg-amber-50 border-amber-200' : 'bg-gray-100 border-gray-200'
                  }`}
                  onClick={() => boss.unlocked && handleBossSelect(boss)}
                >
                  {boss.defeated && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Defeated
                    </div>
                  )}
                  {!boss.unlocked && (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                      Locked
                    </div>
                  )}
                  <div className="flex items-center mb-3">
                    <div className="mr-3 p-2 bg-amber-100 rounded-full">
                      {boss.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800">{boss.name}</h3>
                      <p className="text-xs text-stone-600">{boss.title}</p>
                    </div>
                  </div>
                  <p className="text-sm text-stone-700 mb-3">{boss.description}</p>
                  <div className="text-xs text-stone-600 mb-1">
                    <span className="font-semibold">Difficulty:</span> {getDifficultyStars(boss.difficulty)}
                  </div>
                  <div className="text-xs text-stone-600 mb-1">
                    <span className="font-semibold">Health:</span> {boss.health}
                  </div>
                  {!boss.unlocked && (
                    <div className="mt-3 text-xs text-red-600">
                      Requires player level {boss.id === 'shadow_crane' ? 3 :
                        boss.id === 'dragon_emperor' ? 5 :
                        boss.id === 'oni_samurai' ? 7 :
                        boss.id === 'phoenix_master' ? 9 :
                        boss.id === 'ice_kitsune' ? 11 : 13}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <PaperButton onClick={toggleBossSelection} variant="secondary">
                Close
              </PaperButton>
            </div>
          </div>
        </div>
      )}
      <div className="absolute top-8 right-8 flex flex-col gap-4">
        <PaperButton onClick={() => onStateChange('dojo-selection')} variant="secondary">
          {showCombat && selectedBoss ? 'Exit Boss Fight' : 'Change Dojo'}
        </PaperButton>
        <PaperButton onClick={() => onStateChange('home')} variant="secondary">
          Return Home
        </PaperButton>
        {!gameActive && !gameOver && !showCombat && (
          <PaperButton onClick={startGame} variant="primary">
            Start Training
          </PaperButton>
        )}
        {!gameActive && !gameOver && !showCombat && (
          <PaperButton onClick={toggleBossSelection} variant="primary">
            Boss Challenges
          </PaperButton>
        )}
        {!gameActive && !gameOver && !showCombat && (
          <PaperButton onClick={() => setShowChallenges(true)} variant="secondary">
            Challenges
          </PaperButton>
        )}
        {!gameActive && !gameOver && !showCombat && (
          <PaperButton onClick={() => setShowPaperFolding(true)} variant="secondary">
            Origami Practice
          </PaperButton>
        )}
        {gameOver && (
          <div className="bg-red-600 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 border border-red-800 text-white">
            <h3 className="font-bold mb-2">Training Complete!</h3>
            <p className="text-sm mb-2">Final Score: {score.toLocaleString()}</p>
            <p className="text-sm mb-3">Level Reached: {level}</p>
            <PaperButton onClick={startGame} variant="primary">
              Try Again
            </PaperButton>
          </div>
        )}
        {gameActive && (
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-30">
            <h3 className="text-stone-800 font-bold mb-2">Active Training</h3>
            <p className="text-stone-700 text-sm mb-3">Defeat enemies and survive!</p>
            <div className="text-xs text-stone-600">
              Current Form: <span className="font-semibold capitalize">{samuraiForm}</span>
            </div>
            <div className="text-xs text-stone-600">
              Wind: <span className="font-semibold">{Math.round(windIntensity * 100)}%</span>
            </div>
          </div>
        )}
      </div>
      {showChallenges && (
        <TrainingChallenges
          onChallengeComplete={handleChallengeComplete}
          onClose={() => setShowChallenges(false)}
        />
      )}
      {showPaperFolding && (
        <PaperFoldingGame
          onComplete={handlePaperFoldingComplete}
          onClose={() => setShowPaperFolding(false)}
        />
      )}
      {showRewardScreen && (
        <RewardScreen
          bossId={defeatedBossId}
          onClose={() => setShowRewardScreen(false)}
          onClaimRewards={handleClaimRewards}
        />
      )}
      <div className="absolute bottom-8 left-8 text-stone-700 text-lg italic opacity-80 max-w-sm">
        {(bossId || (showCombat && selectedBoss))
          ? "Face your destiny with honor"
          : gameActive 
            ? "Strike swift, defend strong" 
            : "In stillness, the paper finds its form"
        }
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(10px); }
          75% { transform: translateY(-15px) translateX(15px); }
        }
        
        @keyframes sway {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(2deg); }
        }
        
        @keyframes fall {
          0% { transform: translateY(-100%); opacity: 0.8; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        @keyframes snowfall {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(100vh) translateX(20px); }
        }
        
        @keyframes lightning {
          0%, 100% { opacity: 0; }
          10%, 15% { opacity: 0.8; }
          16% { opacity: 0; }
          20%, 22% { opacity: 0.6; }
          23% { opacity: 0; }
        }
        
        @keyframes spark {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DojoEnvironment;
