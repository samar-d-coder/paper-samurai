import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import ParticleEffect from './ParticleEffect';
import { soundManager } from '../utils/SoundManager';

interface Point {
  x: number;
  y: number;
}

interface OrigamiPattern {
  id: string;
  name: string;
  points: Point[];
  attackType: 'crane' | 'dragon' | 'butterfly' | 'samurai' | 'lotus';
  damage: number;
  description: string;
  timeLimit: number;
  color: string;
}

interface OrigamiPatternTracerProps {
  pattern: OrigamiPattern;
  onComplete: (accuracy: number, attackType: string) => void;
  onTimeout: () => void;
  isActive: boolean;
}

const OrigamiPatternTracer = ({ pattern, onComplete, onTimeout, isActive }: OrigamiPatternTracerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [tracedPoints, setTracedPoints] = useState<Point[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(pattern.timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  const [realtimeAccuracy, setRealtimeAccuracy] = useState(100);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, type: 'success' | 'hit' | 'critical'}>>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0 && !isCompleted) {
      timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            try {
              soundManager.playError();
              onTimeout();
            } catch (error) {
              console.error('Error in timeout handler:', error);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timeLeft, isActive, isCompleted, onTimeout]);

  useEffect(() => {
    if (!isActive) return;
    
    let animationFrameId: number | null = null;
    let isComponentMounted = true;
    
    const animate = () => {
      if (!isComponentMounted) return;
      
      try {
        drawPattern();
        animationFrameId = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Error in animation frame:', error);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      isComponentMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };
  }, [isActive, currentPointIndex]);

  const drawPattern = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = pattern.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = pattern.color;
    ctx.shadowBlur = 10;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    if (pattern.points.length > 2) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      pattern.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
        if (pattern.attackType === 'crane' || pattern.attackType === 'butterfly') {
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(centerX, centerY);
        }
      });
      if (pattern.attackType === 'dragon' || pattern.attackType === 'samurai') {
        ctx.closePath();
      }
    } else {
      pattern.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    pattern.points.forEach((point, index) => {
      const pulseSize = index === currentPointIndex ? 2 + Math.sin(Date.now() * 0.01) * 2 : 0;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8 + pulseSize, 0, 2 * Math.PI);
      if (index === currentPointIndex) {
        ctx.fillStyle = '#ff6b6b';
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 15;
      } else if (index < currentPointIndex) {
        ctx.fillStyle = '#51cf66';
      } else {
        ctx.fillStyle = '#ced4da';
      }
      ctx.fill();
      ctx.strokeStyle = '#343a40';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
    if (tracedPoints.length > 1) {
      const accuracyColor = realtimeAccuracy > 80 ? '#51cf66' : realtimeAccuracy > 50 ? '#ffd43b' : '#ff6b6b';
      ctx.strokeStyle = accuracyColor;
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.shadowColor = accuracyColor;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      tracedPoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  const calculateRealtimeAccuracy = () => {
    if (tracedPoints.length < 5 || currentPointIndex === 0) return 100;
    
    try {
      const recentPoints = tracedPoints.slice(-20);
      if (currentPointIndex >= pattern.points.length) return 100;
      const currentTarget = pattern.points[currentPointIndex];
      if (currentPointIndex - 1 < 0) return 100; 
      const prevTarget = pattern.points[currentPointIndex - 1];
      
      if (!currentTarget || !prevTarget) return 100;
      const idealVector = {
        x: currentTarget.x - prevTarget.x,
        y: currentTarget.y - prevTarget.y
      };
      const idealMagnitude = Math.sqrt(idealVector.x * idealVector.x + idealVector.y * idealVector.y);
      if (idealMagnitude === 0) return 100;
      const normalizedIdeal = {
        x: idealVector.x / idealMagnitude,
        y: idealVector.y / idealMagnitude
      };
      let totalDeviation = 0;
      let validPoints = 0;
      for (let i = 1; i < recentPoints.length; i++) {
        const prev = recentPoints[i - 1];
        const current = recentPoints[i];
        
        if (!prev || !current) continue;
        const actualVector = {
          x: current.x - prev.x,
          y: current.y - prev.y
        };
        const actualMagnitude = Math.sqrt(actualVector.x * actualVector.x + actualVector.y * actualVector.y);
        if (actualMagnitude === 0) continue;
        const normalizedActual = {
          x: actualVector.x / actualMagnitude,
          y: actualVector.y / actualMagnitude
        };
        const dotProduct = normalizedIdeal.x * normalizedActual.x + normalizedIdeal.y * normalizedActual.y;
        const angleDeviation = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
        totalDeviation += (angleDeviation * 180 / Math.PI);
        validPoints++;
      }
      if (validPoints === 0) return 100;
      const averageDeviation = totalDeviation / validPoints;
      const accuracy = Math.max(0, 100 - (averageDeviation / 180 * 100));
      return Math.round(accuracy);
    } catch (error) {
      console.error('Error calculating realtime accuracy:', error);
      return 100;
    }
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive || isCompleted) return;
    setIsTracing(true);
    setTracedPoints([]);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && canvasRef.current) {
      try {
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        setTracedPoints([point]);
      } catch (error) {
        console.error('Error in handleMouseDown:', error);
      }
    }
  };
  const handleMouseUp = () => {
    if (isTracing) {
      setIsTracing(false);
    }
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isTracing || !isActive || isCompleted) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setTracedPoints(prev => {
        const limitedPrev = prev.length > 100 ? prev.slice(-100) : prev;
        return [...limitedPrev, point];
      });
      const newAccuracy = calculateRealtimeAccuracy();
      setRealtimeAccuracy(newAccuracy);
      if (currentPointIndex >= pattern.points.length) return;
      const currentTargetPoint = pattern.points[currentPointIndex];
      if (currentTargetPoint) {
        const distance = Math.sqrt(
          Math.pow(point.x - currentTargetPoint.x, 2) + 
          Math.pow(point.y - currentTargetPoint.y, 2)
        );
        if (distance < 20) { 
          try {
            soundManager.playPatternPoint();
          } catch (error) {
            console.error('Error playing sound:', error);
          }
          setCurrentPointIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex;
          });
          if (currentPointIndex + 1 >= pattern.points.length) {
            const finalAccuracy = calculateAccuracy();
            setAccuracy(finalAccuracy);
            setIsCompleted(true);
            try {
              if (finalAccuracy > 70) {
                soundManager.playSuccess();
              } else {
                soundManager.playError();
              }
            } catch (error) {
              console.error('Error playing sound:', error);
            }

            setTimeout(() => {
              onComplete(finalAccuracy, pattern.attackType);
            }, 1000);
          }
          setParticles(prev => {
            const limitedPrev = prev.length > 10 ? prev.slice(-10) : prev;
            return [...limitedPrev, {
              id: Date.now(),
              x: point.x,
              y: point.y,
              type: distance < 10 ? 'critical' : 'success'
            }];
          });
        }
      }
    }
  };

  const calculateAccuracy = () => {
    if (tracedPoints.length === 0 || pattern.points.length === 0) return 0;
    
    try {
      let totalDistance = 0;
      let pointsEvaluated = 0;
      const maxPointsToEvaluate = 100;
      const sampleInterval = Math.max(1, Math.floor(tracedPoints.length / Math.min(maxPointsToEvaluate, pattern.points.length * 5)));
      
      for (let i = 0; i < tracedPoints.length && pointsEvaluated < maxPointsToEvaluate; i += sampleInterval) {
        const tracedPoint = tracedPoints[i];
        if (!tracedPoint) continue; 
        let minDistance = Infinity;
        for (const patternPoint of pattern.points) {
          if (!patternPoint) continue;
          const distance = Math.sqrt(
            Math.pow(tracedPoint.x - patternPoint.x, 2) + 
            Math.pow(tracedPoint.y - patternPoint.y, 2)
          );
          minDistance = Math.min(minDistance, distance);
        }
        totalDistance += minDistance;
        pointsEvaluated++;
      }
      if (pointsEvaluated === 0) return 0;
      const averageDistance = totalDistance / pointsEvaluated;
      const maxAllowableDistance = 50;
      const accuracy = Math.max(0, 100 - (averageDistance / maxAllowableDistance * 100));
      return Math.round(accuracy);
    } catch (error) {
      console.error('Error calculating accuracy:', error);
      return 0;
    }
  };
  const getAttackTypeIcon = () => {
    switch (pattern.attackType) {
      case 'crane': return '🕊️';
      case 'dragon': return '🐉';
      case 'butterfly': return '🦋';
      case 'samurai': return '⚔️';
      case 'lotus': return '🪷';
      default: return '📄';
    }
  };
  const getAccuracyColor = () => {
    if (realtimeAccuracy > 80) return 'text-green-500';
    if (realtimeAccuracy > 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  const getTimerColor = () => {
    if (timeLeft > pattern.timeLimit * 0.5) return 'text-blue-600';
    if (timeLeft > pattern.timeLimit * 0.25) return 'text-yellow-600';
    return 'text-red-600';
  };
  const memoizedParticles = React.useMemo(() => {
    const limitedParticles = particles.slice(-10);    
    return limitedParticles.map(particle => (
      <ParticleEffect
        key={particle.id}
        x={particle.x}
        y={particle.y}
        type={particle.type}
        onComplete={() => setParticles(prev => prev.filter(p => p.id !== particle.id))}
      />
    ));
  }, [particles]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        {memoizedParticles}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getAttackTypeIcon()}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{pattern.name}</h3>
              <p className="text-sm text-gray-600">{pattern.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${getTimerColor()}`}>
              <Clock className="w-4 h-4" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            <div className="text-sm text-gray-600">
              Progress: {currentPointIndex}/{pattern.points.length}
            </div>
            <div className={`text-sm font-bold ${getAccuracyColor()}`}>
              Precision: {Math.round(realtimeAccuracy)}%
            </div>
          </div>
        </div>
        <div className="relative mb-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-gray-50"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-90 rounded-lg">
              <div className="text-center text-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                <h4 className="text-2xl font-bold">Pattern Complete!</h4>
                <p className="text-lg">Accuracy: {Math.round(accuracy)}%</p>
                <p className="text-sm">Damage: {Math.round(pattern.damage * (accuracy / 100))}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Trace the pattern by following the dotted lines and hitting each point in order
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-xs">Current</span>
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs">Complete</span>
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <span className="text-xs">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrigamiPatternTracer;
