import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'light';
}

export const Logo: React.FC<LogoProps> = ({ className = "", variant = 'default' }) => {
  const textColor = variant === 'light' ? '#FFFFFF' : '#2C3B41';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Wordmark Only - Symbol Removed */}
      <div className="flex flex-col items-center">
        <span className="font-serif text-5xl tracking-widest font-bold leading-none" style={{ color: textColor }}>
          LUMAR
        </span>
        {variant === 'default' && (
          <span className="font-sans text-[0.65rem] tracking-[0.25em] uppercase mt-3 font-semibold" style={{ color: textColor }}>
            Personal Service
          </span>
        )}
      </div>
    </div>
  );
};