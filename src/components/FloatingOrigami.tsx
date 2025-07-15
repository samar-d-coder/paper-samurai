
import React, { useEffect, useState } from 'react';

interface OrigamiElement {
  id: number;
  x: number;
  y: number;
  rotation: number;
  size: number;
  type: 'crane' | 'butterfly' | 'flower';
  speed: number;
}
const FloatingOrigami = () => {
  const [elements, setElements] = useState<OrigamiElement[]>([]);

  useEffect(() => {
    const createElements = () => {
      const newElements: OrigamiElement[] = [];
      for (let i = 0; i < 8; i++) {
        newElements.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          rotation: Math.random() * 360,
          size: 20 + Math.random() * 30,
          type: ['crane', 'butterfly', 'flower'][Math.floor(Math.random() * 3)] as any,
          speed: 0.2 + Math.random() * 0.3
        });
      }
      setElements(newElements);
    };
    createElements();
    const animateElements = () => {
      setElements(prev => prev.map(element => ({
        ...element,
        y: (element.y + element.speed) % 110,
        rotation: element.rotation + 0.5,
        x: element.x + Math.sin(Date.now() * 0.001 + element.id) * 0.1
      })));
    };
    const interval = setInterval(animateElements, 50);
    return () => clearInterval(interval);
  }, []);
  const getOrigamiShape = (type: string) => {
    switch (type) {
      case 'crane':
        return (
          <path
            d="M12 2L8 6v4l4-2 4 2V6l-4-4zM4 10l4 2v6l-4-2v-6zm16 0v6l-4 2v-6l4-2zM12 14l-4 4v4l4-2 4 2v-4l-4-4z"
            fill="currentColor"
          />
        );
      case 'butterfly':
        return (
          <path
            d="M12 2c-1 0-2 1-2 2 0 .5.2 1 .5 1.4L8 8c-.8-.8-2-1-3-1s-2 .2-2 1c0 .8.2 2 1 3l2.5 2.5L12 8l5.5 5.5L20 11c.8-1 1-2.2 1-3 0-.8-.2-1-2-1s-2.2.2-3 1l-2.5-2.6c.3-.4.5-.9.5-1.4 0-1-1-2-2-2z"
            fill="currentColor"
          />
        );
      default:
        return (
          <path
            d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z"
            fill="currentColor"
          />
        );
    }
  };
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {elements.map(element => (
        <div
          key={element.id}
          className="absolute opacity-30 text-stone-400"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: `rotate(${element.rotation}deg)`,
            transition: 'all 0.05s linear'
          }}
        >
          <svg
            width={element.size}
            height={element.size}
            viewBox="0 0 24 24"
            className="drop-shadow-md"
          >
            {getOrigamiShape(element.type)}
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingOrigami;
