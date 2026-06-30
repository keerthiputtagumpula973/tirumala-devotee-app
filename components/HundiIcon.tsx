import React from 'react';

interface HundiIconProps {
  size?: number;
}

export const HundiIcon: React.FC<HundiIconProps> = ({ size = 28 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Golden Coins in Background */}
      <circle cx="20" cy="18" r="9" fill="#FFD700" stroke="#aa8511" strokeWidth="1.5"/>
      <circle cx="44" cy="18" r="9" fill="#FFD700" stroke="#aa8511" strokeWidth="1.5"/>
      
      {/* Front Golden Coin */}
      <circle cx="32" cy="16" r="11" fill="#FFD700" stroke="#aa8511" strokeWidth="2"/>
      {/* Coin details (Rupee-ish look) */}
      <circle cx="32" cy="16" r="8" fill="#FFE066" />
      <path d="M30 13.5H34M30 15.5H34M31.5 13.5V18.5" stroke="#aa8511" strokeWidth="1.2" strokeLinecap="round"/>
      
      {/* Hundi Pot Base */}
      <path d="M12 42C12 31 18 29 24 29H40C46 29 52 31 52 42C52 52 44 56 32 56C20 56 12 52 12 42Z" fill="#c25900" stroke="#8c3f00" strokeWidth="2.5"/>
      
      {/* Pot Neck/Rim */}
      <path d="M20 29C20 26.5 22 25 32 25C42 25 44 26.5 44 29H20Z" fill="#e67e22" stroke="#8c3f00" strokeWidth="2"/>
      
      {/* Red Holy Thread around Neck */}
      <path d="M19.5 29.5C24 31 40 31 44.5 29.5" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Namam Tilak symbol on Pot */}
      {/* Side white lines */}
      <path d="M26 35L29 44" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M38 35L35 44" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Red center spot */}
      <path d="M32 37V41" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
};
