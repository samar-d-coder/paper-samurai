import React, { useState, useEffect } from 'react';
import { Palette, Scroll, Brush, Star, ArrowLeft } from 'lucide-react';
import PaperButton from './PaperButton';

interface Equipment {
  id: string;
  name: string;
  type: 'paper' | 'ink' | 'tool';
  description: string;
  effects: {
    damageBonus?: number;
    accuracyBonus?: number;
    speedBonus?: number;
    defenseBonus?: number;
    specialEffect?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockLevel: number;
  price: number;
  icon: React.ComponentType<any>;
  color: string;
}
interface EquippedItems {
  paper: Equipment | null;
  ink: Equipment | null;
  tool: Equipment | null;
}
interface EquipmentSystemProps {
  onBack: () => void;
  playerLevel: number;
  playerCurrency: number;
  onEquipmentChange: (equipment: EquippedItems) => void;
  onPurchase: (cost: number) => void;
}
const EquipmentSystem = ({ 
  onBack, 
  playerLevel, 
  playerCurrency, 
  onEquipmentChange, 
  onPurchase 
}: EquipmentSystemProps) => {
  const [equipped, setEquipped] = useState<EquippedItems>({
    paper: null,
    ink: null,
    tool: null
  });
  const [ownedItems, setOwnedItems] = useState<string[]>(['basic-paper', 'black-ink', 'bamboo-brush']);
  const [selectedCategory, setSelectedCategory] = useState<'paper' | 'ink' | 'tool'>('paper');

  const equipment: Equipment[] = [
    {
      id: 'basic-paper',
      name: 'Basic Washi',
      type: 'paper',
      description: 'Traditional paper for beginners',
      effects: {},
      rarity: 'common',
      unlockLevel: 1,
      price: 0,
      icon: Scroll,
      color: 'text-stone-600'
    },
    {
      id: 'silk-paper',
      name: 'Silk Paper',
      type: 'paper',
      description: 'Smooth surface increases accuracy',
      effects: { accuracyBonus: 0.1 },
      rarity: 'rare',
      unlockLevel: 3,
      price: 200,
      icon: Scroll,
      color: 'text-blue-600'
    },
    {
      id: 'reinforced-paper',
      name: 'Reinforced Paper',
      type: 'paper',
      description: 'Extra durability provides defense bonus',
      effects: { defenseBonus: 0.15 },
      rarity: 'rare',
      unlockLevel: 5,
      price: 300,
      icon: Scroll,
      color: 'text-green-600'
    },
    {
      id: 'dragon-paper',
      name: 'Dragon Scale Paper',
      type: 'paper',
      description: 'Legendary paper that enhances all abilities',
      effects: { damageBonus: 0.2, accuracyBonus: 0.15, specialEffect: 'dragon-power' },
      rarity: 'legendary',
      unlockLevel: 15,
      price: 1000,
      icon: Scroll,
      color: 'text-red-600'
    },
    {
      id: 'black-ink',
      name: 'Traditional Black Ink',
      type: 'ink',
      description: 'Classic ink for all purposes',
      effects: {},
      rarity: 'common',
      unlockLevel: 1,
      price: 0,
      icon: Palette,
      color: 'text-stone-800'
    },
    {
      id: 'crimson-ink',
      name: 'Crimson Ink',
      type: 'ink',
      description: 'Increases damage of offensive patterns',
      effects: { damageBonus: 0.15 },
      rarity: 'rare',
      unlockLevel: 4,
      price: 250,
      icon: Palette,
      color: 'text-red-500'
    },
    {
      id: 'azure-ink',
      name: 'Azure Ink',
      type: 'ink',
      description: 'Improves pattern tracing speed',
      effects: { speedBonus: 0.2 },
      rarity: 'rare',
      unlockLevel: 6,
      price: 280,
      icon: Palette,
      color: 'text-blue-500'
    },
    {
      id: 'golden-ink',
      name: 'Golden Ink',
      type: 'ink',
      description: 'Mystical ink that grants special powers',
      effects: { damageBonus: 0.1, accuracyBonus: 0.1, specialEffect: 'midas-touch' },
      rarity: 'epic',
      unlockLevel: 12,
      price: 800,
      icon: Palette,
      color: 'text-yellow-500'
    },
    {
      id: 'bamboo-brush',
      name: 'Bamboo Brush',
      type: 'tool',
      description: 'Simple brush for basic techniques',
      effects: {},
      rarity: 'common',
      unlockLevel: 1,
      price: 0,
      icon: Brush,
      color: 'text-green-700'
    },
    {
      id: 'jade-stylus',
      name: 'Jade Stylus',
      type: 'tool',
      description: 'Precise tool for accurate pattern work',
      effects: { accuracyBonus: 0.12 },
      rarity: 'rare',
      unlockLevel: 7,
      price: 350,
      icon: Brush,
      color: 'text-green-500'
    },
    {
      id: 'phoenix-quill',
      name: 'Phoenix Quill',
      type: 'tool',
      description: 'Legendary quill that never breaks',
      effects: { speedBonus: 0.25, accuracyBonus: 0.1, specialEffect: 'phoenix-blessing' },
      rarity: 'legendary',
      unlockLevel: 20,
      price: 1500,
      icon: Brush,
      color: 'text-orange-500'
    }
  ];
  const purchaseItem = (item: Equipment) => {
    if (playerCurrency >= item.price && !ownedItems.includes(item.id)) {
      onPurchase(item.price);
      setOwnedItems(prev => [...prev, item.id]);
    }
  };
  const equipItem = (item: Equipment) => {
    if (!ownedItems.includes(item.id)) return;
    
    const newEquipped = {
      ...equipped,
      [item.type]: item
    };
    
    setEquipped(newEquipped);
    onEquipmentChange(newEquipped);
  };
  const unequipItem = (type: 'paper' | 'ink' | 'tool') => {
    const newEquipped = {
      ...equipped,
      [type]: null
    };
    setEquipped(newEquipped);
    onEquipmentChange(newEquipped);
  };
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };
  const getEffectDescription = (effects: Equipment['effects']) => {
    const descriptions = [];
    if (effects.damageBonus) descriptions.push(`+${(effects.damageBonus * 100).toFixed(0)}% Damage`);
    if (effects.accuracyBonus) descriptions.push(`+${(effects.accuracyBonus * 100).toFixed(0)}% Accuracy`);
    if (effects.speedBonus) descriptions.push(`+${(effects.speedBonus * 100).toFixed(0)}% Speed`);
    if (effects.defenseBonus) descriptions.push(`+${(effects.defenseBonus * 100).toFixed(0)}% Defense`);
    if (effects.specialEffect) descriptions.push('Special Effect');
    return descriptions.join(', ') || 'No bonuses';
  };
  const filteredEquipment = equipment.filter(item => item.type === selectedCategory);
  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-50 to-stone-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 mb-2 flex items-center gap-3">
              <Scroll className="w-10 h-10 text-amber-600" />
              Equipment Workshop
            </h1>
            <p className="text-stone-600">Enhance your abilities with traditional tools and materials</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-80 rounded-lg px-4 py-2">
              <span className="text-stone-700 font-semibold">
                💰 {playerCurrency} Gold
              </span>
            </div>
            <PaperButton onClick={onBack} variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Return
            </PaperButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Currently Equipped</h2>
            <div className="space-y-4">
              {(['paper', 'ink', 'tool'] as const).map(type => {
                const item = equipped[type];
                const Icon = item?.icon || (type === 'paper' ? Scroll : type === 'ink' ? Palette : Brush);
                return (
                  <div key={type} className="bg-white rounded-lg p-4 border-2 border-stone-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-stone-700 capitalize">{type}</span>
                      {item && (
                        <button
                          onClick={() => unequipItem(type)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Unequip
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-8 h-8 ${item?.color || 'text-stone-400'}`} />
                      <div>
                        <h3 className="font-medium text-stone-800">
                          {item?.name || `No ${type} equipped`}
                        </h3>
                        {item && (
                          <p className="text-xs text-stone-600">
                            {getEffectDescription(item.effects)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-stone-800">Available Equipment</h2>
              <div className="flex gap-2">
                {(['paper', 'ink', 'tool'] as const).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-amber-200 text-stone-800'
                        : 'bg-white text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEquipment.map(item => {
                const Icon = item.icon;
                const isOwned = ownedItems.includes(item.id);
                const isEquipped = equipped[item.type]?.id === item.id;
                const canAfford = playerCurrency >= item.price;
                const canUnlock = playerLevel >= item.unlockLevel;
                const isLocked = !canUnlock;
                
                return (
                  <div
                    key={item.id}
                    className={`
                      rounded-lg border-2 p-4 transition-all duration-300
                      ${getRarityColor(item.rarity)}
                      ${isLocked ? 'opacity-50' : ''}
                      ${isEquipped ? 'ring-2 ring-amber-400' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-8 h-8 ${item.color}`} />
                        <div>
                          <h3 className="font-bold text-stone-800">{item.name}</h3>
                          <span className={`
                            text-xs font-semibold px-2 py-1 rounded-full
                            ${item.rarity === 'common' ? 'bg-gray-200 text-gray-700' : ''}
                            ${item.rarity === 'rare' ? 'bg-blue-200 text-blue-700' : ''}
                            ${item.rarity === 'epic' ? 'bg-purple-200 text-purple-700' : ''}
                            ${item.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-700' : ''}
                          `}>
                            {item.rarity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < (item.rarity === 'legendary' ? 5 : item.rarity === 'epic' ? 4 : item.rarity === 'rare' ? 3 : 2)
                                ? 'text-amber-400 fill-current' 
                                : 'text-stone-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-stone-600 mb-3">{item.description}</p>
                    
                    <div className="text-xs text-stone-700 mb-3">
                      <strong>Effects:</strong> {getEffectDescription(item.effects)}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        {isLocked ? (
                          <span className="text-red-600 font-semibold">
                            Requires Level {item.unlockLevel}
                          </span>
                        ) : item.price > 0 ? (
                          <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                            💰 {item.price} Gold
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">Free</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!isOwned && !isLocked && (
                          <button
                            onClick={() => purchaseItem(item)}
                            disabled={!canAfford && item.price > 0}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              canAfford || item.price === 0
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                            }`}
                          >
                            {item.price === 0 ? 'Take' : 'Buy'}
                          </button>
                        )}
                        
                        {isOwned && !isEquipped && (
                          <button
                            onClick={() => equipItem(item)}
                            className="px-3 py-1 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                          >
                            Equip
                          </button>
                        )}
                        
                        {isEquipped && (
                          <span className="px-3 py-1 rounded text-sm font-medium bg-amber-200 text-amber-800">
                            Equipped
                          </span>
                        )}
                      </div>
                    </div>
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

export default EquipmentSystem;