import React from 'react';

interface LemonAvatarProps {
  equippedItems: {
    hat?: string;
    glasses?: string;
    shirt?: string;
    pants?: string;
    accessory?: string;
    skin?: string;
  };
  size?: number;
  className?: string;
  emotion?: 'happy' | 'sad' | 'cool' | 'dead' | 'neutral';
}

export const LemonAvatar: React.FC<LemonAvatarProps> = ({ 
  equippedItems, 
  size = 200, 
  className = "",
  emotion = 'happy'
}) => {
  
  const { hat, glasses, shirt, pants, accessory } = equippedItems;

  // --- SVG COMPONENTS ---

  // 1. Body & Face
  const LemonBody = () => (
    <g>
      {/* Body */}
      <ellipse cx="50" cy="55" rx="38" ry="32" fill="#FDE047" stroke="#EAB308" strokeWidth="1.5" />
      {/* Highlight */}
      <ellipse cx="35" cy="40" rx="8" ry="4" fill="#FEF9C3" opacity="0.6" transform="rotate(-20 35 40)" />
      {/* Texture */}
      <circle cx="25" cy="60" r="0.5" fill="#CA8A04" opacity="0.3" />
      <circle cx="75" cy="65" r="0.5" fill="#CA8A04" opacity="0.3" />
      <circle cx="50" cy="80" r="0.5" fill="#CA8A04" opacity="0.3" />
    </g>
  );

  const Face = () => {
    // Eyes
    const renderEyes = () => {
      if (emotion === 'dead') {
        return (
          <g stroke="#451a03" strokeWidth="2" strokeLinecap="round">
            <path d="M35 45 L45 55 M45 45 L35 55" /> 
            <path d="M55 45 L65 55 M65 45 L55 55" /> 
          </g>
        );
      }
      return (
        <g fill="#451a03">
          <circle cx="40" cy="50" r="3" />
          <circle cx="60" cy="50" r="3" />
        </g>
      );
    };

    // Mouth
    const renderMouth = () => {
      if (emotion === 'happy') return <path d="M40 65 Q50 75 60 65" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />;
      if (emotion === 'sad') return <path d="M40 70 Q50 60 60 70" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />;
      if (emotion === 'cool') return <path d="M42 68 Q50 72 58 68" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />;
      return <path d="M45 70 L55 70" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />;
    };

    return <g>{renderEyes()}{renderMouth()}</g>;
  };

  // 2. Clothing Layers

  const ShirtLayer = () => {
    switch (shirt) {
      case 'shirt_1': // T-Shirt
        return <path d="M25 55 Q50 50 75 55 L75 80 Q50 85 25 80 Z" fill="#3b82f6" opacity="0.9" />; // Blue Tee
      case 'shirt_2': // Suit
        return (
          <g>
            <path d="M25 55 Q50 50 75 55 L75 82 Q50 85 25 82 Z" fill="#1e293b" />
            <path d="M50 55 L50 82" stroke="#fff" strokeWidth="1" /> {/* Shirt line */}
            <path d="M45 55 L50 65 L55 55" fill="#fff" /> {/* Collar */}
            <path d="M48 55 L50 70 L52 55" fill="#dc2626" /> {/* Tie */}
          </g>
        );
      case 'shirt_3': // Dress
        return <path d="M28 55 Q50 50 72 55 L80 85 Q50 90 20 85 Z" fill="#ec4899" />;
      case 'shirt_4': // Kimono
        return (
          <g>
             <path d="M25 55 Q50 50 75 55 L75 82 Q50 85 25 82 Z" fill="#fcd34d" />
             <path d="M25 55 L50 75 L75 55" fill="none" stroke="#f87171" strokeWidth="2" />
          </g>
        );
      case 'shirt_5': // Vest
        return <path d="M28 55 Q50 50 72 55 L72 80 Q50 82 28 80 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1" />;
      case 'shirt_6': // Lab Coat
        return (
          <g>
            <path d="M22 55 Q50 50 78 55 L78 85 Q50 88 22 85 Z" fill="#f1f5f9" />
            <path d="M50 55 L50 85" stroke="#cbd5e1" strokeWidth="1" />
          </g>
        );
      case 'shirt_7': // Bikini
        return (
           <g>
             <circle cx="35" cy="65" r="5" fill="#ec4899" />
             <circle cx="65" cy="65" r="5" fill="#ec4899" />
             <path d="M35 65 L50 55 L65 65" fill="none" stroke="#ec4899" strokeWidth="1" />
           </g>
        );
      default: return null;
    }
  };

  const PantsLayer = () => {
    // Note: Pants are rendered at the bottom of the body
    switch (pants) {
      case 'pants_1': // Jeans
        return <path d="M30 75 L30 85 Q50 90 70 85 L70 75 Q50 80 30 75 Z" fill="#1d4ed8" />;
      case 'pants_2': // Shorts
        return <path d="M30 75 L30 82 Q50 85 70 82 L70 75 Q50 80 30 75 Z" fill="#16a34a" />;
      default: return null;
    }
  };

  // 3. Accessories

  const GlassesLayer = () => {
    switch (glasses) {
      case 'glasses_1': // Cool Shades
        return (
          <g transform="translate(0, 2)">
            <path d="M30 45 L70 45 L65 58 L55 58 L52 50 L48 50 L45 58 L35 58 Z" fill="#111827" opacity="0.9" />
            <line x1="30" y1="46" x2="70" y2="46" stroke="#111827" strokeWidth="2" />
          </g>
        );
      case 'glasses_2': // Nerd Specs
        return (
          <g>
            <circle cx="40" cy="50" r="8" fill="#fff" fillOpacity="0.3" stroke="#000" strokeWidth="2" />
            <circle cx="60" cy="50" r="8" fill="#fff" fillOpacity="0.3" stroke="#000" strokeWidth="2" />
            <line x1="48" y1="50" x2="52" y2="50" stroke="#000" strokeWidth="2" />
          </g>
        );
      case 'glasses_3': // Goggles
        return (
          <g>
             <rect x="28" y="42" width="44" height="16" rx="8" fill="#06b6d4" stroke="#0891b2" strokeWidth="2" opacity="0.6" />
             <path d="M28 50 L18 48" stroke="#374151" strokeWidth="3" />
             <path d="M72 50 L82 48" stroke="#374151" strokeWidth="3" />
          </g>
        );
      default: return null;
    }
  };

  const HatLayer = () => {
    switch (hat) {
      case 'hat_1': // Top Hat
        return (
          <g transform="translate(0, -8)">
            <rect x="35" y="10" width="30" height="25" fill="#1e293b" />
            <rect x="25" y="35" width="50" height="5" fill="#1e293b" />
            <rect x="35" y="30" width="30" height="5" fill="#dc2626" />
          </g>
        );
      case 'hat_2': // Cap
        return (
          <g transform="translate(0, -2)">
             <path d="M30 35 Q50 10 70 35" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
             <path d="M65 33 L85 35 L68 38" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" /> {/* Visor */}
          </g>
        );
      case 'hat_3': // Crown
        return (
          <g transform="translate(0, -8)">
            <path d="M30 35 L30 15 L40 25 L50 10 L60 25 L70 15 L70 35 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="30" cy="15" r="2" fill="#ef4444" />
            <circle cx="50" cy="10" r="2" fill="#3b82f6" />
            <circle cx="70" cy="15" r="2" fill="#ef4444" />
          </g>
        );
      case 'hat_4': // Sun Hat
        return (
          <g transform="translate(0, -5)">
            <ellipse cx="50" cy="35" rx="35" ry="10" fill="#fde047" stroke="#d97706" strokeWidth="1" />
            <path d="M35 35 Q50 15 65 35" fill="#fde047" stroke="#d97706" strokeWidth="1" />
            <path d="M35 33 Q50 38 65 33" fill="none" stroke="#ef4444" strokeWidth="2" /> {/* Ribbon */}
          </g>
        );
      case 'hat_5': // Grad Cap
        return (
          <g transform="translate(0, -10)">
            <path d="M20 25 L50 35 L80 25 L50 15 Z" fill="#1e293b" />
            <rect x="30" y="30" width="40" height="10" fill="#1e293b" />
            <line x1="80" y1="25" x2="80" y2="45" stroke="#facc15" strokeWidth="2" /> {/* Tassel */}
            <circle cx="80" cy="45" r="2" fill="#facc15" />
          </g>
        );
      case 'hat_6': // Headphones
        return (
          <g transform="translate(0, 0)">
            <path d="M25 50 Q25 10 75 50" fill="none" stroke="#ef4444" strokeWidth="4" />
            <rect x="15" y="45" width="12" height="20" rx="4" fill="#1e293b" />
            <rect x="73" y="45" width="12" height="20" rx="4" fill="#1e293b" />
          </g>
        );
      case 'hat_7': // Helmet
        return (
           <g transform="translate(0, -2)">
             <path d="M25 35 Q50 10 75 35 L75 45 Q50 45 25 45 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
             <rect x="45" y="15" width="10" height="20" rx="2" fill="#fff" opacity="0.5" />
           </g>
        );
      default: return null;
    }
  };

  const AccessoryLayer = () => {
    switch (accessory) {
      case 'acc_1': // Purse
        return (
          <g transform="translate(75, 55)">
             <path d="M0 0 Q10 -10 20 0" fill="none" stroke="#a16207" strokeWidth="2" />
             <rect x="0" y="0" width="20" height="15" rx="2" fill="#facc15" stroke="#a16207" strokeWidth="1" />
          </g>
        );
      case 'acc_2': // Scarf
        return (
          <path d="M30 75 Q50 85 70 75" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
        );
      case 'acc_3': // Ribbon (Head)
        return (
           <g transform="translate(65, 25) rotate(15)">
             <path d="M0 0 L10 10 L0 20 L-5 10 Z" fill="#ec4899" />
             <path d="M0 10 L-10 0 L-20 10 L-10 20 Z" fill="#ec4899" />
             <circle cx="0" cy="10" r="3" fill="#fbcfe8" />
           </g>
        );
      case 'acc_4': // Balloon
        return (
          <g transform="translate(85, 20)">
             <line x1="0" y1="40" x2="-10" y2="60" stroke="#94a3b8" strokeWidth="1" />
             <ellipse cx="0" cy="20" rx="12" ry="15" fill="#ef4444" opacity="0.8" />
          </g>
        );
      case 'acc_5': // Guitar
        return (
           <g transform="translate(70, 50) rotate(-15)">
              <path d="M0 0 L30 0" stroke="#78350f" strokeWidth="4" /> {/* Neck */}
              <circle cx="35" cy="0" r="10" fill="#b45309" /> {/* Body */}
           </g>
        );
      case 'acc_6': // Trumpet
        return (
           <g transform="translate(75, 60)">
              <path d="M0 0 L20 -5 L25 -10" fill="none" stroke="#eab308" strokeWidth="4" />
              <circle cx="25" cy="-10" r="5" fill="#eab308" />
           </g>
        );
      case 'acc_7': // Mic
        return (
           <g transform="translate(80, 50)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#374151" strokeWidth="2" />
              <circle cx="0" cy="-2" r="4" fill="#1f2937" />
           </g>
        );
      case 'acc_8': // Diamond
        return (
           <g transform="translate(85, 60)">
              <path d="M0 0 L5 5 L0 10 L-5 5 Z" fill="#38bdf8" opacity="0.8" />
              <path d="M-5 5 L5 5" stroke="#bae6fd" strokeWidth="0.5" />
           </g>
        );
      case 'acc_9': // Lollipop
        return (
           <g transform="translate(80, 50) rotate(10)">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#fff" strokeWidth="2" />
              <circle cx="0" cy="-5" r="8" fill="#ec4899" />
              <path d="M-4 -5 Q0 -9 4 -5" fill="none" stroke="#fff" strokeWidth="1" />
           </g>
        );
      default: return null;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`drop-shadow-xl ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Layers (Back of accessories) */}
      
      <LemonBody />
      <PantsLayer />
      <ShirtLayer />
      <Face />
      <GlassesLayer />
      <HatLayer />
      <AccessoryLayer />
    </svg>
  );
};

export default LemonAvatar;
