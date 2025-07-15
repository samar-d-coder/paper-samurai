
import React from 'react';
import { X, Volume2, VolumeX, Music } from 'lucide-react';
import { soundManager } from '../utils/SoundManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [musicVolume, setMusicVolume] = React.useState(soundManager.getMusicVolume());
  const [sfxVolume, setSfxVolume] = React.useState(soundManager.getSfxVolume());
  const [soundEnabled, setSoundEnabled] = React.useState(soundManager.isEnabled());
  const [showPatternPreviews, setShowPatternPreviews] = React.useState(true);
  const [autoPauseOnBlur, setAutoPauseOnBlur] = React.useState(true);
  React.useEffect(() => {
    const savedPatternPreviews = localStorage.getItem('showPatternPreviews');
    const savedAutoPause = localStorage.getItem('autoPauseOnBlur');
    
    if (savedPatternPreviews !== null) {
      setShowPatternPreviews(savedPatternPreviews === 'true');
    }
    if (savedAutoPause !== null) {
      setAutoPauseOnBlur(savedAutoPause === 'true');
    }
  }, []);
  if (!isOpen) return null;
  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    soundManager.setMusicVolume(value);
  };
  const handleSfxVolumeChange = (value: number) => {
    setSfxVolume(value);
    soundManager.setSfxVolume(value);
    if (soundEnabled) {
      soundManager.playHit();
    }
  };
  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    soundManager.toggleSound();
    setSoundEnabled(newState);
    if (newState) {
      soundManager.playBackgroundMusic();
    } else {
      soundManager.stopBackgroundMusic();
    }
  };

  const handlePatternPreviewToggle = () => {
    setShowPatternPreviews(!showPatternPreviews);
    localStorage.setItem('showPatternPreviews', (!showPatternPreviews).toString());
  };

  const handleAutoPauseToggle = () => {
    setAutoPauseOnBlur(!autoPauseOnBlur);
    localStorage.setItem('autoPauseOnBlur', (!autoPauseOnBlur).toString());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Audio Settings
            </h3>
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Sound Effects</span>
              <button
                onClick={handleSoundToggle}
                className={`p-2 rounded-full transition-colors ${
                  soundEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Background Music
                </span>
                <span className="text-sm text-gray-500">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={!soundEnabled}
              />
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Sound Effects
                </span>
                <span className="text-sm text-gray-500">{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sfxVolume}
                onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                disabled={!soundEnabled}
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Game Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Show Pattern Previews</span>
                <input
                  type="checkbox"
                  checked={showPatternPreviews}
                  onChange={handlePatternPreviewToggle}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Auto-pause on Window Blur</span>
                <input
                  type="checkbox"
                  checked={autoPauseOnBlur}
                  onChange={handleAutoPauseToggle}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
