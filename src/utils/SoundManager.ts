
class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.5;
  private backgroundMusic: HTMLAudioElement | null = null;
  private backgroundMusicPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.initializeAudioContext();
    }
    this.loadSettings();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  private loadSettings() {
    const savedEnabled = localStorage.getItem('soundEnabled');
    const savedMusicVolume = localStorage.getItem('musicVolume');
    const savedSfxVolume = localStorage.getItem('sfxVolume');

    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }
    if (savedMusicVolume !== null) {
      this.musicVolume = parseFloat(savedMusicVolume);
    }
    if (savedSfxVolume !== null) {
      this.sfxVolume = parseFloat(savedSfxVolume);
    }
  }

  private saveSettings() {
    localStorage.setItem('soundEnabled', this.enabled.toString());
    localStorage.setItem('musicVolume', this.musicVolume.toString());
    localStorage.setItem('sfxVolume', this.sfxVolume.toString());
  }

  async playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = this.sfxVolume) {
    if (!this.audioContext || !this.enabled) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing tone:', error);
    }
  }

  playSuccess() {
    this.playTone(523.25, 0.2); 
    setTimeout(() => this.playTone(659.25, 0.2), 100);
  }

  playError() {
    this.playTone(220, 0.3, 'sawtooth'); 
  }

  playHit() {
    this.playTone(440, 0.1, 'square'); 
  }

  playPatternPoint() {
    this.playTone(659.25, 0.1); 
  }

  playCriticalHit() {
    this.playTone(880, 0.15, 'square', this.sfxVolume * 1.2); 
  }

  playBattleStart() {
    if (!this.audioContext || !this.enabled) return;
    this.playTone(110, 0.3, 'sine', this.sfxVolume * 1.3); 
    setTimeout(() => {
      this.playTone(220, 0.4, 'triangle', this.sfxVolume * 0.9);
      this.playTone(440, 0.2, 'square', this.sfxVolume * 0.7); 
    }, 300);
    setTimeout(() => {
      this.playTone(523.25, 0.6, 'sine', this.sfxVolume * 0.8); 
      this.playTone(659.25, 0.6, 'sine', this.sfxVolume * 0.6); 
      this.playTone(783.99, 0.6, 'sine', this.sfxVolume * 0.5); 
    }, 700);
  }

  playUltimate() {
    if (!this.audioContext || !this.enabled) return;
    this.playTone(440, 0.3, 'sawtooth', this.sfxVolume * 1.2);
    setTimeout(() => {
      this.playTone(880, 0.4, 'square', this.sfxVolume * 1.3);
    }, 200);
    setTimeout(() => {
      this.playTone(110, 0.8, 'sine', this.sfxVolume * 1.5);
      this.playTone(220, 0.6, 'sine', this.sfxVolume * 0.8);
      this.playTone(1760, 0.3, 'sine', this.sfxVolume * 0.4);
    }, 400);
  }

  playCombo(comboLevel: number) {
    const baseFreq = 440;
    const freq = baseFreq * Math.pow(1.2, Math.min(comboLevel, 10));
    this.playTone(freq, 0.12, 'sine', this.sfxVolume * 0.8);
  }
  playSound(soundId: string) {
    if (!this.enabled) return;
    switch(soundId) {
      case 'menu-select':
        this.playTone(523.25, 0.1, 'sine', this.sfxVolume * 0.7);
        break;
      case 'menu-open':
        this.playTone(659.25, 0.15, 'sine', this.sfxVolume * 0.6);
        break;
      case 'boss-encounter':
        this.playBattleStart();
        break;
      case 'player-hit':
        this.playHit();
        break;
      case 'victory':
        this.playSuccess();
        break;
      case 'game-over':
        this.playError();
        break;
      case 'level-up':
        this.playUltimate();
        break;
      default:
        this.playTone(440, 0.1, 'sine', this.sfxVolume * 0.5);
    }
  }

  playBackgroundMusic() {
    if (!this.enabled || this.backgroundMusicPlaying) return;
    
    this.backgroundMusicPlaying = true;
    const playAmbientSequence = () => {
      if (!this.enabled || !this.backgroundMusicPlaying) return;
      const notes = [523.25, 587.33, 659.25, 783.99, 880];
      let noteIndex = 0;
      const playNextNote = () => {
        if (!this.enabled || !this.backgroundMusicPlaying) return;
        this.playTone(notes[noteIndex % notes.length], 2, 'sine', this.musicVolume * 0.3);
        noteIndex++;
        setTimeout(playNextNote, 3000 + Math.random() * 2000);
      };
      
      setTimeout(playNextNote, 1000);
    };
    
    playAmbientSequence();
  }

  stopBackgroundMusic() {
    this.backgroundMusicPlaying = false;
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic = null;
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    this.saveSettings();
    
    if (!this.enabled) {
      this.stopBackgroundMusic();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  getSfxVolume() {
    return this.sfxVolume;
  }
}

export const soundManager = new SoundManager();
