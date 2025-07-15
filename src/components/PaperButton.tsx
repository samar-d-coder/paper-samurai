
import React, { useState } from 'react';

interface PaperButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}
const PaperButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false 
}: PaperButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const baseClasses = "relative px-8 py-4 text-xl font-bold transition-all duration-200 cursor-pointer select-none";
  const shadowClasses = "shadow-lg hover:shadow-xl active:shadow-md"; 
  const variantClasses = variant === 'primary' 
    ? "bg-gradient-to-b from-red-600 to-red-700 text-white border-2 border-red-800" 
    : "bg-gradient-to-b from-stone-200 to-stone-300 text-stone-800 border-2 border-stone-400";

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const hoverEffect = isHovered && !disabled ? "transform -translate-y-1 scale-105" : "";
  const pressEffect = isPressed && !disabled ? "transform translate-y-1 scale-95" : "";

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };
  return (
    <div
      className={`${baseClasses} ${shadowClasses} ${variantClasses} ${disabledClasses} ${hoverEffect} ${pressEffect} ${className}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onClick={handleClick}
      style={{
        background: variant === 'primary' 
          ? 'linear-gradient(145deg, #dc2626, #b91c1c)' 
          : 'linear-gradient(145deg, #f5f5f4, #e7e5e4)',
        boxShadow: isPressed && !disabled
          ? 'inset 4px 4px 8px rgba(0,0,0,0.3), inset -4px -4px 8px rgba(255,255,255,0.3)' 
          : '6px 6px 12px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.7)',
        borderRadius: '8px',
        textShadow: variant === 'primary' 
          ? '2px 2px 4px rgba(0,0,0,0.5)' 
          : '1px 1px 2px rgba(255,255,255,0.8)'
      }}
    >
      <div className="absolute inset-0 opacity-20 rounded-lg pointer-events-none">
        <div className="w-full h-full bg-repeat rounded-lg" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill-opacity='0.1'%3E%3Cpath d='M0 0h20v1H0zM0 4h20v1H0zM0 8h20v1H0zM0 12h20v1H0zM0 16h20v1H0z' fill='%23000'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      <div className="absolute top-2 left-4 w-8 h-0.5 bg-current opacity-20 transform -rotate-12"></div>
      <div className="absolute bottom-2 right-4 w-6 h-0.5 bg-current opacity-20 transform rotate-12"></div>
      
      <span className="relative z-10">{children}</span>
    </div>
  );
};

export default PaperButton;
