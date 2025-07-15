import React, { useState, useEffect, useRef } from 'react';
import { Sword, Shield } from 'lucide-react';

interface PaperFoldingGameProps {
  onComplete: (success: boolean, type: 'attack' | 'defense', patternName?: string) => void;
  onClose: () => void;
}

const PaperFoldingGame: React.FC<PaperFoldingGameProps> = ({ onComplete, onClose }) => {
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes fold-paper {
        0% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(0.9) rotate(5deg); }
        100% { transform: scale(0.95) rotate(3deg); }
      }
      .folding {
        animation: fold-paper 0.8s ease-in-out;
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .shake {
        animation: shake 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      if (styleEl.parentNode) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);
  const [foldStage, setFoldStage] = useState(0);
  const [foldType, setFoldType] = useState<'attack' | 'defense'>('attack');
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [clickPoints, setClickPoints] = useState<{x: number, y: number}[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  interface FoldPattern {
    name: string;
    points: { x: number, y: number }[];
    difficulty: number;
    value: number; 
    description: string;
    element?: 'fire' | 'water' | 'wind' | 'earth' | null;
  }
  const attackPatterns: FoldPattern[] = [
    {
      name: "Crane Strike",
      points: [
        { x: 0.2, y: 0.2 },
        { x: 0.8, y: 0.2 },
        { x: 0.5, y: 0.5 },
        { x: 0.2, y: 0.8 },
        { x: 0.8, y: 0.8 },
      ],
      difficulty: 1,
      value: 25,
      description: "A basic strike with moderate damage",
      element: null
    },
    {
      name: "Butterfly Slash",
      points: [
        { x: 0.5, y: 0.2 },
        { x: 0.2, y: 0.5 },
        { x: 0.5, y: 0.8 },
        { x: 0.8, y: 0.5 },
        { x: 0.5, y: 0.5 },
      ],
      difficulty: 2,
      value: 40,
      description: "A graceful attack with good damage",
      element: 'wind'
    },
    {
      name: "Dragon Fang",
      points: [
        { x: 0.2, y: 0.2 },
        { x: 0.5, y: 0.1 },
        { x: 0.8, y: 0.2 },
        { x: 0.5, y: 0.5 },
        { x: 0.2, y: 0.8 },
        { x: 0.8, y: 0.8 },
      ],
      difficulty: 3,
      value: 60,
      description: "A powerful bite with high damage",
      element: 'fire'
    },
    {
      name: "Phoenix Wing",
      points: [
        { x: 0.1, y: 0.5 },
        { x: 0.3, y: 0.2 },
        { x: 0.5, y: 0.1 },
        { x: 0.7, y: 0.2 },
        { x: 0.9, y: 0.5 },
        { x: 0.5, y: 0.9 },
      ],
      difficulty: 4,
      value: 80,
      description: "A sweeping attack with very high damage",
      element: 'water'
    },
    {
      name: "Samurai's Honor",
      points: [
        { x: 0.5, y: 0.1 },
        { x: 0.1, y: 0.3 },
        { x: 0.3, y: 0.5 },
        { x: 0.1, y: 0.7 },
        { x: 0.5, y: 0.9 },
        { x: 0.9, y: 0.7 },
        { x: 0.7, y: 0.5 },
        { x: 0.9, y: 0.3 },
      ],
      difficulty: 5,
      value: 100,
      description: "The ultimate attack with devastating damage",
      element: 'earth'
    },
  ];
  const defensePatterns: FoldPattern[] = [
    {
      name: "Paper Shield",
      points: [
        { x: 0.5, y: 0.2 },
        { x: 0.2, y: 0.5 },
        { x: 0.5, y: 0.8 },
        { x: 0.8, y: 0.5 },
        { x: 0.5, y: 0.5 },
      ],
      difficulty: 1,
      value: 15,
      description: "A basic defense with light healing",
      element: null
    },
    {
      name: "Lotus Barrier",
      points: [
        { x: 0.5, y: 0.2 },
        { x: 0.3, y: 0.3 },
        { x: 0.2, y: 0.5 },
        { x: 0.3, y: 0.7 },
        { x: 0.5, y: 0.8 },
        { x: 0.7, y: 0.7 },
        { x: 0.8, y: 0.5 },
        { x: 0.7, y: 0.3 },
      ],
      difficulty: 2,
      value: 25,
      description: "A flowing defense with moderate healing",
      element: 'water'
    },
    {
      name: "Turtle Shell",
      points: [
        { x: 0.5, y: 0.2 },
        { x: 0.2, y: 0.3 },
        { x: 0.1, y: 0.5 },
        { x: 0.2, y: 0.7 },
        { x: 0.5, y: 0.8 },
        { x: 0.8, y: 0.7 },
        { x: 0.9, y: 0.5 },
        { x: 0.8, y: 0.3 },
      ],
      difficulty: 3,
      value: 40,
      description: "A sturdy defense with good healing",
      element: 'earth'
    },
    {
      name: "Mountain Fortress",
      points: [
        { x: 0.1, y: 0.8 },
        { x: 0.3, y: 0.6 },
        { x: 0.5, y: 0.2 },
        { x: 0.7, y: 0.6 },
        { x: 0.9, y: 0.8 },
        { x: 0.5, y: 0.5 },
      ],
      difficulty: 4,
      value: 60,
      description: "A powerful defense with very good healing",
      element: 'earth'
    },
    {
      name: "Divine Protection",
      points: [
        { x: 0.5, y: 0.1 },
        { x: 0.2, y: 0.2 },
        { x: 0.1, y: 0.5 },
        { x: 0.2, y: 0.8 },
        { x: 0.5, y: 0.9 },
        { x: 0.8, y: 0.8 },
        { x: 0.9, y: 0.5 },
        { x: 0.8, y: 0.2 },
        { x: 0.5, y: 0.5 },
      ],
      difficulty: 5,
      value: 80,
      description: "The ultimate defense with exceptional healing",
      element: 'wind'
    },
  ];
  const [selectedPatternIndex, setSelectedPatternIndex] = useState(0);
  const getCurrentPattern = () => {
    const patterns = foldType === 'attack' ? attackPatterns : defensePatterns;
    return patterns[selectedPatternIndex].points;
  };
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(false, foldType);
    }
  }, [timeLeft, foldType, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pattern = getCurrentPattern();
    const patterns = foldType === 'attack' ? attackPatterns : defensePatterns;
    const currentPatternObj = patterns[selectedPatternIndex];
    const basePointSize = Math.max(canvas.width * 0.025, 8);
    const targetPointSize = basePointSize * 1.5;
    const completedPointSize = basePointSize * 1.25;
    const upcomingPointSize = basePointSize;
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = foldType === 'attack' ? '#dc2626' : '#2563eb';
    ctx.textAlign = 'left';
    ctx.fillText(`Difficulty: ${"★".repeat(currentPatternObj.difficulty)}${"☆".repeat(5-currentPatternObj.difficulty)}`, 10, 20);
    ctx.fillText(`Value: ${currentPatternObj.value}`, 10, 40);
    ctx.beginPath();
    pattern.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x * canvas.width, point.y * canvas.height);
      } else {
        ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
      }
    });
    ctx.strokeStyle = foldType === 'attack' ? '#dc2626' : '#2563eb';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    pattern.forEach((point, index) => {
      if (index < foldStage) {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, completedPointSize, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981'; 
        ctx.fill();
        ctx.strokeStyle = '#047857'; 
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`${index + 1}`, point.x * canvas.width, point.y * canvas.height + 4);
      } else if (index === foldStage) {
        const pulse = Math.sin(Date.now() * 0.01) * 5;
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, targetPointSize * 2 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = foldType === 'attack' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(37, 99, 235, 0.2)'; 
        ctx.fill();
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, targetPointSize, 0, Math.PI * 2);
        ctx.fillStyle = foldType === 'attack' ? '#ef4444' : '#2563eb'; 
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`${index + 1}`, point.x * canvas.width, point.y * canvas.height + 4);
        const arrowSize = targetPointSize * 3;
        const arrowOffset = targetPointSize * 4;
        const arrowX = point.x * canvas.width;
        const arrowY = point.y * canvas.height - arrowOffset;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowSize/2, arrowY - arrowSize/2);
        ctx.lineTo(arrowX + arrowSize/2, arrowY - arrowSize/2);
        ctx.closePath();
        ctx.fillStyle = foldType === 'attack' ? '#ef4444' : '#2563eb';
        ctx.fill();
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = foldType === 'attack' ? '#ef4444' : '#2563eb';
        ctx.textAlign = 'center';
        ctx.fillText('Click Here', arrowX, arrowY - arrowSize);
      } else {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, upcomingPointSize, 0, Math.PI * 2);
        ctx.fillStyle = '#d1d5db'; 
        ctx.fill();
        ctx.font = '10px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        ctx.fillText(`${index + 1}`, point.x * canvas.width, point.y * canvas.height + 3);
      }
    });
    clickPoints.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.fill();
    });
    const animationFrame = requestAnimationFrame(() => {});
    
    return () => cancelAnimationFrame(animationFrame);
  }, [foldStage, foldType, clickPoints, selectedPatternIndex]);
  const handlePaperClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAnimating) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClickPoints(prev => {
      const limitedPrev = prev.slice(-10);
      return [...limitedPrev, {x, y}];
    });
    const pattern = getCurrentPattern();
    if (!pattern || foldStage >= pattern.length) return;
    const currentPoint = pattern[foldStage];
    if (!currentPoint) return; 
    const patterns = foldType === 'attack' ? attackPatterns : defensePatterns;
    if (selectedPatternIndex < 0 || selectedPatternIndex >= patterns.length) return;
    const currentPatternObj = patterns[selectedPatternIndex];
    const targetX = currentPoint.x * canvas.width;
    const targetY = currentPoint.y * canvas.height;
    const distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));
    const difficultyFactor = Math.max(0.7, 1 - (currentPatternObj.difficulty * 0.05));
    const tolerance = Math.max(canvas.width * 0.15 * difficultyFactor, 40);
    
    if (distance < tolerance) { 
      setIsAnimating(true);
      if (paperRef.current) {
        try {
          const successIndicator = document.createElement('div');
          successIndicator.className = 'absolute z-10 text-green-500 font-bold text-lg animate-bounce';
          successIndicator.textContent = '✓';
          successIndicator.style.left = `${x}px`;
          successIndicator.style.top = `${y}px`;
          successIndicator.style.transform = 'translate(-50%, -50%)';
          paperRef.current.appendChild(successIndicator);
          paperRef.current.classList.add('folding');
          try {
            const audio = new Audio();
            audio.src = '/fold-sound.mp3';
            audio.volume = 0.3;
            audio.play().catch(() => {}); 
          } catch (error) {
            console.error('Error playing sound:', error);
          }
          let isMounted = true;
          setTimeout(() => {
            if (!isMounted || !paperRef.current) return;
            paperRef.current.classList.remove('folding');
            if (successIndicator.parentNode === paperRef.current) {
              paperRef.current.removeChild(successIndicator);
            }
            setIsAnimating(false);
            setFoldStage(prev => {
              const nextStage = prev + 1;
              if (nextStage >= pattern.length) {
                setTimeout(() => {
                  if (isMounted) {
                    onComplete(true, foldType, currentPatternObj.name);
                  }
                }, 500);
                return prev;
              }
              return nextStage;
            });
          }, 800);
          return () => {
            isMounted = false;
          };
        } catch (error) {
          console.error('Error in successful fold handling:', error);
          setIsAnimating(false);
        }
      }
    } else {
      if (paperRef.current) {
        try {
          const errorIndicator = document.createElement('div');
          errorIndicator.className = 'absolute z-10 text-red-500 font-bold text-lg';
          errorIndicator.textContent = '✗';
          errorIndicator.style.left = `${x}px`;
          errorIndicator.style.top = `${y}px`;
          errorIndicator.style.transform = 'translate(-50%, -50%)';
          paperRef.current.appendChild(errorIndicator);
          const hintArrow = document.createElement('div');
          hintArrow.className = `absolute z-10 text-${foldType === 'attack' ? 'red' : 'blue'}-500 font-bold text-lg animate-pulse`;
          hintArrow.textContent = '→';
          const angle = Math.atan2(targetY - y, targetX - x) * (180 / Math.PI);
          hintArrow.style.left = `${x}px`;
          hintArrow.style.top = `${y}px`;
          hintArrow.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
          paperRef.current.appendChild(hintArrow);
          paperRef.current.classList.add('shake');
          setTimeout(() => {
            if (paperRef.current) {
              paperRef.current.classList.remove('shake');
              if (errorIndicator.parentNode === paperRef.current) {
                paperRef.current.removeChild(errorIndicator);
              }
              if (hintArrow.parentNode === paperRef.current) {
                paperRef.current.removeChild(hintArrow);
              }
            }
          }, 1000);
        } catch (error) {
          console.error('Error in unsuccessful fold handling:', error);
        }
      }
    }
  };
  const switchFoldType = () => {
    if (foldStage === 0) {
      setFoldType(prev => prev === 'attack' ? 'defense' : 'attack');
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-stone-800">How to Fold Origami</h2>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-stone-600 hover:text-stone-800 text-2xl"
              >
                ×
              </button>
            </div>            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="text-amber-600 font-bold text-xl">1</div>
                <div>
                  <h3 className="font-medium text-stone-800">Choose Your Style</h3>
                  <p className="text-sm text-stone-600">Select Attack (red) for offensive origami or Defense (blue) for healing origami.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="text-amber-600 font-bold text-xl">2</div>
                <div>
                  <h3 className="font-medium text-stone-800">Follow the Pattern</h3>
                  <p className="text-sm text-stone-600">Click on the red pulsing dots in sequence. Look for the "Click Here" indicator.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="text-amber-600 font-bold text-xl">3</div>
                <div>
                  <h3 className="font-medium text-stone-800">Complete All Folds</h3>
                  <p className="text-sm text-stone-600">Complete all 5 folds before the timer runs out to successfully create your origami.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="text-amber-600 font-bold text-xl">4</div>
                <div>
                  <h3 className="font-medium text-stone-800">Tips for Success</h3>
                  <p className="text-sm text-stone-600">If you miss a fold point, an arrow will guide you to the correct location. The click area is generous, so you don't need to be exact.</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowTutorial(false)}
              className="mt-6 w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-stone-800">
            {foldType === 'attack' ? 'Fold an Attack Origami' : 'Fold a Defense Origami'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTutorial(true)}
              className="text-stone-600 hover:text-stone-800 text-sm bg-stone-100 px-2 py-1 rounded-lg flex items-center gap-1"
            >
              <span className="text-xs">?</span> Help
            </button>
            <button
              onClick={onClose}
              className="text-stone-600 hover:text-stone-800 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={switchFoldType}
              disabled={foldStage > 0}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 ${foldType === 'attack' ? 'bg-red-600 text-white' : 'bg-stone-200 text-stone-700'} ${foldStage > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 hover:text-white'}`}
            >
              <Sword className="w-4 h-4" />
              Attack
            </button>
            <button 
              onClick={switchFoldType}
              disabled={foldStage > 0}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 ${foldType === 'defense' ? 'bg-blue-600 text-white' : 'bg-stone-200 text-stone-700'} ${foldStage > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:text-white'}`}
            >
              <Shield className="w-4 h-4" />
              Defense
            </button>
          </div>
          <div className="text-sm font-medium text-stone-600">
            Time: <span className={timeLeft < 10 ? 'text-red-600' : ''}>{timeLeft}s</span>
          </div>
        </div>
        
        <div className="mb-2 p-2 bg-stone-100 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-stone-600">Pattern Selection:</div>
            <div className="text-xs font-medium text-stone-700">
              {(foldType === 'attack' ? attackPatterns : defensePatterns)[selectedPatternIndex].name}
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-1">
            {(foldType === 'attack' ? attackPatterns : defensePatterns).map((pattern, index) => (
              <button
                key={pattern.name}
                onClick={() => foldStage === 0 && setSelectedPatternIndex(index)}
                disabled={foldStage > 0}
                className={`p-1 rounded text-xs ${selectedPatternIndex === index 
                  ? (foldType === 'attack' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white')
                  : 'bg-stone-200 hover:bg-stone-300'} ${foldStage > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-bold truncate">{pattern.name.split(' ')[0]}</div>
                <div className="flex justify-between text-[10px]">
                  <span>★{pattern.difficulty}</span>
                  <span>{pattern.value}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-2 text-xs text-stone-600">
            <div className="font-medium">{(foldType === 'attack' ? attackPatterns : defensePatterns)[selectedPatternIndex].name}</div>
            <div>{(foldType === 'attack' ? attackPatterns : defensePatterns)[selectedPatternIndex].description}</div>
          </div>
        </div>
        
        <div className="relative mb-4 bg-amber-50 rounded-lg overflow-hidden">
          <div 
            ref={paperRef}
            className={`w-full aspect-square relative transition-all duration-300 ${isAnimating ? 'scale-95 rotate-3' : ''}`}
          >
            <canvas 
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full cursor-pointer"
              onClick={handlePaperClick}
            />
            
            <div className={`absolute inset-0 bg-contain bg-center bg-no-repeat transition-opacity duration-500 ${foldStage > 0 ? 'opacity-100' : 'opacity-0'}`}
              style={{
                backgroundImage: `url('/paper-fold-${foldStage}-${foldType}.svg')`,
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
        
        <div className="text-center text-sm text-stone-600 mb-4 p-2 bg-amber-100 rounded-lg border border-amber-200">
          <strong>How to fold:</strong> Click on the red highlighted points with the "Click Here" indicator. Follow the points in order to complete the origami pattern.
        </div>
        
        <div className="text-center">
          <div className="mb-2 font-medium">
            Progress: {foldStage}/{getCurrentPattern().length}
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${foldType === 'attack' ? 'bg-red-600' : 'bg-blue-600'}`}
              style={{ width: `${(foldStage / getCurrentPattern().length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperFoldingGame;