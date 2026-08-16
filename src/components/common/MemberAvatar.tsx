import React, { useState } from 'react';
import { Camera, ZoomIn, User } from 'lucide-react';

interface MemberAvatarProps {
  name: string;
  photoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'full' | '2xl' | 'xl';
  className?: string;
  onClick?: () => void;
  showZoomIcon?: boolean;
  showCameraIcon?: boolean;
  onCameraClick?: (e: React.MouseEvent) => void;
  alt?: string;
}

export const getInitials = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') return 'M';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'M';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const SIZE_MAP = {
  xs: { box: 'w-7 h-7 text-[10px]', icon: 'w-3 h-3' },
  sm: { box: 'w-9 h-9 text-xs', icon: 'w-3.5 h-3.5' },
  md: { box: 'w-12 h-12 text-sm', icon: 'w-4 h-4' },
  lg: { box: 'w-16 h-16 text-lg', icon: 'w-5 h-5' },
  xl: { box: 'w-20 h-20 text-xl', icon: 'w-6 h-6' },
  '2xl': { box: 'w-24 h-24 text-2xl', icon: 'w-7 h-7' },
};

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  name,
  photoUrl,
  size = 'md',
  shape = '2xl',
  className = '',
  onClick,
  showZoomIcon = false,
  showCameraIcon = false,
  onCameraClick,
  alt
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  const roundedClass = shape === 'full' ? 'rounded-full' : shape === '2xl' ? 'rounded-2xl' : 'rounded-xl';

  const hasValidPhoto = photoUrl && photoUrl.trim().length > 0 && !imageError;

  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 aspect-square group overflow-hidden ${sizeConfig.box} ${roundedClass} ${
        onClick ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]' : ''
      } transition-all duration-200 shadow-sm ring-2 ring-emerald-500/30 ${className}`}
      title={alt || name}
    >
      {hasValidPhoto ? (
        <img
          src={photoUrl}
          alt={alt || name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full aspect-square bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-800 text-white flex items-center justify-center font-black tracking-wider shadow-inner select-none">
          {initials ? (
            <span>{initials}</span>
          ) : (
            <User className={`${sizeConfig.icon} text-emerald-200`} />
          )}
        </div>
      )}

      {/* Hover zoom overlay indicator if enabled */}
      {showZoomIcon && onClick && (
        <div className={`absolute inset-0 bg-slate-950/50 ${roundedClass} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]`}>
          <ZoomIn className={`${sizeConfig.icon} text-emerald-300 drop-shadow-md`} />
        </div>
      )}

      {/* Optional camera icon badge */}
      {showCameraIcon && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onCameraClick) onCameraClick(e);
            else if (onClick) onClick();
          }}
          className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-1 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer border border-white dark:border-slate-900"
          title="Badilisha Picha"
        >
          <Camera className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
