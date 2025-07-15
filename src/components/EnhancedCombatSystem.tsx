import React, { useState, useEffect, useRef } from 'react';
import { Heart, Shield, Zap, Target, Volume2, VolumeX, Settings } from 'lucide-react';
import OrigamiPatternTracer from './OrigamiPatternTracer';
import DamageNumber from './DamageNumber';
import SettingsModal from './SettingsModal';
import PaperFoldingGame from './PaperFoldingGame';
import ElementalEffect, { ElementalStatus } from './ElementalEffect';
import { useScreenShake } from '../hooks/useScreenShake';
import { soundManager } from '../utils/SoundManager';
import '../styles/ElementalEffects.css';
import '../styles/UltimateEffects.css';

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  type: 'paper-soldier' | 'origami-warrior' | 'paper-dragon' | 'shadow-boss';
  attackCooldown: number;
  requiredPattern?: string;
  elementalStatus?: {
    type: 'fire' | 'water' | 'wind' | 'earth' | null;
    duration: number;
    value: number; 
    tickInterval?: number;
    appliedAt: number;
  } | null;
}

interface OrigamiPattern {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  attackType: 'crane' | 'dragon' | 'butterfly' | 'samurai' | 'lotus';
  damage: number;
  description: string;
  timeLimit: number;
  color: string;
  element?: 'fire' | 'water' | 'wind' | 'earth' | null;
}

interface EnhancedCombatSystemProps {
  playerHealth: number;
  onPlayerDamage: (damage: number) => void;
  onScoreUpdate: (points: number) => void;
  onGameOver: () => void;
  bossMode?: boolean;
  bossId?: string;
  challengeMode?: {
    type: 'time-attack' | 'survival' | 'accuracy' | 'speed-trace';
    timeLimit?: number;
    requiredAccuracy?: number;
    onComplete: () => void;
    onStatsUpdate: (stats: any) => void;
  };
  ultimateEnabled?: boolean;
}

const EnhancedCombatSystem = ({ 
  playerHealth, 
  onPlayerDamage, 
  onScoreUpdate, 
  onGameOver,
  bossMode = false,
  bossId,
  challengeMode,
  ultimateEnabled = true
}: EnhancedCombatSystemProps) => {
  const { shake, shakeStyle } = useScreenShake();
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [currentPattern, setCurrentPattern] = useState<OrigamiPattern | null>(null);
  const [showPatternTracer, setShowPatternTracer] = useState(false);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [playerCombo, setPlayerCombo] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [comboText, setComboText] = useState<string>('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [ultimateCharge, setUltimateCharge] = useState(0);
  const [ultimateReady, setUltimateReady] = useState(false);
  const [ultimateAnimation, setUltimateAnimation] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: number;
    damage: number;
    x: number;
    y: number;
    type: 'normal' | 'critical' | 'heal';
  }>>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isDefending, setIsDefending] = useState(false);
  const [defensePattern, setDefensePattern] = useState<OrigamiPattern | null>(null);
  const [showDefenseTracer, setShowDefenseTracer] = useState(false);
  const [showPaperFolding, setShowPaperFolding] = useState(false);
  const [pendingDamage, setPendingDamage] = useState<number>(0);
  const [awaitingKeyPress, setAwaitingKeyPress] = useState(false);
  const [requiredKey, setRequiredKey] = useState<string>('');
  const [keyPrompt, setKeyPrompt] = useState('');
  const [lastAccuracy, setLastAccuracy] = useState<number>(0);
  const [lastAttackType, setLastAttackType] = useState<string>('');

  const origamiPatterns: OrigamiPattern[] = [
    {
      id: 'crane',
      name: 'Paper Crane',
      points: [
        { x: 300, y: 100 },
        { x: 250, y: 150 },
        { x: 350, y: 150 },
        { x: 300, y: 200 },
        { x: 300, y: 250 }
      ],
      attackType: 'crane',
      damage: 35,
      description: 'Swift and precise strike',
      timeLimit: 8,
      color: '#3b82f6',
      element: null
    },
    {
      id: 'dragon',
      name: 'Mighty Dragon',
      points: [
        { x: 200, y: 150 },
        { x: 250, y: 100 },
        { x: 350, y: 100 },
        { x: 400, y: 150 },
        { x: 350, y: 200 },
        { x: 300, y: 250 },
        { x: 250, y: 200 }
      ],
      attackType: 'dragon',
      damage: 80,
      description: 'Devastating heavy attack',
      timeLimit: 12,
      color: '#dc2626',
      element: 'fire'
    },
    {
      id: 'butterfly',
      name: 'Dancing Butterfly',
      points: [
        { x: 300, y: 150 },
        { x: 250, y: 100 },
        { x: 200, y: 150 },
        { x: 250, y: 200 },
        { x: 300, y: 150 },
        { x: 350, y: 100 },
        { x: 400, y: 150 },
        { x: 350, y: 200 }
      ],
      attackType: 'butterfly',
      damage: 25,
      description: 'Multi-hit combo attack',
      timeLimit: 10,
      color: '#8b5cf6',
      element: 'wind'
    },
    {
      id: 'samurai',
      name: 'Samurai Strike',
      points: [
        { x: 300, y: 80 },
        { x: 300, y: 320 },
        { x: 250, y: 200 },
        { x: 350, y: 200 }
      ],
      attackType: 'samurai',
      damage: 120,
      description: 'Critical strike with high damage',
      timeLimit: 6,
      color: '#f59e0b',
      element: 'earth'
    },
    {
      id: 'lotus',
      name: 'Healing Lotus',
      points: [
        { x: 300, y: 200 },
        { x: 280, y: 150 },
        { x: 320, y: 150 },
        { x: 280, y: 250 },
        { x: 320, y: 250 },
        { x: 300, y: 200 }
      ],
      attackType: 'lotus',
      damage: 0,
      description: 'Restore health and boost defense',
      timeLimit: 8,
      color: '#10b981',
      element: 'water'
    },
    {
      id: 'phoenix',
      name: 'Rising Phoenix',
      points: [
        { x: 300, y: 300 },
        { x: 200, y: 200 },
        { x: 250, y: 100 },
        { x: 300, y: 150 },
        { x: 350, y: 100 },
        { x: 400, y: 200 },
        { x: 300, y: 50 }
      ],
      attackType: 'crane',
      damage: 90,
      description: 'Explosive fire damage with knockback',
      timeLimit: 10,
      color: '#f97316',
      element: 'fire'
    },
    {
      id: 'tiger',
      name: 'Paper Tiger',
      points: [
        { x: 200, y: 200 },
        { x: 300, y: 150 },
        { x: 400, y: 200 },
        { x: 350, y: 250 },
        { x: 250, y: 250 },
        { x: 200, y: 200 }
      ],
      attackType: 'samurai',
      damage: 65,
      description: 'Fierce claw attack',
      timeLimit: 7,
      color: '#eab308',
      element: 'earth'
    },
    {
      id: 'spider',
      name: 'Shadow Spider',
      points: [
        { x: 300, y: 200 },
        { x: 250, y: 150 },
        { x: 200, y: 200 },
        { x: 250, y: 250 },
        { x: 300, y: 200 },
        { x: 350, y: 150 },
        { x: 400, y: 200 },
        { x: 350, y: 250 }
      ],
      attackType: 'butterfly',
      damage: 45,
      description: 'Web trap with poison damage',
      timeLimit: 9,
      color: '#6b7280',
      element: null
    },
    {
      id: 'turtle',
      name: 'Guardian Turtle',
      points: [
        { x: 300, y: 100 },
        { x: 350, y: 150 },
        { x: 400, y: 200 },
        { x: 350, y: 250 },
        { x: 300, y: 300 },
        { x: 250, y: 250 },
        { x: 200, y: 200 },
        { x: 250, y: 150 }
      ],
      attackType: 'lotus',
      damage: 0,
      description: 'Defensive barrier and health regeneration',
      timeLimit: 12,
      color: '#059669',
      element: 'earth'
    },
    {
      id: 'eagle',
      name: 'Storm Eagle',
      points: [
        { x: 300, y: 250 },
        { x: 200, y: 150 },
        { x: 300, y: 100 },
        { x: 400, y: 150 },
        { x: 350, y: 200 },
        { x: 250, y: 200 }
      ],
      attackType: 'dragon',
      damage: 70,
      description: 'Lightning strike from above',
      timeLimit: 8,
      color: '#0ea5e9',
      element: 'wind'
    },
    {
      id: 'fox',
      name: 'Cunning Fox',
      points: [
        { x: 250, y: 100 },
        { x: 350, y: 100 },
        { x: 400, y: 150 },
        { x: 350, y: 200 },
        { x: 300, y: 250 },
        { x: 250, y: 200 },
        { x: 200, y: 150 }
      ],
      attackType: 'crane',
      damage: 55,
      description: 'Illusion attack with confusion',
      timeLimit: 9,
      color: '#c2410c',
      element: null
    }
  ];
  const getEnemyConfig = (type: string) => {
    switch (type) {
      case 'paper-soldier':
        return { health: 150, damage: 15, points: 100 };
      case 'origami-warrior':
        return { health: 300, damage: 25, points: 250 };
      case 'paper-dragon':
        return { health: 600, damage: 40, points: 500 };
      case 'shadow-boss':
        return { health: 1200, damage: 60, points: 1000 };
      default:
        return { health: 150, damage: 15, points: 100 };
    }
  };
  useEffect(() => {
    if (bossMode && bossId) {
      const bossConfig = getEnemyConfig('shadow-boss');
      const boss: Enemy = {
        id: Date.now(),
        x: Math.random() * 60 + 20,
        y: Math.random() * 40 + 30,
        health: bossConfig.health,
        maxHealth: bossConfig.health,
        type: 'shadow-boss',
        attackCooldown: 0
      };
      setEnemies([boss]);
    } else {
      const spawnTimer = setInterval(() => {
        if (enemies.length < 3) {
          const enemyTypes = ['paper-soldier', 'origami-warrior', 'paper-dragon'];
          const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)] as Enemy['type'];
          const config = getEnemyConfig(randomType);
          const newEnemy: Enemy = {
            id: Date.now(),
            x: Math.random() * 70 + 15,
            y: Math.random() * 50 + 25,
            health: config.health,
            maxHealth: config.health,
            type: randomType,
            attackCooldown: 0
          };
          setEnemies(prev => [...prev, newEnemy]);
        }
      }, 3000);
      return () => clearInterval(spawnTimer);
    }
  }, [enemies.length, bossMode, bossId]);
  const handleEnemyClick = (enemy: Enemy) => {
    if (showPatternTracer || showPaperFolding) return;
    setSelectedEnemy(enemy);
    const usePaperFolding = Math.random() < 0.5; 
    if ((enemy.type === 'shadow-boss' || enemy.type === 'paper-dragon') && (Math.random() < 0.7 || usePaperFolding)) {
      setShowPaperFolding(true);
      return;
    }
    if (!usePaperFolding) {
      let availablePatterns: OrigamiPattern[] = [];
      switch (enemy.type) {
        case 'paper-soldier':
          availablePatterns = origamiPatterns.filter(p => 
            ['crane', 'butterfly', 'fox'].includes(p.id)
          );
          break;
        case 'origami-warrior':
          availablePatterns = origamiPatterns.filter(p => 
            ['tiger', 'samurai', 'spider', 'eagle'].includes(p.id)
          );
          break;
        case 'paper-dragon':
          availablePatterns = origamiPatterns.filter(p => 
            ['dragon', 'phoenix', 'eagle', 'tiger'].includes(p.id)
          );
          break;
        case 'shadow-boss':
          availablePatterns = origamiPatterns.filter(p => 
            !['lotus', 'turtle'].includes(p.id)
          );
          break;
        default:
          availablePatterns = origamiPatterns.slice(0, 3);
      }
      
      const randomPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
      setCurrentPattern(randomPattern);
      setShowPatternTracer(true);
    } else {
      setShowPaperFolding(true);
    }
  };
  const triggerKeyChallenge = () => {
    const keys = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setRequiredKey(randomKey);
    setAwaitingKeyPress(true);
    setKeyPrompt(`Press "${randomKey}" to complete the attack!`);
    setTimeout(() => {
      if (awaitingKeyPress) {
        setAwaitingKeyPress(false);
        setKeyPrompt('');
        setRequiredKey('');
        setPlayerCombo(0);
        setComboText('TOO SLOW!');
        setTimeout(() => setComboText(''), 1500);
      }
    }, 3000);
  };
  const handleKeyPress = (event: KeyboardEvent) => {
    if (!awaitingKeyPress || !requiredKey) return;
    if (event.key.toUpperCase() === requiredKey) {
      setAwaitingKeyPress(false);
      setKeyPrompt('');
      setRequiredKey('');
      finalizeAttack(true);
    } else {
      setAwaitingKeyPress(false);
      setKeyPrompt('');
      setRequiredKey('');
      setPlayerCombo(0);
      setComboText('WRONG KEY!');
      onPlayerDamage(10);
      shake(200, 8);
      soundManager.playError();
      finalizeAttack(false);
      setTimeout(() => setComboText(''), 1500);
    }
  };
  const handlePatternComplete = (accuracy: number, attackType: string) => {
    if (!currentPattern || !selectedEnemy) return;
    setLastAccuracy(accuracy);
    setLastAttackType(attackType);
    if (accuracy > 75) {
      triggerKeyChallenge();
    } else {
      finalizeAttack(false);
    }
    if (ultimateEnabled && !ultimateReady) {
      const chargeGain = Math.round(accuracy * 0.2);
      setUltimateCharge(prev => {
        const newCharge = Math.min(100, prev + chargeGain);
        if (newCharge >= 100 && prev < 100) {
          setUltimateReady(true);
          setComboText('ULTIMATE READY!');
          soundManager.playPowerUp();
        }
        return newCharge;
      });
    }
  };
  const finalizeAttack = (keySuccess: boolean = false) => {
    if (!currentPattern || !selectedEnemy) return;
    let damage = Math.round(currentPattern.damage * (lastAccuracy / 100));
    let damageType: 'normal' | 'critical' | 'combo' = 'normal';
    if (keySuccess) {
      damage = Math.round(damage * 1.3);
      setComboText('PERFECT EXECUTION!');
      shake(250, 10);
      soundManager.playCriticalHit();
    }
    if (lastAccuracy > 90) {
      setPlayerCombo(prev => prev + 1);
      damage = Math.round(damage * (1 + playerCombo * 0.15));
      damageType = lastAccuracy > 95 ? 'critical' : 'combo';
      shake(200, 8);
      setComboText(`PERFECT! x${playerCombo + 1}`);
      if (lastAccuracy > 95) {
        soundManager.playCriticalHit();
      } else {
        soundManager.playCombo(playerCombo);
      }
      if (playerCombo >= 4 && !achievements.includes('combo-master')) {
        setAchievements(prev => [...prev, 'combo-master']);
      }
    } else if (lastAccuracy > 70) {
      setPlayerCombo(prev => prev + 1);
      damage = Math.round(damage * (1 + playerCombo * 0.1));
      damageType = 'combo';
      shake(150, 5);
      setComboText(`GREAT! x${playerCombo + 1}`);
      soundManager.playCombo(playerCombo);
    } else {
      setPlayerCombo(0);
      setComboText('');
    }
    const enemyElement = document.querySelector(`[data-enemy-id="${selectedEnemy.id}"]`);
    if (enemyElement) {
      const rect = enemyElement.getBoundingClientRect();
      setDamageNumbers(prev => [...prev, {
        id: Date.now(),
        damage,
        x: rect.left + rect.width / 2,
        y: rect.top,
        type: damageType
      }]);
    }
    setTimeout(() => setComboText(''), 1500);
    if (lastAttackType === 'lotus') {
      console.log('Healing player');
    } else if (lastAttackType === 'butterfly') {
      damage = Math.round(damage * 3);
      shake(300, 12);
    } else if (lastAttackType === 'samurai' && lastAccuracy > 95) {
      damage = Math.round(damage * 1.5);
      shake(400, 15);
      setComboText('CRITICAL HIT!');
    }
    if (ultimateEnabled) {
      const chargeGain = Math.round(damage * 0.05 * (lastAccuracy / 100));
      setUltimateCharge(prev => {
        const newCharge = Math.min(100, prev + chargeGain);
        if (newCharge >= 100 && prev < 100) {
          setUltimateReady(true);
          setComboText('ULTIMATE READY!');
          soundManager.playPowerUp();
        }
        return newCharge;
      });
    }
    setEnemies(prev => prev.map(enemy => {
      if (enemy.id === selectedEnemy.id) {
        const newHealth = Math.max(0, enemy.health - damage);
        if (newHealth === 0) {
          const config = getEnemyConfig(enemy.type);
          onScoreUpdate(config.points * (1 + playerCombo * 0.2));
          shake(100, 6);
          if (enemy.type === 'shadow-boss' && !achievements.includes('boss-slayer')) {
            setAchievements(prev => [...prev, 'boss-slayer']);
          }
        }
        return { ...enemy, health: newHealth };
      }
      return enemy;
    }).filter(enemy => enemy.health > 0));
    setShowPatternTracer(false);
    setCurrentPattern(null);
    setSelectedEnemy(null);
  };
  const handlePatternTimeout = () => {
    setPlayerCombo(0);
    setShowPatternTracer(false);
    setCurrentPattern(null);
    setSelectedEnemy(null);
  };
  const triggerDefensePattern = (incomingDamage: number) => {
    setIsDefending(true);
    setPendingDamage(incomingDamage);
    const usePatternTracer = Math.random() > 0.4; 
    if (usePatternTracer) {
      const defensePatterns = origamiPatterns.filter(p => p.attackType === 'lotus' || p.id === 'turtle');
      const selectedDefensePattern = defensePatterns[Math.floor(Math.random() * defensePatterns.length)];
      setDefensePattern(selectedDefensePattern);
      setShowDefenseTracer(true);
      setTimeout(() => {
        if (isDefending) {
          handleDefenseTimeout(incomingDamage);
        }
      }, selectedDefensePattern.timeLimit * 1000);
    } else {
      setShowPaperFolding(true);
      setSelectedEnemy(null);
    }
  };
  const handleDefenseComplete = (accuracy: number, attackType: string) => {
    if (!defensePattern || !isDefending) return;
    const hasEarthElement = defensePattern?.id === 'turtle' || defensePattern?.id === 'mountain' || defensePattern?.element === 'earth';
    let damageReduction = 0;
    if (accuracy > 80) {
      damageReduction = hasEarthElement ? 0.9 : 0.8; 
      setComboText(hasEarthElement ? 'EARTH PERFECT DEFENSE!' : 'PERFECT DEFENSE!');
      shake(100, 3);
    } else if (accuracy > 60) {
      damageReduction = hasEarthElement ? 0.65 : 0.5;   
      setComboText(hasEarthElement ? 'EARTH GOOD DEFENSE!' : 'GOOD DEFENSE!');
      shake(80, 2);
    } else {
      damageReduction = hasEarthElement ? 0.35 : 0.2; 
      setComboText(hasEarthElement ? 'EARTH DEFENSE' : 'WEAK DEFENSE');
    }
    const reducedDamage = Math.round(pendingDamage * (1 - damageReduction));
    if (reducedDamage > 0) {
      onPlayerDamage(reducedDamage);
    }
    setTimeout(() => setComboText(''), 1500);
    setIsDefending(false);
    setShowDefenseTracer(false);
    setDefensePattern(null);
    setPendingDamage(0);
  };
  const handlePaperFoldingComplete = (success: boolean, type: 'attack' | 'defense', patternName?: string) => {
    setShowPaperFolding(false);
    
    if (!selectedEnemy) return;
    const pattern = patternName ? origamiPatterns.find(p => p.name.toLowerCase().includes(patternName.toLowerCase())) : null;
    let elementType = pattern?.element || null;
    if (!elementType && patternName) {
      const foldPatternName = patternName.toLowerCase();
      if (foldPatternName.includes('dragon') || foldPatternName.includes('phoenix')) {
        elementType = 'fire';
      } else if (foldPatternName.includes('butterfly') || foldPatternName.includes('eagle')) {
        elementType = 'wind';
      } else if (foldPatternName.includes('samurai') || foldPatternName.includes('turtle') || foldPatternName.includes('mountain')) {
        elementType = 'earth';
      } else if (foldPatternName.includes('lotus')) {
        elementType = 'water';
      }
    }
    if (success) {
      if (type === 'attack') {
        const baseDamage = pattern?.damage || 150;
        const damage = baseDamage + Math.floor(Math.random() * 100);
        const enemyElement = document.querySelector(`[data-enemy-id="${selectedEnemy.id}"]`);
        if (enemyElement) {
          const rect = enemyElement.getBoundingClientRect();
          setDamageNumbers(prev => [...prev, {
            id: Date.now(),
            damage,
            x: rect.left + rect.width / 2,
            y: rect.top,
            type: 'critical'
          }]);
        }
        let elementalStatus: ElementalStatus | null = null;
        if (elementType) {
          switch (elementType) {
            case 'fire':
              elementalStatus = {
                type: 'fire',
                duration: 10000, 
                value: Math.round(damage * 0.1),
                tickInterval: 2000,
                appliedAt: Date.now()
              };
              setComboText('FIRE DAMAGE OVER TIME!');
              break;
            case 'water':
              elementalStatus = {
                type: 'water',
                duration: 15000,
                value: 0.5,
                appliedAt: Date.now()
              };
              setComboText('WATER SLOW EFFECT!');
              break;
            case 'wind':
              const nearbyEnemies = enemies
                .filter(e => e.id !== selectedEnemy.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
              if (nearbyEnemies.length > 0) {
                setComboText('WIND MULTI-HIT ATTACK!');
                shake(300, 10);
              }
              nearbyEnemies.forEach(enemy => {
                const windDamage = Math.round(damage * 0.6);
                const enemyEl = document.querySelector(`[data-enemy-id="${enemy.id}"]`);
                if (enemyEl) {
                  const rect = enemyEl.getBoundingClientRect();
                  setDamageNumbers(prev => [...prev, {
                    id: Date.now() + enemy.id,
                    damage: windDamage,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    type: 'normal'
                  }]);
                }
                setEnemies(prev => prev.map(e => {
                  if (e.id === enemy.id) {
                    const newHealth = Math.max(0, e.health - windDamage);
                    return { ...e, health: newHealth };
                  }
                  return e;
                }));
              });
              elementalStatus = null;
              break;
            case 'earth':
              onPlayerDamage(-20); 
              setComboText('EARTH DEFENSE BOOST!');
              elementalStatus = null;
              break;
          }
        }
        setEnemies(prev => prev.map(e => {
          if (e.id === selectedEnemy.id) {
            const newHealth = Math.max(0, e.health - damage);
            return { 
              ...e, 
              health: newHealth,
              elementalStatus: elementalStatus
            };
          }
          return e;
        }));
        const scoreBonus = pattern ? playerCombo * 0.2 : 0;
        onScoreUpdate(damage * (1 + scoreBonus));
        shake(400, 15);
        soundManager.playCriticalHit();
        if (!comboText && elementType) {
          setComboText(`${elementType.toUpperCase()} ${pattern ? pattern.name.toUpperCase() : 'ORIGAMI'} MASTER!`);
        } else if (!comboText) {
          setComboText(pattern ? `${pattern.name.toUpperCase()} MASTER!` : 'ORIGAMI MASTER!');
        }
        setTimeout(() => setComboText(''), 1500);
        if (pattern && pattern.attackType === 'dragon' && !achievements.includes('dragon-master')) {
          setAchievements(prev => [...prev, 'dragon-master']);
        }
        if (ultimateEnabled && !ultimateReady) {
          const elementBonus = elementType ? 15 : 0;
          const patternBonus = pattern ? 10 : 5;
          const chargeGain = patternBonus + elementBonus;
          setUltimateCharge(prev => {
            const newCharge = Math.min(100, prev + chargeGain);
            if (newCharge >= 100 && prev < 100) {
              setUltimateReady(true);
              setComboText('ULTIMATE READY!');
              soundManager.playPowerUp();
            }
            return newCharge;
          });
        }
      } else {
        setPendingDamage(0);
        let healAmount = pattern?.attackType === 'lotus' ? 40 : 25;
        let defenseMessage = pattern?.attackType === 'lotus' ? 'LOTUS SHIELD!' : 'PAPER SHIELD!';
        if (elementType) {
          switch (elementType) {
            case 'earth':
              healAmount += 20;
              defenseMessage = 'EARTH FORTIFICATION!';
              break;
            case 'water':
              healAmount += 10;
              defenseMessage = 'WATER RESTORATION!';
              break;
            case 'wind':
              defenseMessage = 'WIND EVASION!';
              break;
            case 'fire':
              defenseMessage = 'FIRE COUNTER!';
              break;
          }
        }
        onPlayerDamage(-healAmount); 
        setComboText(defenseMessage);
        setTimeout(() => setComboText(''), 1500);
        if (ultimateEnabled && !ultimateReady) {
          const elementBonus = elementType ? 8 : 0;
          const baseCharge = 5;
          const chargeGain = baseCharge + elementBonus;
          setUltimateCharge(prev => {
            const newCharge = Math.min(100, prev + chargeGain);
            if (newCharge >= 100 && prev < 100) {
              setUltimateReady(true);
              setComboText('ULTIMATE READY!');
              soundManager.playPowerUp();
            }
            return newCharge;
          });
        }
      }
    } else {
      setComboText('FOLD FAILED!');
      setTimeout(() => setComboText(''), 1500);
      onPlayerDamage(10);
    }
    setSelectedEnemy(null);
  };
  const handleDefenseTimeout = (originalDamage: number) => {
    onPlayerDamage(originalDamage);
    setComboText('FAILED TO DEFEND!');
    setTimeout(() => setComboText(''), 1500);
    setIsDefending(false);
    setShowDefenseTracer(false);
    setDefensePattern(null);
  };
  useEffect(() => {
    if (enemies.length === 0) return;
    const attackTimer = setInterval(() => {
      if (!Array.isArray(enemies) || enemies.length === 0) return;
      if (Math.random() < 0.4 && !isDefending && !showDefenseTracer) {
        const randomIndex = Math.min(Math.floor(Math.random() * enemies.length), enemies.length - 1);
        const attackingEnemy = enemies[randomIndex];
        if (!attackingEnemy) return;        
        const config = getEnemyConfig(attackingEnemy.type);
        const hasWaterEffect = attackingEnemy.elementalStatus?.type === 'water';
        const attackChance = hasWaterEffect ? 0.2 : 0.4;
        if (!hasWaterEffect || Math.random() < attackChance) {
          if (Math.random() < 0.7) { 
            triggerDefensePattern(config.damage);
          } else {
            onPlayerDamage(config.damage);
          }
        }
      }
    }, 2000);

    return () => clearInterval(attackTimer);
  }, [enemies, onPlayerDamage, isDefending, showDefenseTracer, triggerDefensePattern]);
  useEffect(() => {
    if (playerHealth <= 0) {
      onGameOver();
    }
  }, [playerHealth, onGameOver]);
  useEffect(() => {
    if (bossMode && bossId && enemies.length === 0) {
      onGameOver();
    }
  }, [enemies.length, bossMode, bossId, onGameOver]);
  const prevEnemiesCountRef = useRef(enemies.length);
  useEffect(() => {
    if (challengeMode) {
      if (enemies.length < prevEnemiesCountRef.current) {
        const defeatedCount = prevEnemiesCountRef.current - enemies.length;       
        challengeMode.onStatsUpdate({ enemiesDefeated: defeatedCount });
      }
      prevEnemiesCountRef.current = enemies.length;
    }
  }, [enemies.length, challengeMode]);
  const handleElementalTick = (enemyId: number, type: ElementalStatus['type'], value: number) => {
    if (type === 'fire') {
      setEnemies(prev => {
        if (!Array.isArray(prev) || prev.length === 0) return prev;
        
        return prev.map(e => {
          if (e.id === enemyId) {
            const newHealth = Math.max(0, e.health - value);
            try {
              const enemyEl = document.querySelector(`[data-enemy-id="${enemyId}"]`);
              if (enemyEl) {
                const rect = enemyEl.getBoundingClientRect();
                setDamageNumbers(prevDamage => {
                  const limitedPrev = prevDamage.slice(-20); 
                  return [...limitedPrev, {
                    id: Date.now(),
                    damage: value,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    type: 'critical'
                  }];
                });
              }
            } catch (error) {
              console.error('Error displaying damage number:', error);
            }
            if (newHealth <= 0) {
              setComboText('BURNED TO ASHES!');
              setTimeout(() => setComboText(''), 1500);
            }
            return { ...e, health: newHealth };
          }
          return e;
        });
      });
    }
  };
  const handleElementalExpire = (enemyId: number) => {
    setEnemies(prev => prev.map(e => {
      if (e.id === enemyId) {
        return { ...e, elementalStatus: null };
      }
      return e;
    }));
  };
  const OrigamiEnemy = ({ enemy }: { enemy: Enemy }) => {
    const healthPercent = (enemy.health / enemy.maxHealth) * 100;
    const isBoss = enemy.type === 'shadow-boss' || enemy.type === 'paper-dragon';
    const getEnemySize = () => {
      switch (enemy.type) {
        case 'shadow-boss': return 96; 
        case 'paper-dragon': return 72; 
        case 'origami-warrior': return 56;
        default: return 40;
      }
    };
    const getEnemyColor = () => {
      switch (enemy.type) {
        case 'shadow-boss': return '#1f2937';
        case 'paper-dragon': return '#dc2626';
        case 'origami-warrior': return '#ea580c';
        default: return '#f59e0b';
      }
    };
    const getBossEffectClass = () => {
      if (enemy.type === 'shadow-boss') return 'shadow-boss-character';
      if (enemy.type === 'paper-dragon') return 'dragon-boss-character';
      return '';
    };
    const getElementalColor = () => {
      if (!enemy.elementalStatus) return '';
      
      switch (enemy.elementalStatus.type) {
        case 'fire': return '#FF5722';
        case 'water': return '#2196F3';
        case 'wind': return '#8BC34A';
        case 'earth': return '#795548';
        default: return '';
      }
    };
    const getElementalIcon = () => {
      if (!enemy.elementalStatus) return null;
      
      switch (enemy.elementalStatus.type) {
        case 'fire': return '🔥';
        case 'water': return '💧';
        case 'wind': return '💨';
        case 'earth': return '🌱';
        default: return null;
      }
    };
    const isElementalActive = () => {
      return enemy.elementalStatus && 
        Date.now() - enemy.elementalStatus.appliedAt < enemy.elementalStatus.duration;
    };
    const size = getEnemySize();
    return (
      <div
        data-enemy-id={enemy.id}
        className={`absolute transition-all duration-300 cursor-crosshair hover:scale-110 ${isBoss ? 'boss-character' : ''} ${enemy.type === 'shadow-boss' ? 'shadow-boss-character' : ''} ${enemy.type === 'paper-dragon' ? 'dragon-boss-character' : ''}`}
        style={{ 
          left: `${enemy.x}%`, 
          top: `${enemy.y}%`,
          filter: enemy.health < enemy.maxHealth * 0.3 ? 'hue-rotate(0deg) brightness(0.8)' : 'none'
        }}
        onClick={() => handleEnemyClick(enemy)}
      >
        <svg width={size} height={size} viewBox="0 0 32 32" className="drop-shadow-lg">
          <defs>
            <pattern id={`enemyTexture-${enemy.id}`} patternUnits="userSpaceOnUse" width="2" height="2">
              <rect width="2" height="2" fill={getEnemyColor()}/>
              <path d="M0,2l2,-2M-1,1l2,-2M1,3l2,-2" stroke="#000" strokeWidth="0.3" opacity="0.3"/>
            </pattern>
          </defs>
          <path
            d="M16 4 L20 8 L22 16 L20 24 L12 24 L10 16 L12 8 Z"
            fill={`url(#enemyTexture-${enemy.id})`}
            stroke="#000"
            strokeWidth="1"
          />
          <circle cx="16" cy="6" r="4" fill={getEnemyColor()} stroke="#000" strokeWidth="1" />
          <circle cx="14" cy="5" r="1" fill="#ff0000" />
          <circle cx="18" cy="5" r="1" fill="#ff0000" />
          <text x="16" y="8" textAnchor="middle" fontSize="4" fill="#fff" fontWeight="bold">
            {enemy.type === 'shadow-boss' ? '影' : enemy.type === 'paper-dragon' ? '龍' : '武'}
          </text>
        </svg>
        <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 ${isBoss ? 'w-20 h-2' : 'w-12 h-1'} bg-red-800 rounded-full ${
          healthPercent < 30 ? 'animate-pulse' : ''
        }`}>
          <div 
            className={`h-full rounded-full transition-all duration-300 ${isBoss ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-red-500'}`}
            style={{ 
              width: `${healthPercent}%`,
              boxShadow: isBoss ? '0 0 5px rgba(255, 0, 0, 0.7)' : 'none'
            }}
          />
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
          <Target className="w-3 h-3" />
        </div>
        {enemy.elementalStatus && (
          <ElementalEffect
            enemyId={enemy.id}
            status={enemy.elementalStatus}
            x={size / 2}
            y={size / 2}
            size={size}
            onTick={(type, value) => handleElementalTick(enemy.id, type, value)}
            onExpire={() => handleElementalExpire(enemy.id)}
          />
        )}
      </div>
    );
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (awaitingKeyPress) {
        handleKeyPress(event);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [awaitingKeyPress, requiredKey, handleKeyPress]);
  useEffect(() => {
    soundManager.playBackgroundMusic();
    return () => soundManager.stopBackgroundMusic();
  }, []);
  const executeUltimate = () => {
    if (!ultimateReady || ultimateAnimation) return;
    setUltimateAnimation(true);
    setUltimateReady(false);
    setUltimateCharge(0);
    soundManager.playUltimate();
    setComboText('THOUSAND FOLD TECHNIQUE!');
    shake(800, 20);
    try {
      const gameContainer = document.querySelector('.game-container') || document.body;
      if (!gameContainer) return;
      const particleCount = Math.min(40, window.innerWidth < 768 ? 20 : 40);
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'ultimate-particle';
        particle.style.position = 'absolute';
        particle.style.top = '50%';
        particle.style.left = '50%';
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = `${Math.random() * 10 + 5}px`;
        particle.style.background = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
        particle.style.borderRadius = '50%';
        particle.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
        particle.style.animation = `ultimate-particle ${Math.random() * 1 + 1}s ease-out forwards`;
        fragment.appendChild(particle);              
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 2000);
      }
      gameContainer.appendChild(fragment);
      const shockwave = document.createElement('div');
      shockwave.className = 'ultimate-shockwave';
      shockwave.style.position = 'absolute';
      shockwave.style.top = '50%';
      shockwave.style.left = '50%';
      shockwave.style.transform = 'translate(-50%, -50%)';
      gameContainer.appendChild(shockwave);
      
      setTimeout(() => {
        if (shockwave.parentNode) {
          shockwave.parentNode.removeChild(shockwave);
        }
      }, 1500);
    } catch (error) {
      console.error('Error creating ultimate effects:', error);
    }
    const baseDamage = 150 * playerLevel;
    
    setEnemies(prev => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      
      return prev.map(enemy => {
        let damage = baseDamage;
        if (enemy.type === 'shadow-boss') {
          damage = Math.round(baseDamage * 0.7);
        }
        try {
          const enemyEl = document.querySelector(`[data-enemy-id="${enemy.id}"]`);
          if (enemyEl) {
            const rect = enemyEl.getBoundingClientRect();
            setDamageNumbers(prevDamage => {
              const limitedPrev = prevDamage.slice(-20);
              return [...limitedPrev, {
                id: Date.now() + enemy.id,
                damage,
                x: rect.left + rect.width / 2,
                y: rect.top,
                type: 'critical'
              }];
            });
          }
        } catch (error) {
          console.error('Error displaying damage number:', error);
        }
        const newHealth = Math.max(0, enemy.health - damage);
        return { 
          ...enemy, 
          health: newHealth,
          elementalStatus: {
            type: 'fire',
            duration: 10000, 
            value: Math.round(damage * 0.1),
            tickInterval: 1000,
            appliedAt: Date.now()
          }
        };
      });
    });
    setTimeout(() => {
      setUltimateAnimation(false);
    }, 2000);    
    if (!achievements.includes('ultimate-master')) {
      setAchievements(prev => [...prev, 'ultimate-master']);
    }
  };
  return (
    <div className="absolute inset-0 pointer-events-none" style={shakeStyle}>
      {damageNumbers.map(damageNum => (
        <DamageNumber
          key={damageNum.id}
          damage={damageNum.damage}
          x={damageNum.x}
          y={damageNum.y}
          type={damageNum.type}
          onComplete={() => setDamageNumbers(prev => prev.filter(d => d.id !== damageNum.id))}
        />
      ))}
      <div className="pointer-events-auto">
        {enemies.map(enemy => (
          <OrigamiEnemy key={enemy.id} enemy={enemy} />
        ))}
      </div>
      {ultimateAnimation && (
        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-radial from-red-600 to-transparent bg-opacity-30 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={`line-${i}`}
                className="absolute top-1/2 left-1/2 h-1 bg-yellow-500 origin-left"
                style={{
                  width: '100%',
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                  opacity: 0.7,
                  animation: 'ultimate-pulse 1s infinite ease-in-out',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400 rounded-full filter blur-xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse opacity-70" />            
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `ultimate-particle-float ${Math.random() * 1.5 + 1}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  opacity: Math.random() * 0.5 + 0.5
                }}
              />
            ))}
          </div>
        </div>
      )}
      {showPatternTracer && currentPattern && (
        <div className="pointer-events-auto">
          <OrigamiPatternTracer
            pattern={currentPattern}
            onComplete={handlePatternComplete}
            onTimeout={handlePatternTimeout}
            isActive={showPatternTracer}
          />
        </div>
      )}
      {showDefenseTracer && defensePattern && (
        <div className="pointer-events-auto relative">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center animate-pulse">
              <div className="font-bold">INCOMING ATTACK!</div>
              <div className="text-sm">Trace the pattern to defend!</div>
            </div>
          </div>
          <OrigamiPatternTracer
            pattern={defensePattern}
            onComplete={handleDefenseComplete}
            onTimeout={() => handleDefenseTimeout(pendingDamage)}
            isActive={showDefenseTracer}
          />
        </div>
      )}
      {showPaperFolding && (
        <div className="pointer-events-auto">
          <PaperFoldingGame
            onComplete={handlePaperFoldingComplete}
            onClose={() => {
              setShowPaperFolding(false);
              setSelectedEnemy(null);
            }}
          />
        </div>
      )}
       {ultimateEnabled && (
         <div className="absolute top-4 right-4 w-40 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 text-white">
           <div className="flex items-center gap-2 mb-2">
             <Zap className={`w-4 h-4 ultimate-icon ${ultimateReady ? 'ready text-yellow-400' : 'text-blue-400'}`} />
             <span className="text-sm font-bold">Ultimate</span>
           </div>
           <div className={`w-full h-3 bg-gray-700 rounded-full overflow-hidden ultimate-charge-meter ${ultimateReady ? 'ready' : ''}`}>
             <div 
               className={`h-full meter-fill ${ultimateReady ? 'bg-yellow-400' : 'bg-blue-500'}`}
               style={{ width: `${ultimateCharge}%` }}
             />
           </div>
           {ultimateReady && (
             <button 
               onClick={executeUltimate}
               className="mt-2 w-full py-1 px-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded text-xs transition-colors ultimate-button"
             >
               UNLEASH ULTIMATE
             </button>
           )}
         </div>
       )}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Combo: {playerCombo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Level: {playerLevel}</span>
            </div>
            <button 
              onClick={() => soundManager.toggleSound()}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              {soundManager.isEnabled() ? 
                <Volume2 className="w-4 h-4" /> : 
                <VolumeX className="w-4 h-4" />
              }
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-center opacity-70">
            Click on enemies to start pattern tracing
            <br />
            Complete patterns with good accuracy to unlock keyboard challenges!
          </div>
        </div>
      </div>
      {awaitingKeyPress && keyPrompt && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-lg text-center animate-pulse border-4 border-yellow-400">
            <div className="text-2xl font-bold mb-2">{keyPrompt}</div>
            <div className="text-6xl font-bold animate-bounce bg-yellow-400 text-blue-900 rounded-lg px-4 py-2 inline-block">
              {requiredKey}
            </div>
            <div className="text-sm mt-2 opacity-80">Quick! You have 3 seconds!</div>
          </div>
        </div>
      )}
      {comboText && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-4xl font-bold text-yellow-400 animate-bounce drop-shadow-lg">
            {comboText}
          </div>
        </div>
      )}
      {achievements.length > 0 && (
        <div className="absolute top-20 right-20 pointer-events-none">
          {achievements.slice(-3).map((achievement, index) => (
            <div key={achievement} className="bg-yellow-500 text-black p-3 rounded-lg mb-2 animate-slide-in-right">
              <div className="font-bold text-sm">Achievement Unlocked!</div>
              <div className="text-xs">
                {achievement === 'combo-master' && 'Combo Master: 5+ hit combo'}
                {achievement === 'boss-slayer' && 'Boss Slayer: Defeated a boss'}
              </div>
            </div>
          ))}
        </div>
      )}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default EnhancedCombatSystem;
