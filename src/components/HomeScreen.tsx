import React, { useState } from 'react';
import { Sword, BookOpen, Trophy, Settings, HelpCircle, Target, Package, BarChart3 } from 'lucide-react';
import OrigamiSamurai from './OrigamiSamurai';
import PaperButton from './PaperButton';
import FloatingOrigami from './FloatingOrigami';
import HowToPlay from './HowToPlay';
import SettingsModal from './SettingsModal';
interface HomeScreenProps {
  onStateChange: (state: 'home' | 'dojo-selection' | 'boss-fight' | 'challenges' | 'equipment' | 'progression' | 'how-to-play') => void;
  playerLevel?: number;
}
const HomeScreen = ({ onStateChange, playerLevel = 1 }: HomeScreenProps) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const handleTransform = () => {
    console.log('Samurai transformed!');
  };
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-b from-sky-300 via-orange-200 to-amber-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cpath d='M0 800 L200 400 L400 500 L600 300 L800 450 L1000 350 L1200 600 L1200 800 Z' fill='%23654321' opacity='0.3'/%3E%3Cpath d='M0 800 L150 500 L350 550 L550 400 L750 500 L950 420 L1200 650 L1200 800 Z' fill='%238b4513' opacity='0.2'/%3E%3C/svg%3E")`
        }}
      />
      <FloatingOrigami />
      <div className="absolute top-20 left-10 w-32 h-16 bg-white rounded-full opacity-70" 
           style={{ clipPath: 'ellipse(80px 40px at 50% 50%)' }} />
      <div className="absolute top-32 right-20 w-24 h-12 bg-white rounded-full opacity-60" 
           style={{ clipPath: 'ellipse(60px 30px at 50% 50%)' }} />
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all duration-200"
      >
        <Settings className="w-6 h-6 text-stone-700" />
      </button>
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-shrink-0 text-center pt-12 pb-8">
          <h1 className="text-6xl font-bold text-stone-800 mb-4 drop-shadow-lg">
            紙の侍
          </h1>
          <h2 className="text-2xl text-stone-700 mb-2">Paper Samurai</h2>
          <p className="text-stone-600 italic">Master the ancient art of origami combat</p>
          {playerLevel > 1 && (
            <div className="mt-4 inline-block bg-amber-200 bg-opacity-70 px-4 py-2 rounded-full">
              <span className="text-stone-800 font-semibold">Level {playerLevel} Master</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <OrigamiSamurai 
              form="humanoid" 
              windIntensity={0.3} 
              onTransform={handleTransform}
            />
            <div className="absolute -top-8 -left-8 text-4xl animate-bounce">🌸</div>
            <div className="absolute -top-4 -right-8 text-3xl animate-pulse">🍃</div>
            <div className="absolute -bottom-4 -left-6 text-2xl animate-bounce delay-1000">🌿</div>
          </div>
        </div>
        <div className="flex-shrink-0 pb-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
              <PaperButton
                onClick={() => onStateChange('dojo-selection')}
                variant="primary"
              >
                <Sword className="w-5 h-5" />
                Select Dojo
              </PaperButton>
              <PaperButton
                onClick={() => onStateChange('challenges')}
                variant="primary"
              >
                <Target className="w-5 h-5" />
                Challenges
              </PaperButton>
              <PaperButton
                onClick={() => onStateChange('dojo-selection')}
                variant="secondary"
              >
                <Sword className="w-5 h-5" />
                Boss Battles
              </PaperButton>
              <PaperButton
                onClick={() => onStateChange('equipment')}
                variant="secondary"
              >
                <Package className="w-5 h-5" />
                Equipment
              </PaperButton>
              <PaperButton
                onClick={() => onStateChange('progression')}
                variant="secondary"
              >
                <BarChart3 className="w-5 h-5" />
                Progress
              </PaperButton>
              <PaperButton
                onClick={() => onStateChange('how-to-play')}
                variant="secondary"
              >
                <HelpCircle className="w-5 h-5" />
                How to Play
              </PaperButton>
            </div>
            <div className="text-center">
              <p className="text-sm text-stone-600 mb-2">Choose your path, young warrior</p>
              <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
                <span>🏮 Traditional Training</span>
                <span>📜 Legendary Battles</span>
                <span>🎋 Master's Wisdom</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showHowToPlay && (
        <HowToPlay onClose={() => setShowHowToPlay(false)} />
      )}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <div className="absolute bottom-8 left-8 text-stone-700 text-lg italic opacity-80 max-w-sm">
        "The paper that bends does not break,<br />
        The fold that yields finds strength."
      </div>
      <div className="absolute bottom-4 right-4 text-stone-500 text-xs opacity-60 hover:opacity-100 transition-opacity">
        made with ❤️ by samar
      </div>
    </div>
  );
};

export default HomeScreen;
