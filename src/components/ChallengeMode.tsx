import React, { useState, useEffect } from 'react';
import { Clock, Target, Zap, Trophy, ArrowLeft, Swords, Scissors } from 'lucide-react';
import PaperButton from './PaperButton';
import EnhancedCombatSystem from './EnhancedCombatSystem';
import PaperFoldingGame from './PaperFoldingGame';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'time-attack' | 'survival' | 'accuracy' | 'speed-trace' | 'origami';
  icon: React.ComponentType<any>;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  rewards: {
    exp: number;
    achievement?: string;
  };
  objectives: string[];
  timeLimit?: number;
  requiredAccuracy?: number;
  enemyWaves?: number;
  foldCount?: number;
}
interface ChallengeModeProps {
  onBack: () => void;
  playerLevel: number;
  onStatsUpdate: (exp: number) => void;
}
const ChallengeMode = ({ onBack, playerLevel, onStatsUpdate }: ChallengeModeProps) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeActive, setChallengeActive] = useState(false);
  const [showPaperFolding, setShowPaperFolding] = useState(false);
  const [foldSuccessCount, setFoldSuccessCount] = useState(0);
  const [challengeStats, setChallengeStats] = useState({
    timeRemaining: 0,
    score: 0,
    accuracy: 0,
    enemiesDefeated: 0,
    currentWave: 1
  });
  const challenges: Challenge[] = [
    {
      id: 'speed-master',
      name: 'Speed Master',
      description: 'Defeat enemies as quickly as possible',
      type: 'time-attack',
      icon: Clock,
      difficulty: 'Easy',
      rewards: { exp: 50 },
      objectives: ['Defeat 5 enemies in 60 seconds', 'Maintain combo chains'],
      timeLimit: 60,
      enemyWaves: 5
    },
    {
      id: 'endless-waves',
      name: 'Endless Waves',
      description: 'Survive increasingly difficult enemy waves',
      type: 'survival',
      icon: Swords,
      difficulty: 'Medium',
      rewards: { exp: 100, achievement: 'survivor' },
      objectives: ['Survive 10 waves', 'Enemies get stronger each wave'],
      enemyWaves: 10
    },
    {
      id: 'perfect-execution',
      name: 'Perfect Execution',
      description: 'Complete patterns with flawless precision',
      type: 'accuracy',
      icon: Target,
      difficulty: 'Hard',
      rewards: { exp: 150, achievement: 'perfectionist' },
      objectives: ['Achieve 95%+ accuracy on 10 patterns', 'No mistakes allowed'],
      requiredAccuracy: 95
    },
    {
      id: 'lightning-trace',
      name: 'Lightning Trace',
      description: 'Trace patterns at lightning speed',
      type: 'speed-trace',
      icon: Zap,
      difficulty: 'Expert',
      rewards: { exp: 200, achievement: 'speed-demon' },
      objectives: ['Complete patterns in under 3 seconds', 'Maintain accuracy above 80%'],
      timeLimit: 3,
      requiredAccuracy: 80
    },
    {
      id: 'origami-master',
      name: 'Origami Master',
      description: 'Perfect the art of paper folding for battle',
      type: 'origami',
      icon: Scissors,
      difficulty: 'Medium',
      rewards: { exp: 150, achievement: 'origami-master' },
      objectives: ['Complete 5 successful paper folds', 'Master both attack and defense folds'],
      timeLimit: 120,
      foldCount: 5
    }
  ];
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-blue-600 bg-blue-100';
      case 'Hard': return 'text-purple-600 bg-purple-100';
      case 'Expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setChallengeActive(true);
    setFoldSuccessCount(0);
    setChallengeStats({
      timeRemaining: challenge.timeLimit || 0,
      score: 0,
      accuracy: 0,
      enemiesDefeated: 0,
      currentWave: 1
    });
    if (challenge.type === 'origami') {
      setShowPaperFolding(true);
    }
  };
  const handlePaperFoldingComplete = (success: boolean, type: 'attack' | 'defense') => {
    setShowPaperFolding(false);
    
    if (success && selectedChallenge?.type === 'origami') {
      const newCount = foldSuccessCount + 1;
      setFoldSuccessCount(newCount);
      setChallengeStats(prev => ({
        ...prev,
        score: prev.score + 50
      }));
      if (newCount >= (selectedChallenge.foldCount || 5)) {
        endChallenge(true);
      } else {
        setTimeout(() => {
          setShowPaperFolding(true);
        }, 1500);
      }
    } else if (!success && selectedChallenge?.type === 'origami') {
      setTimeout(() => {
        setShowPaperFolding(true);
      }, 1500);
    }
  };
  const endChallenge = (success: boolean) => {
    if (success && selectedChallenge) {
      onStatsUpdate(selectedChallenge.rewards.exp);
      if (selectedChallenge.rewards.achievement) {
        (window as any).progressionSystem?.unlockAchievement(selectedChallenge.rewards.achievement);
      }
    }
    setChallengeActive(false);
    setSelectedChallenge(null);
  };
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (challengeActive && selectedChallenge?.timeLimit && challengeStats.timeRemaining > 0) {
      interval = setInterval(() => {
        setChallengeStats(prev => {
          if (prev.timeRemaining <= 1) {
            endChallenge(false);
            return prev;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [challengeActive, challengeStats.timeRemaining, selectedChallenge]);

  if (challengeActive && selectedChallenge) {
    return (
      <div className="w-full h-screen relative">
        <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
          <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">{selectedChallenge.name}</h3>
              <button 
                onClick={() => endChallenge(false)}
                className="pointer-events-auto bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
              >
                Quit Challenge
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {selectedChallenge.timeLimit && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{challengeStats.timeRemaining}s</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Score: {challengeStats.score}</span>
              </div>
              {selectedChallenge.type === 'origami' ? (
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  <span>Folds: {foldSuccessCount}/{selectedChallenge.foldCount || 5}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Accuracy: {challengeStats.accuracy.toFixed(1)}%</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4" />
                <span>Wave: {challengeStats.currentWave}</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs opacity-80">
                Objectives: {selectedChallenge.objectives.join(' • ')}
              </div>
            </div>
          </div>
        </div>
        {showPaperFolding && selectedChallenge.type === 'origami' ? (
          <div className="absolute inset-0 z-40 bg-black bg-opacity-70 flex items-center justify-center">
            <PaperFoldingGame
              onComplete={handlePaperFoldingComplete}
              onClose={() => {
                setShowPaperFolding(false);
                endChallenge(false);
              }}
            />
          </div>
        ) : (
          (selectedChallenge.type !== 'origami') && (
            <EnhancedCombatSystem
              playerHealth={100}
              onPlayerDamage={() => {}}
              onScoreUpdate={(points) => {
                setChallengeStats(prev => ({ ...prev, score: prev.score + points }));
              }}
              onGameOver={() => endChallenge(false)}
              challengeMode={{
                type: selectedChallenge.type as 'time-attack' | 'survival' | 'accuracy' | 'speed-trace',
                timeLimit: selectedChallenge.timeLimit,
                requiredAccuracy: selectedChallenge.requiredAccuracy,
                onComplete: () => endChallenge(true),
                onStatsUpdate: (stats) => setChallengeStats(prev => ({ ...prev, ...stats }))
              }}
            />
          )
        )}
      </div>
    );
  }
  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-50 to-stone-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-amber-500" />
              Challenge Dojo
            </h1>
            <p className="text-stone-600">Test your skills in specialized combat scenarios</p>
          </div>
          <PaperButton onClick={onBack} variant="secondary">
            <ArrowLeft className="w-4 h-4" />
            Return
          </PaperButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const Icon = challenge.icon;
            const isLocked = challenge.difficulty === 'Expert' && playerLevel < 10;
            return (
              <div
                key={challenge.id}
                className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                  isLocked 
                    ? 'border-stone-300 bg-stone-100 opacity-60' 
                    : 'border-stone-300 hover:border-amber-400 hover:shadow-lg cursor-pointer bg-white'
                }`}
                onClick={() => !isLocked && startChallenge(challenge)}
              >
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-8 h-8 ${isLocked ? 'text-stone-400' : 'text-amber-600'}`} />
                    <div>
                      <h3 className={`font-bold text-lg ${isLocked ? 'text-stone-500' : 'text-stone-800'}`}>
                        {challenge.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className={`mb-4 ${isLocked ? 'text-stone-500' : 'text-stone-600'}`}>
                    {challenge.description}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className={`font-semibold text-sm mb-1 ${isLocked ? 'text-stone-500' : 'text-stone-700'}`}>
                        Objectives:
                      </h4>
                      <ul className={`text-xs space-y-1 ${isLocked ? 'text-stone-400' : 'text-stone-600'}`}>
                        {challenge.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                      <div className={`text-xs ${isLocked ? 'text-stone-400' : 'text-stone-600'}`}>
                        Reward: {challenge.rewards.exp} EXP
                        {challenge.rewards.achievement && (
                          <span className="ml-2 text-amber-600 font-semibold">+ Achievement</span>
                        )}
                      </div>
                      
                      {isLocked ? (
                        <span className="text-xs text-red-500 font-semibold">
                          Requires Level 10
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 font-semibold">
                          ✓ Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Challenge Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600">
            <div>
              <strong>Time Attack:</strong> Focus on speed while maintaining accuracy. Use quick, decisive movements.
            </div>
            <div>
              <strong>Survival:</strong> Conserve energy and use defensive patterns strategically.
            </div>
            <div>
              <strong>Accuracy:</strong> Take your time to trace patterns perfectly. Precision over speed.
            </div>
            <div>
              <strong>Speed Trace:</strong> Practice patterns beforehand. Muscle memory is key.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChallengeMode;