import React, { useState, useEffect } from 'react';
import { Sword, Shield, Zap } from 'lucide-react';

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  type: 'regular' | 'boss';
  attackCooldown: number;
}
interface CombatSystemProps {
  playerHealth: number;
  onPlayerDamage: (damage: number) => void;
  onScoreUpdate: (points: number) => void;
  onGameOver: () => void;
  bossMode?: boolean;
  bossId?: string;
}
const CombatSystem = ({ 
  playerHealth, 
  onPlayerDamage, 
  onScoreUpdate, 
  onGameOver,
  bossMode = false,
  bossId 
}: CombatSystemProps) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  useEffect(() => {
    const gameTimer = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(gameTimer);
  }, []);
  useEffect(() => {
    if (bossMode && bossId) {
      const boss: Enemy = {
        id: Date.now(),
        x: Math.random() * 60 + 20,
        y: Math.random() * 40 + 30,
        health: 200,
        maxHealth: 200,
        type: 'boss',
        attackCooldown: 0
      };
      setEnemies([boss]);
    } else {
      const spawnTimer = setInterval(() => {
        if (enemies.length < 5) {
          const newEnemy: Enemy = {
            id: Date.now(),
            x: Math.random() * 70 + 15,
            y: Math.random() * 50 + 25,
            health: 50,
            maxHealth: 50,
            type: 'regular',
            attackCooldown: 0
          };
          setEnemies(prev => [...prev, newEnemy]);
        }
      }, 2000);
      return () => clearInterval(spawnTimer);
    }
  }, [enemies.length, bossMode, bossId]);
  const handleAttack = () => {
    if (!playerAttacking) {
      setPlayerAttacking(true);
      if (enemies.length > 0) {
        const target = enemies[0];
        setEnemies(prev => prev.map(enemy => 
          enemy.id === target.id 
            ? { ...enemy, health: enemy.health - 25 }
            : enemy
        ).filter(enemy => enemy.health > 0));
        onScoreUpdate(bossMode ? 200 : 100);
      }
      setTimeout(() => setPlayerAttacking(false), 500);
    }
  };
  const handleDefend = () => {
    setTimeout(() => {
      if (enemies.length > 0) {
        onPlayerDamage(5);
      }
    }, 200);
  };
  const handleSpecialMove = () => {
    setEnemies(prev => prev.map(enemy => ({
      ...enemy,
      health: enemy.health - 40
    })).filter(enemy => enemy.health > 0));
    
    onScoreUpdate(bossMode ? 300 : 150);
  };

  useEffect(() => {
    const attackTimer = setInterval(() => {
      if (enemies.length > 0 && Math.random() < 0.3) {
        onPlayerDamage(bossMode ? 20 : 10);
      }
    }, 1500);
    return () => clearInterval(attackTimer);
  }, [enemies.length, onPlayerDamage, bossMode]);
  useEffect(() => {
    if (playerHealth <= 0) {
      onGameOver();
    }
  }, [playerHealth, onGameOver]);
  const OrigamiShinobi = ({ enemy }: { enemy: Enemy }) => {
    const healthPercent = (enemy.health / enemy.maxHealth) * 100;
    const isAttacking = enemy.attackCooldown > 0;
    return (
      <div
        className={`absolute transition-all duration-300 ${isAttacking ? 'animate-pulse' : ''}`}
        style={{
          left: `${enemy.x}%`,
          top: `${enemy.y}%`,
          transform: enemy.type === 'boss' ? 'scale(1.5)' : 'scale(1)'
        }}
      >
        <svg
          width={enemy.type === 'boss' ? "48" : "32"}
          height={enemy.type === 'boss' ? "48" : "32"}
          viewBox="0 0 32 32"
          className="drop-shadow-md"
        >
          <defs>
            <pattern id={`paperTexture-${enemy.id}`} patternUnits="userSpaceOnUse" width="2" height="2">
              <rect width="2" height="2" fill={enemy.type === 'boss' ? "#dc2626" : "#ea580c"}/>
              <path d="M0,2l2,-2M-1,1l2,-2M1,3l2,-2" stroke="#000" strokeWidth="0.3" opacity="0.2"/>
            </pattern>
          </defs>
          <path
            d="M16 4 L20 8 L22 16 L20 24 L12 24 L10 16 L12 8 Z"
            fill={`url(#paperTexture-${enemy.id})`}
            stroke="#000"
            strokeWidth="1"
          />
          <path
            d="M12 10 L6 12 L8 16 L12 14 Z"
            fill={enemy.type === 'boss' ? "#b91c1c" : "#c2410c"}
            stroke="#000"
            strokeWidth="0.8"
          />
          <path
            d="M20 10 L26 12 L24 16 L20 14 Z"
            fill={enemy.type === 'boss' ? "#b91c1c" : "#c2410c"}
            stroke="#000"
            strokeWidth="0.8"
          />
          <circle
            cx="16"
            cy="6"
            r="4"
            fill={enemy.type === 'boss' ? "#7f1d1d" : "#9a3412"}
            stroke="#000"
            strokeWidth="1"
          />
          <circle cx="14" cy="5" r="1" fill="#ff0000" />
          <circle cx="18" cy="5" r="1" fill="#ff0000" />
          <text
            x="16"
            y="8"
            textAnchor="middle"
            fontSize="4"
            fill="#fff"
            fontWeight="bold"
          >
            {enemy.type === 'boss' ? '鬼' : '紙'}
          </text>
          <path
            d="M14 24 L12 30 L16 30 L16 24 Z"
            fill={enemy.type === 'boss' ? "#b91c1c" : "#c2410c"}
            stroke="#000"
            strokeWidth="0.8"
          />
          <path
            d="M18 24 L20 30 L16 30 L16 24 Z"
            fill={enemy.type === 'boss' ? "#b91c1c" : "#c2410c"}
            stroke="#000"
            strokeWidth="0.8"
          />
        </svg>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-red-800 rounded-full">
          <div 
            className="h-full bg-red-500 rounded-full transition-all duration-300"
            style={{ width: `${healthPercent}%` }}
          />
        </div>
        {isAttacking && (
          <div className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-ping">
            ⚡
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {enemies.map(enemy => (
        <OrigamiShinobi key={enemy.id} enemy={enemy} />
      ))}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 pointer-events-auto">
        <button
          onClick={handleAttack}
          disabled={playerAttacking}
          className={`px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200 ${
            playerAttacking ? 'opacity-50 scale-95' : 'hover:bg-red-700 hover:scale-105'
          }`}
        >
          <Sword className="w-4 h-4" />
          Attack
        </button>
        <button
          onClick={handleDefend}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
        >
          <Shield className="w-4 h-4" />
          Defend
        </button>
        
        <button
          onClick={handleSpecialMove}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-all duration-200 hover:scale-105"
        >
          <Zap className="w-4 h-4" />
          Transform
        </button>
      </div>
    </div>
  );
};

export default CombatSystem;
