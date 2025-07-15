
import React, { useRef, useEffect } from 'react';


interface Point {
  x: number;
  y: number;
}
interface PatternPreviewProps {
  points: Point[];
  color: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}
const PatternPreview = ({ points, color, size = 'medium', animated = false }: PatternPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensions = {
    small: { width: 120, height: 80 },
    medium: { width: 200, height: 130 },
    large: { width: 300, height: 200 }
  };
  const scaleFactor = {
    small: 0.2,
    medium: 0.33,
    large: 0.5
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = scaleFactor[size];
    const dim = dimensions[size];
    ctx.clearRect(0, 0, dim.width, dim.height);
    const scaledPoints = points.map(point => ({
      x: point.x * scale + dim.width * 0.1,
      y: point.y * scale + dim.height * 0.1
    }));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    scaledPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    scaledPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? '#10b981' : '#64748b';
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), point.x, point.y + 3);
    });
    if (animated && size !== 'small') {
      let animationFrame: number;
      let progress = 0;

      const animate = () => {
        progress += 0.02;
        if (progress > 1) progress = 0;

        ctx.clearRect(0, 0, dim.width, dim.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        scaledPoints.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        const traceLength = Math.floor(scaledPoints.length * progress);
        if (traceLength > 1) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          ctx.beginPath();
          for (let i = 0; i < traceLength; i++) {
            if (i === 0) {
              ctx.moveTo(scaledPoints[i].x, scaledPoints[i].y);
            } else {
              ctx.lineTo(scaledPoints[i].x, scaledPoints[i].y);
            }
          }
          ctx.stroke();
        }
        scaledPoints.forEach((point, index) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = index < traceLength ? '#10b981' : '#64748b';
          ctx.fill();
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText((index + 1).toString(), point.x, point.y + 3);
        });

        animationFrame = requestAnimationFrame(animate);
      };
      animate();
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [points, color, size, animated]);

  const dim = dimensions[size];
  return (
    <canvas
      ref={canvasRef}
      width={dim.width}
      height={dim.height}
      className="border border-stone-300 rounded-lg bg-stone-50"
    />
  );
};

export default PatternPreview;
