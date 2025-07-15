import React, { useState, useEffect } from 'react';
import { Star, Award, Zap, Shield, Target, Crown, Home } from 'lucide-react';

interface PlayerStats {
  level: number;
  experience: number;
  nextLevelExp: number;
  mastery: {
    crane: number;
    dragon: number;
    butterfly: number;
    samurai: number;
    lotus: number;
  };
  unlockedPatterns: string[];
  achievements: string[];
  specialAbilities: string[];
}

interface ProgressionSystemProps {
  onStatsUpdate: (stats: PlayerStats) => void;
  currentStats?: PlayerStats;
  onBack?: () => void;
}

const ProgressionSystem = ({ onStatsUpdate, currentStats, onBack }: ProgressionSystemProps) => {
  const [stats, setStats] = useState<PlayerStats>(currentStats || {
    level: 1,
    experience: 0,
    nextLevelExp: 100,
    mastery: {
      crane: 0,
      dragon: 0,
      butterfly: 0,
      samurai: 0,
      lotus: 0
    },
    unlockedPatterns: ['crane', 'butterfly'],
    achievements: [],
    specialAbilities: []
  });

  const achievements = [
    { id: 'first-victory', name: 'First Victory', description: 'Win your first battle', icon: Award, requirement: 'defeat_enemy' },
    { id: 'combo-master', name: 'Combo Master', description: 'Achieve a 5x combo', icon: Zap, requirement: 'combo_5' },
    { id: 'perfect-trace', name: 'Perfect Trace', description: 'Complete a pattern with 100% accuracy', icon: Target, requirement: 'perfect_accuracy' },
    { id: 'boss-slayer', name: 'Boss Slayer', description: 'Defeat a boss enemy', icon: Crown, requirement: 'defeat_boss' },
    { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a pattern in under 3 seconds', icon: Zap, requirement: 'speed_3s' },
    { id: 'pattern-master', name: 'Pattern Master', description: 'Unlock all basic patterns', icon: Star, requirement: 'unlock_all_basic' }
  ];

  const specialAbilities = [
    { id: 'time-slow', name: 'Temporal Focus', description: 'Slow down time during pattern tracing', level: 3, unlocked: false },
    { id: 'damage-boost', name: 'Paper Storm', description: '2x damage for next 3 attacks', level: 5, unlocked: false },
    { id: 'shield', name: 'Origami Barrier', description: 'Block incoming damage for 10 seconds', level: 7, unlocked: false },
    { id: 'multi-strike', name: 'Thousand Folds', description: 'Attack multiple enemies at once', level: 10, unlocked: false }
  ];

  const addExperience = (exp: number, patternType?: string) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      newStats.experience += exp;
      if (patternType && newStats.mastery[patternType as keyof typeof newStats.mastery] !== undefined) {
        newStats.mastery[patternType as keyof typeof newStats.mastery] += 1;
      }
      while (newStats.experience >= newStats.nextLevelExp) {
        newStats.experience -= newStats.nextLevelExp;
        newStats.level += 1;
        newStats.nextLevelExp = Math.floor(newStats.nextLevelExp * 1.5);
        checkUnlocks(newStats);
      }
      onStatsUpdate(newStats);
      return newStats;
    });
  };
  const checkUnlocks = (newStats: PlayerStats) => {
    if (newStats.level >= 3 && !newStats.unlockedPatterns.includes('dragon')) {
      newStats.unlockedPatterns.push('dragon');
    }
    if (newStats.level >= 5 && !newStats.unlockedPatterns.includes('samurai')) {
      newStats.unlockedPatterns.push('samurai');
    }
    if (newStats.level >= 7 && !newStats.unlockedPatterns.includes('lotus')) {
      newStats.unlockedPatterns.push('lotus');
    }
    specialAbilities.forEach(ability => {
      if (newStats.level >= ability.level && !newStats.specialAbilities.includes(ability.id)) {
        newStats.specialAbilities.push(ability.id);
      }
    });
  };
  const unlockAchievement = (achievementId: string) => {
    setStats(prevStats => {
      if (!prevStats.achievements.includes(achievementId)) {
        const newStats = { ...prevStats };
        newStats.achievements.push(achievementId);
        onStatsUpdate(newStats);
        return newStats;
      }
      return prevStats;
    });
  };
  useEffect(() => {
    (window as any).progressionSystem = {
      addExperience,
      unlockAchievement,
      getStats: () => stats
    };
  }, [stats]);
  return (
    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500" />
          Warrior's Progress
        </h2>
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Return Home
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-4">
            <h3 className="font-semibold text-stone-800 mb-2">Level {stats.level}</h3>
            <div className="w-full bg-stone-300 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(stats.experience / stats.nextLevelExp) * 100}%` }}
              />
            </div>
            <p className="text-sm text-stone-600">
              {stats.experience} / {stats.nextLevelExp} EXP
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-stone-800 mb-3">Pattern Mastery</h3>
            <div className="space-y-2">
              {Object.entries(stats.mastery).map(([pattern, mastery]) => (
                <div key={pattern} className="flex justify-between items-center">
                  <span className="capitalize text-stone-700">{pattern}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.min(mastery / 10, 5) ? 'text-amber-400 fill-current' : 'text-stone-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              Special Abilities
            </h3>
            <div className="space-y-2">
              {specialAbilities.map(ability => {
                const unlocked = stats.specialAbilities.includes(ability.id);
                return (
                  <div 
                    key={ability.id} 
                    className={`p-2 rounded ${unlocked ? 'bg-white shadow-sm' : 'bg-stone-100 opacity-60'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${unlocked ? 'text-stone-800' : 'text-stone-500'}`}>
                        {ability.name}
                      </span>
                      <span className="text-xs text-stone-500">
                        {unlocked ? 'UNLOCKED' : `Level ${ability.level}`}
                      </span>
                    </div>
                    <p className={`text-xs ${unlocked ? 'text-stone-600' : 'text-stone-400'}`}>
                      {ability.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              Achievements ({stats.achievements.length}/{achievements.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {achievements.map(achievement => {
                const unlocked = stats.achievements.includes(achievement.id);
                const Icon = achievement.icon;
                return (
                  <div 
                    key={achievement.id}
                    className={`p-2 rounded text-center ${
                      unlocked ? 'bg-white shadow-sm border border-green-200' : 'bg-stone-100 opacity-60'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${unlocked ? 'text-green-500' : 'text-stone-400'}`} />
                    <p className={`text-xs font-medium ${unlocked ? 'text-stone-800' : 'text-stone-500'}`}>
                      {achievement.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




export default ProgressionSystem;