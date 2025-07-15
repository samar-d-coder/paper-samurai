
import React, { useState, useEffect } from 'react';
import { Target, Clock, Zap, FileText } from 'lucide-react';
import PaperFoldingGame from './PaperFoldingGame';

interface Challenge {
  id: string;
  type: 'speed' | 'accuracy' | 'endurance' | 'origami';
  description: string;
  timeLimit: number;
  target: number;
  reward: number;
}

interface TrainingChallengesProps {
  onChallengeComplete: (reward: number) => void;
  onClose: () => void;
}

const TrainingChallenges = ({ onChallengeComplete, onClose }: TrainingChallengesProps) => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hits, setHits] = useState(0);
  const [showPaperFolding, setShowPaperFolding] = useState(false);

  const challenges: Challenge[] = [
    {
      id: 'speed_fold',
      type: 'speed',
      description: 'Transform 10 times in 30 seconds',
      timeLimit: 30,
      target: 10,
      reward: 500
    },
    {
      id: 'accuracy_strike',
      type: 'accuracy',
      description: 'Hit 15 targets without missing',
      timeLimit: 60,
      target: 15,
      reward: 750
    },
    {
      id: 'endurance_fight',
      type: 'endurance',
      description: 'Survive for 2 minutes',
      timeLimit: 120,
      target: 1,
      reward: 1000
    },
    {
      id: 'origami_master',
      type: 'origami',
      description: 'Create 5 origami folds to attack or defend',
      timeLimit: 60,
      target: 5,
      reward: 1200
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeChallenge && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (activeChallenge && timeLeft === 0) {
      setActiveChallenge(null);
      setProgress(0);
      setHits(0);
    }
    return () => clearTimeout(timer);
  }, [activeChallenge, timeLeft]);

  const startChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setTimeLeft(challenge.timeLimit);
    setProgress(0);
    setHits(0);
    
    if (challenge.type === 'origami') {
      setShowPaperFolding(true);
    }
  };

  const handleAction = () => {
    if (!activeChallenge) return;

    const newHits = hits + 1;
    setHits(newHits);
    setProgress((newHits / activeChallenge.target) * 100);

    if (newHits >= activeChallenge.target) {
      onChallengeComplete(activeChallenge.reward);
      setActiveChallenge(null);
      setProgress(0);
      setHits(0);
      setShowPaperFolding(false);
    }
  };
  const handlePaperFoldingComplete = (success: boolean, type: 'attack' | 'defense') => {
    if (!activeChallenge || activeChallenge.type !== 'origami') return;
    if (success) {
      const newHits = hits + 1;
      setHits(newHits);
      setProgress((newHits / activeChallenge.target) * 100);
      if (newHits >= activeChallenge.target) {
        onChallengeComplete(activeChallenge.reward);
        setActiveChallenge(null);
        setProgress(0);
        setHits(0);
        setShowPaperFolding(false);
      } else {
        setTimeout(() => {
          setShowPaperFolding(true);
        }, 1000);
      }
    } else {
      setShowPaperFolding(true);
    }
  };

  const getChallengeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'speed': return <Zap className="w-5 h-5" />;
      case 'accuracy': return <Target className="w-5 h-5" />;
      case 'endurance': return <Clock className="w-5 h-5" />;
      case 'origami': return <FileText className="w-5 h-5" />;
    }
  };

  const getChallengeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'speed': return 'bg-yellow-600';
      case 'accuracy': return 'bg-blue-600';
      case 'endurance': return 'bg-green-600';
      case 'origami': return 'bg-purple-600';
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      {showPaperFolding && activeChallenge?.type === 'origami' && (
        <PaperFoldingGame 
          onComplete={handlePaperFoldingComplete}
          onClose={() => setShowPaperFolding(false)}
        />
      )}
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-stone-800">Training Challenges</h2>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-800 text-2xl"
          >
            ×
          </button>
        </div>

        {!activeChallenge ? (
          <div className="space-y-3">
            {challenges.map(challenge => (
              <div
                key={challenge.id}
                className="border rounded-lg p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full text-white ${getChallengeColor(challenge.type)}`}>
                    {getChallengeIcon(challenge.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 capitalize">{challenge.type} Challenge</h3>
                    <p className="text-sm text-stone-600">{challenge.description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-500">{challenge.timeLimit}s time limit</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-yellow-600">+{challenge.reward} pts</span>
                    <button
                      onClick={() => startChallenge(challenge)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <div className={`p-4 rounded-full text-white ${getChallengeColor(activeChallenge.type)} inline-block mb-4`}>
              {getChallengeIcon(activeChallenge.type)}
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">
              {activeChallenge.type.charAt(0).toUpperCase() + activeChallenge.type.slice(1)} Challenge
            </h3>
            <p className="text-stone-600 mb-4">{activeChallenge.description}</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-stone-600 mb-1">
                <span>Progress: {hits}/{activeChallenge.target}</span>
                <span>Time: {timeLeft}s</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (activeChallenge.type === 'origami') {
                  setShowPaperFolding(true);
                } else {
                  handleAction();
                }
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              {activeChallenge.type === 'speed' && 'Transform!'}
              {activeChallenge.type === 'accuracy' && 'Strike!'}
              {activeChallenge.type === 'endurance' && 'Defend!'}
              {activeChallenge.type === 'origami' && 'Fold Paper!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingChallenges;
