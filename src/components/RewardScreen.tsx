import React, { useState, useEffect } from 'react';
import PaperButton from './PaperButton';
import { soundManager } from '../utils/SoundManager';
import '../styles/RewardScreen.css';

interface Reward {
  type: 'currency' | 'experience' | 'item' | 'pattern';
  amount?: number;
  name?: string;
  description?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  icon?: string;
}
interface RewardScreenProps {
  bossId: string;
  onClose: () => void;
  onClaimRewards: (rewards: Reward[]) => void;
}

const RewardScreen: React.FC<RewardScreenProps> = ({ bossId, onClose, onClaimRewards }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showRewards, setShowRewards] = useState(false);
  const [claimable, setClaimable] = useState(false);
  
  useEffect(() => {
    const generatedRewards: Reward[] = [];
    generatedRewards.push({
      type: 'currency',
      amount: bossId.includes('shadow') ? 1000 : bossId.includes('dragon') ? 750 : 500,
      name: 'Paper Coins',
      description: 'Used to purchase items and upgrades',
      icon: '💰'
    });
    generatedRewards.push({
      type: 'experience',
      amount: bossId.includes('shadow') ? 2000 : bossId.includes('dragon') ? 1500 : 1000,
      name: 'Experience',
      description: 'Increases your samurai level',
      icon: '✨'
    });
    const possibleItems = [
      {
        type: 'item' as const,
        name: 'Enchanted Ink',
        description: 'Increases pattern damage by 15%',
        rarity: 'uncommon' as const,
        icon: '🖋️'
      },
      {
        type: 'item' as const,
        name: 'Reinforced Paper',
        description: 'Increases defense by 10%',
        rarity: 'uncommon' as const,
        icon: '📜'
      },
      {
        type: 'item' as const,
        name: 'Master\'s Brush',
        description: 'Increases accuracy by 12%',
        rarity: 'rare' as const,
        icon: '🖌️'
      }
    ];
    if (bossId.includes('shadow')) {
      possibleItems.push({
        type: 'item',
        name: 'Shadow Essence',
        description: 'Unlocks shadow form transformation',
        rarity: 'legendary',
        icon: '🌑'
      });
    }
    if (bossId.includes('dragon')) {
      possibleItems.push({
        type: 'item',
        name: 'Dragon Scale Paper',
        description: 'Adds fire damage to attacks',
        rarity: 'rare',
        icon: '🔥'
      });
    }
    const numItems = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numItems; i++) {
      const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      if (!generatedRewards.some(r => r.type === 'item' && r.name === randomItem.name)) {
        generatedRewards.push(randomItem);
      }
    }
    if (Math.random() > 0.5) {
      const patterns = [
        {
          type: 'pattern' as const,
          name: 'Phoenix Fold',
          description: 'A powerful fire-based attack pattern',
          rarity: 'rare' as const,
          icon: '🦅'
        },
        {
          type: 'pattern' as const,
          name: 'Turtle Shield',
          description: 'A defensive pattern with earth properties',
          rarity: 'uncommon' as const,
          icon: '🐢'
        },
        {
          type: 'pattern' as const,
          name: 'Water Dragon',
          description: 'A flowing attack with water properties',
          rarity: 'rare' as const,
          icon: '🐉'
        }
      ];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      generatedRewards.push(randomPattern);
    }
    setRewards(generatedRewards);
    setTimeout(() => {
      setShowRewards(true);
      soundManager.playSuccess();
    }, 500);
    setTimeout(() => {
      setClaimable(true);
    }, 2000);
    return () => {
    };
  }, [bossId]);
  const handleClaimRewards = () => {
    soundManager.playSuccess();
    onClaimRewards(rewards);
    onClose();
  };
  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-200';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-white';
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="reward-screen bg-stone-800 border-4 border-amber-600 rounded-lg p-6 max-w-2xl w-full mx-4 transform transition-all duration-500 ease-out">
        <h2 className="text-3xl font-bold text-center text-amber-400 mb-6 reward-title">
          Victory! Boss Defeated
        </h2>
        
        <div className="mb-8 text-center text-white text-lg">
          <p>You have defeated the {bossId.includes('shadow') ? 'Shadow Master' : bossId.includes('dragon') ? 'Dragon Lord' : 'Mighty Boss'}!</p>
          <p className="text-amber-300 mt-2">Claim your rewards:</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {rewards.map((reward, index) => (
            <div 
              key={`${reward.type}-${index}`}
              className={`reward-item bg-stone-700 rounded-lg p-4 border-2 ${reward.rarity ? `border-${reward.rarity}` : 'border-gray-600'} transform transition-all duration-500 ${showRewards ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="flex items-center">
                <div className={`text-4xl mr-4 ${getRarityColor(reward.rarity)}`}>{reward.icon || '🎁'}</div>
                <div>
                  <h3 className={`font-bold text-lg ${getRarityColor(reward.rarity)}`}>
                    {reward.name} {reward.amount ? `x${reward.amount}` : ''}
                  </h3>
                  <p className="text-gray-300 text-sm">{reward.description}</p>
                  {reward.rarity && (
                    <span className={`text-xs uppercase font-bold ${getRarityColor(reward.rarity)}`}>
                      {reward.rarity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <PaperButton 
            onClick={handleClaimRewards} 
            variant="primary"
            disabled={!claimable}
            className={`claim-button ${claimable ? 'animate-pulse' : 'opacity-50'}`}
          >
            {claimable ? 'Claim Rewards' : 'Preparing Rewards...'}
          </PaperButton>
        </div>
      </div>
    </div>
  );
};

export default RewardScreen;