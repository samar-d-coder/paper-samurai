
import React, { useState, useEffect } from 'react';

interface OrigamiSamuraiProps {
  form: 'humanoid' | 'crane';
  windIntensity: number;
  onTransform: () => void;
}
const OrigamiSamurai = ({ form, windIntensity, onTransform }: OrigamiSamuraiProps) => {
  const [isTransforming, setIsTransforming] = useState(false);
  const [paperHealth, setPaperHealth] = useState(100);
  const [creasesVisible, setCreasesVisible] = useState(false);
  useEffect(() => {
    if (isTransforming) {
      const timer = setTimeout(() => setIsTransforming(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isTransforming]);
  const handleClick = () => {
    if (!isTransforming) {
      setIsTransforming(true);
      onTransform();
    }
  };
  const getFormPath = () => {
    if (form === 'crane') {
      return (
        <>
          <path
            d="M50 40 L70 20 L90 30 L80 50 L90 70 L70 80 L50 60 L30 80 L10 70 L20 50 L10 30 L30 20 Z"
            fill="#f8f5f0"
            stroke="#d6d3d1"
            strokeWidth="2"
          />
          <path
            d="M20 35 L5 25 L15 45 L25 50 Z"
            fill="#f1f0ec"
            stroke="#d6d3d1"
            strokeWidth="1.5"
          />
          <path
            d="M80 35 L95 25 L85 45 L75 50 Z"
            fill="#f1f0ec"
            stroke="#d6d3d1"
            strokeWidth="1.5"
          />
          <path
            d="M50 20 L60 5 L55 15 L50 20"
            fill="#f8f5f0"
            stroke="#d6d3d1"
            strokeWidth="2"
          />
        </>
      );
    } else {
      return (
        <>
          <path
            d="M50 20 L60 30 L65 50 L60 70 L40 70 L35 50 L40 30 Z"
            fill="#f8f5f0"
            stroke="#d6d3d1"
            strokeWidth="2"
          />
          <path
            d="M40 35 L25 40 L30 50 L40 45 Z"
            fill="#f1f0ec"
            stroke="#d6d3d1"
            strokeWidth="1.5"
          />
          <path
            d="M60 35 L75 40 L70 50 L60 45 Z"
            fill="#f1f0ec"
            stroke="#d6d3d1"
            strokeWidth="1.5"
          />
          <circle
            cx="50"
            cy="15"
            r="8"
            fill="#f8f5f0"
            stroke="#d6d3d1"
            strokeWidth="2"
          />
          <path
            d="M42 70 L40 85 L45 85 L47 70 Z"
            fill="#f1f0ec"
            stroke="#d6d3d1"
            strokeWidth="1.5"
          />
          <path
            d="M58 70 L60 85 L55 85 L53 70 Z"
            fill="#f1f0ec"
            stroke="#d6d3d1"
            strokeWidth="1.5"
          />
        </>
      );
    }
  };

  const getCreasePattern = () => {
    if (!creasesVisible) return null;
    
    return (
      <g className="opacity-60">
        <line x1="25" y1="25" x2="75" y2="75" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="75" y1="25" x2="25" y2="75" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
      </g>
    );
  };

  const windSway = Math.sin(Date.now() * 0.002) * windIntensity * 3;
  const transformScale = isTransforming ? 1.2 : 1;
  const transformRotation = isTransforming ? 180 : 0;

  return (
    <div className="relative">
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-stone-300 rounded-full">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full transition-all duration-300"
          style={{ width: `${paperHealth}%` }}
        />
      </div>
      <div
        className="cursor-pointer select-none relative"
        onClick={handleClick}
        onMouseEnter={() => setCreasesVisible(true)}
        onMouseLeave={() => setCreasesVisible(false)}
        style={{
          transform: `rotate(${windSway + transformRotation}deg) scale(${transformScale})`,
          transition: isTransforming ? 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'transform 0.1s ease-out'
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
        >
          <defs>
            <pattern id="paperTexture" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="#f8f5f0"/>
              <path d="M0,4l4,-4M-1,1l2,-2M3,5l2,-2" stroke="#e7e5e4" strokeWidth="0.5"/>
            </pattern>
            <filter id="paperShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
            </filter>
          </defs>
          <g filter="url(#paperShadow)">
            {getFormPath()}
          </g>
          {getCreasePattern()}
          {paperHealth < 80 && (
            <g className="opacity-40">
              <path d="M30 25 L35 20 L32 30 Z" fill="#8b5cf6" />
              <path d="M70 65 L75 60 L72 70 Z" fill="#8b5cf6" />
            </g>
          )}
        </svg>
        {isTransforming && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-80 animate-sparkle"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center text-stone-600 text-sm">
        <div className="font-semibold">Click to Transform</div>
        <div className="text-xs opacity-70">Hover to see fold lines</div>
      </div>
      <style>{`
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        .animate-sparkle {
          animation: sparkle 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OrigamiSamurai;
