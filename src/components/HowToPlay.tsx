
import React from 'react';
import { X, Sword, Shield, Zap, Target, MousePointer, Clock } from 'lucide-react';
import PaperButton from './PaperButton';

interface HowToPlayProps {
  onClose: () => void;
}
const HowToPlay = ({ onClose }: HowToPlayProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-amber-50 to-stone-100 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-amber-200">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold mb-2">🗾 How to Play Paper Samurai</h2>
          <p className="text-amber-100">Master the ancient art of origami combat</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white bg-opacity-60 rounded-lg p-4 border-2 border-stone-200">
            <h3 className="text-xl font-bold text-stone-800 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-red-600" />
              Game Objective
            </h3>
            <p className="text-stone-700">
              Defend yourself against waves of origami enemies by tracing magical patterns. Each successful pattern unleashes powerful attacks to defeat your paper foes.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4 border-2 border-stone-200">
            <h3 className="text-xl font-bold text-stone-800 mb-3 flex items-center">
              <MousePointer className="w-5 h-5 mr-2 text-blue-600" />
              Combat System
            </h3>
            <div className="space-y-3 text-stone-700">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2 font-bold">1.</span>
                <span><strong>Click on enemies</strong> to target them and reveal an origami pattern</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-600 mr-2 font-bold">2.</span>
                <span><strong>Trace the pattern</strong> by following the connecting lines with your mouse</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-600 mr-2 font-bold">3.</span>
                <span><strong>Complete before time runs out</strong> to unleash your attack</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-600 mr-2 font-bold">4.</span>
                <span><strong>Higher accuracy</strong> = more damage and combo multipliers</span>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4 border-2 border-stone-200">
            <h3 className="text-xl font-bold text-stone-800 mb-3">🎨 Origami Attack Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-xs">鶴</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Paper Crane</p>
                  <p className="text-sm text-stone-600">35 damage • Swift strike</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-xs">龍</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Mighty Dragon</p>
                  <p className="text-sm text-stone-600">80 damage • Heavy attack</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-xs">蝶</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Dancing Butterfly</p>
                  <p className="text-sm text-stone-600">25 damage x3 hits • Combo</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-xs">武</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Samurai Strike</p>
                  <p className="text-sm text-stone-600">120 damage • Critical hit</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-xs">蓮</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Healing Lotus</p>
                  <p className="text-sm text-stone-600">Restores health • Defense boost</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4 border-2 border-stone-200">
            <h3 className="text-xl font-bold text-stone-800 mb-3">🥷 Enemy Types</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-500 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">紙</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Paper Soldier</p>
                  <p className="text-sm text-stone-600">150 HP • 15 damage • 100 points</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">武</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Origami Warrior</p>
                  <p className="text-sm text-stone-600">300 HP • 25 damage • 250 points</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-600 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">龍</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Paper Dragon</p>
                  <p className="text-sm text-stone-600">600 HP • 40 damage • 500 points</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-800 rounded-lg mr-3 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">影</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Shadow Boss</p>
                  <p className="text-sm text-stone-600">1200 HP • 60 damage • 1000 points</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-4 border-2 border-amber-300">
            <h3 className="text-xl font-bold text-amber-800 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Master's Combat Tips
            </h3>
            <ul className="space-y-1 text-amber-700 text-sm">
              <li>• <strong>Accuracy matters:</strong> Trace patterns precisely for maximum damage</li>
              <li>• <strong>Speed is key:</strong> Complete patterns quickly before time runs out</li>
              <li>• <strong>Build combos:</strong> Chain successful attacks for damage multipliers</li>
              <li>• <strong>Target wisely:</strong> Focus on weaker enemies first to build momentum</li>
              <li>• <strong>Use healing:</strong> The Lotus pattern restores health when you're low</li>
              <li>• <strong>Practice makes perfect:</strong> Each pattern has unique tracing requirements</li>
            </ul>
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-4 border-2 border-stone-200">
            <h3 className="text-xl font-bold text-stone-800 mb-3">🏯 Game Modes</h3>
            <ul className="space-y-2 text-stone-700">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span><strong>Dojo Training:</strong> Practice in different environments with waves of enemies</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span><strong>Boss Battles:</strong> Face legendary opponents in epic combat challenges</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span><strong>Level Progression:</strong> Unlock new dojos every 2,000 points</span>
              </li>
            </ul>
          </div>
          <div className="text-center pt-4">
            <PaperButton onClick={onClose} variant="primary">
              Begin Your Origami Journey
            </PaperButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;
