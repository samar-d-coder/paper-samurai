import React, { useState } from 'react';
import { Mountain, TreePine, Waves, Building, Flame, Snowflake, Scroll, Crown, Sword, Shield, Zap } from 'lucide-react';
import PaperButton from './PaperButton';

interface Dojo {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  icon: React.ComponentType<any>;
  background: string;
  unlocked: boolean;
}
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
interface DojoSelectionProps {
  onDojoSelect: (dojoId: string) => void;
  onBack: () => void;
  playerLevel: number;
  onBossFight?: (bossId: string) => void;
  defeatedBosses?: string[];
}

const DojoSelection = ({ onDojoSelect, onBack, playerLevel, onBossFight = () => {}, defeatedBosses = [] }: DojoSelectionProps) => {
  const [activeTab, setActiveTab] = useState<'dojos' | 'bosses'>('dojos');
  
  const bosses: Boss[] = [
    {
      id: 'scrollmaster',
      name: 'Master Scroll',
      title: 'The Ancient Archivist',
      description: 'Guardian of forgotten folding techniques',
      health: 100,
      attacks: ['Paper Cut', 'Scroll Slam', 'Origami Storm'],
      weakness: 'Water techniques',
      rewards: ['Ancient scroll pattern', 'Rare paper'],
      difficulty: 3,
      unlocked: playerLevel >= 5,
      defeated: defeatedBosses.includes('scrollmaster'),
      icon: Scroll,
      background: 'from-amber-200 via-yellow-100 to-amber-50'
    },
    {
      id: 'paperking',
      name: 'The Paper King',
      title: 'Sovereign of the Sheets',
      description: 'Rules the kingdom of premium stationery',
      health: 150,
      attacks: ['Royal Decree', 'Thousand Folds', 'Paper Avalanche'],
      weakness: 'Fire techniques',
      rewards: ['Royal paper seal', 'Golden edges'],
      difficulty: 4,
      unlocked: playerLevel >= 10,
      defeated: defeatedBosses.includes('paperking'),
      icon: Crown,
      background: 'from-purple-200 via-pink-100 to-purple-50'
    },
    {
      id: 'bladefolder',
      name: 'The Blade Folder',
      title: 'Master of Sharp Edges',
      description: 'Creates deadly weapons from a single sheet',
      health: 200,
      attacks: ['Paper Blade', 'Cutting Wind', 'Thousand Slices'],
      weakness: 'Shield techniques',
      rewards: ['Razor edge technique', 'Steel-infused paper'],
      difficulty: 5,
      unlocked: playerLevel >= 15,
      defeated: defeatedBosses.includes('bladefolder'),
      icon: Sword,
      background: 'from-gray-200 via-slate-100 to-gray-50'
    },
    {
      id: 'defenderofsheets',
      name: 'The Paper Guardian',
      title: 'Defender of Sheets',
      description: 'An impenetrable fortress of folded defenses',
      health: 250,
      attacks: ['Paper Wall', 'Reinforced Fold', 'Crushing Envelope'],
      weakness: 'Lightning techniques',
      rewards: ['Defensive folding pattern', 'Reinforced paper'],
      difficulty: 6,
      unlocked: playerLevel >= 20,
      defeated: defeatedBosses.includes('defenderofsheets'),
      icon: Shield,
      background: 'from-blue-200 via-indigo-100 to-blue-50'
    },
    {
      id: 'stormfolder',
      name: 'The Storm Folder',
      title: 'Master of Paper Elements',
      description: 'Commands the very elements through paper mastery',
      health: 300,
      attacks: ['Lightning Fold', 'Thunder Clap', 'Paper Tempest'],
      weakness: 'Grounding techniques',
      rewards: ['Elemental paper', 'Weather control patterns'],
      difficulty: 7,
      unlocked: playerLevel >= 25,
      defeated: defeatedBosses.includes('stormfolder'),
      icon: Zap,
      background: 'from-yellow-200 via-amber-100 to-yellow-50'
    }
  ];
  const dojos: Dojo[] = [
    {
      id: 'mountain',
      name: 'Mountain Peak Dojo',
      description: 'Train among the clouds where paper birds soar highest',
      difficulty: 'Beginner',
      icon: Mountain,
      background: 'from-blue-200 via-white to-gray-100',
      unlocked: true
    },
    {
      id: 'forest',
      name: 'Bamboo Forest Dojo',
      description: 'Master the art of flexibility like the swaying bamboo',
      difficulty: 'Intermediate',
      icon: TreePine,
      background: 'from-green-200 via-emerald-100 to-green-50',
      unlocked: true 
    },
    {
      id: 'waterfall',
      name: 'Sacred Waterfall Dojo',
      description: 'Flow like water, strike like lightning',
      difficulty: 'Advanced',
      icon: Waves,
      background: 'from-cyan-200 via-blue-100 to-indigo-50',
      unlocked: true 
    },
    {
      id: 'temple',
      name: 'Ancient Temple Dojo',
      description: 'Where paper masters have trained for centuries',
      difficulty: 'Master',
      icon: Building,
      background: 'from-orange-200 via-amber-100 to-yellow-50',
      unlocked: true 
    },
    {
      id: 'volcano',
      name: 'Fire Mountain Dojo',
      description: 'Forge your spirit in the heat of battle',
      difficulty: 'Master',
      icon: Flame,
      background: 'from-red-200 via-orange-100 to-red-50',
      unlocked: true 
    },
    {
      id: 'glacier',
      name: 'Frozen Peak Dojo',
      description: 'Find peace in the eternal stillness of ice',
      difficulty: 'Master',
      icon: Snowflake,
      background: 'from-blue-100 via-cyan-50 to-white',
      unlocked: true 
    }
  ];
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-blue-600 bg-blue-100';
      case 'Advanced': return 'text-purple-600 bg-purple-100';
      case 'Master': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(Math.min(difficulty, 5)) + '☆'.repeat(Math.max(0, 5 - difficulty));
  };
  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-50 to-stone-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2">
              {activeTab === 'dojos' ? 'Choose Your Dojo' : 'Challenge a Boss'}
            </h1>
            <p className="text-stone-600">
              {activeTab === 'dojos' 
                ? 'Select a training ground to master the art of paper folding'
                : 'Test your skills against legendary paper masters'}
            </p>
          </div>
          <PaperButton onClick={onBack} variant="secondary">
            Return Home
          </PaperButton>
        </div>
        <div className="flex border-b border-stone-300 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'dojos' 
              ? 'text-amber-600 border-b-2 border-amber-500' 
              : 'text-stone-600 hover:text-amber-500'}`}
            onClick={() => setActiveTab('dojos')}
          >
            Training Dojos
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'bosses' 
              ? 'text-amber-600 border-b-2 border-amber-500' 
              : 'text-stone-600 hover:text-amber-500'}`}
            onClick={() => setActiveTab('bosses')}
          >
            Boss Challenges
          </button>
        </div>
        {activeTab === 'dojos' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dojos.map((dojo) => {
              const Icon = dojo.icon;
              return (
                <div
                  key={dojo.id}
                  className="relative overflow-hidden rounded-lg border-2 border-stone-300 hover:border-stone-400 hover:shadow-lg cursor-pointer bg-white transition-all duration-300"
                  onClick={() => onDojoSelect(dojo.id)}
                >
                  <div className={`h-32 bg-gradient-to-br ${dojo.background} flex items-center justify-center`}>
                    <Icon className="w-16 h-16 text-stone-600" />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-stone-800">
                        {dojo.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(dojo.difficulty)}`}>
                        {dojo.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-4 text-stone-600">
                      {dojo.description}
                    </p>

                    <div className="text-xs text-green-600 font-semibold">
                      ✓ Available
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bosses.map((boss) => {
              const Icon = boss.icon;
              return (
                <div
                  key={boss.id}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    boss.defeated 
                      ? 'border-green-400 bg-green-900 bg-opacity-20 hover:bg-opacity-30'
                      : !boss.unlocked
                        ? 'border-gray-300 bg-gray-100 opacity-70 cursor-not-allowed'
                        : 'border-amber-400 bg-stone-800 hover:bg-stone-700 hover:shadow-lg'
                  }`}
                  onClick={() => boss.unlocked && !boss.defeated && onBossFight(boss.id)}
                >
                  <div className={`h-32 bg-gradient-to-br ${boss.background} flex items-center justify-center relative`}>
                    <Icon className="w-16 h-16 text-stone-600 opacity-80" />
                    {boss.defeated && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {!boss.unlocked && (
                      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-gray-800 bg-opacity-75 px-3 py-1 rounded text-white text-sm">
                          Unlocks at Level {boss.difficulty * 5}
                        </div>
                      </div>
                    )}
                  </div> 
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold text-lg ${boss.defeated || !boss.unlocked ? 'text-stone-400' : 'text-amber-200'}`}>
                        {boss.name}
                      </h3>
                      <span className="text-xs text-amber-400">{getDifficultyStars(boss.difficulty)}</span>
                    </div>
                    
                    <p className={`text-sm ${boss.defeated || !boss.unlocked ? 'text-stone-500' : 'text-stone-300'} mb-2`}>
                      {boss.title}
                    </p>
                    
                    <p className={`text-xs ${boss.defeated || !boss.unlocked ? 'text-stone-600' : 'text-stone-400'} mb-3`}>
                      {boss.description}
                    </p>

                    <div className={`text-xs font-semibold ${boss.defeated ? 'text-green-400' : !boss.unlocked ? 'text-gray-400' : 'text-amber-400'}`}>
                      {boss.defeated ? '✓ Defeated' : !boss.unlocked ? 'Locked' : '⚔ Ready to Fight'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DojoSelection;
