import React from 'react';

export interface GymLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  variant?: 'badge' | 'plain';
  className?: string;
  imageClassName?: string;
  alt?: string;
  withText?: boolean;
  textSubtitle?: string;
}

const sizeClasses = {
  xs: { container: 'w-6 h-6 rounded-md p-0.5', img: 'w-5 h-5' },
  sm: { container: 'w-8 h-8 rounded-lg p-1', img: 'w-6 h-6' },
  md: { container: 'w-10 h-10 rounded-xl p-1.5', img: 'w-7 h-7' },
  lg: { container: 'w-12 h-12 rounded-2xl p-2', img: 'w-8 h-8' },
  xl: { container: 'w-16 h-16 rounded-2xl p-2.5', img: 'w-11 h-11' },
  custom: { container: '', img: 'w-full h-full' },
};

export const GymLogo: React.FC<GymLogoProps> = ({
  size = 'md',
  variant = 'badge',
  className = '',
  imageClassName = '',
  alt = 'POWERZONE Golden Lion Logo',
  withText = false,
  textSubtitle,
}) => {
  const currentSize = sizeClasses[size] || sizeClasses.md;

  const logoImg = (
    <img
      src="/powerzone-logo.png"
      alt={alt}
      className={`object-contain select-none drop-shadow-sm transition-transform duration-200 ${currentSize.img} ${imageClassName}`}
      loading="eager"
      decoding="async"
    />
  );

  const logoElement =
    variant === 'badge' ? (
      <div
        className={`flex items-center justify-center shrink-0 bg-gradient-to-br from-charcoal-900 via-charcoal-950 to-black border border-amber-500/35 shadow-md shadow-amber-500/15 ${currentSize.container} ${className}`}
      >
        {logoImg}
      </div>
    ) : (
      <div className={`flex items-center justify-center shrink-0 ${currentSize.container} ${className}`}>
        {logoImg}
      </div>
    );

  if (!withText) {
    return logoElement;
  }

  return (
    <div className="flex items-center gap-2.5">
      {logoElement}
      <div className="flex flex-col">
        <span className="font-heading font-black text-base sm:text-lg tracking-wider text-text uppercase flex items-center gap-1">
          POWER<span className="text-primary">ZONE</span>
        </span>
        {textSubtitle && (
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest leading-none">
            {textSubtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default GymLogo;
