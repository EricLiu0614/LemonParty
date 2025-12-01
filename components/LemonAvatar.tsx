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

// Helper to get colors based on skin ID
const getSkinColor = (skinId?: string) => {
  switch (skinId) {
    case 'skin_1': return { fill: '#a3e635', stroke: '#65a30d', highlight: '#d9f99d', dot: '#4d7c0f' }; // Lime (Green)
    case 'skin_2': return { fill: '#f87171', stroke: '#dc2626', highlight: '#fca5a5', dot: '#991b1b' }; // Red (Grapefruit)
    case 'skin_3': return { fill: '#60a5fa', stroke: '#2563eb', highlight: '#93c5fd', dot: '#1e40af' }; // Blue (Berry)
    case 'skin_4': return { fill: '#c084fc', stroke: '#9333ea', highlight: '#e9d5ff', dot: '#6b21a8' }; // Purple (Mystic)
    case 'skin_5': return { fill: '#fb923c', stroke: '#ea580c', highlight: '#fdba74', dot: '#9a3412' }; // Orange
    case 'skin_6': return { fill: '#e2e8f0', stroke: '#94a3b8', highlight: '#f1f5f9', dot: '#475569' }; // Ghost (White/Grey)
    case 'skin_7': return { fill: '#14b8a6', stroke: '#0d9488', highlight: '#5eead4', dot: '#0f766e' }; // Teal
    case 'skin_8': return { fill: '#f472b6', stroke: '#db2777', highlight: '#fbcfe8', dot: '#be185d' }; // Pink
    case 'skin_default': // Default Yellow
    default: 
      return { fill: '#FDE047', stroke: '#EAB308', highlight: '#FEF9C3', dot: '#CA8A04' };
  }
};

export const LemonAvatar: React.FC<LemonAvatarProps> = ({ 
  equippedItems, 
  size = 200, 
  className = "",
  emotion = 'happy'
}) => {
  
  const { hat, glasses, shirt, pants, accessory, skin } = equippedItems;
  const colors = getSkinColor(skin);

  // Base Lemon Dimensions: cx=50, cy=55, rx=38, ry=32
  // Top y ~ 23, Bottom y ~ 87, Left x ~ 12, Right x ~ 88

  // --- 1. Body & Face ---

  const LemonBody = () => (
    <g>
      {/* Main Body */}
      <ellipse cx="50" cy="55" rx="38" ry="32" fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" />
      {/* Highlight */}
      <ellipse cx="35" cy="40" rx="10" ry="5" fill={colors.highlight} opacity="0.6" transform="rotate(-20 35 40)" />
      {/* Texture Dots */}
      <circle cx="25" cy="60" r="0.8" fill={colors.dot} opacity="0.2" />
      <circle cx="75" cy="65" r="0.8" fill={colors.dot} opacity="0.2" />
      <circle cx="50" cy="80" r="0.8" fill={colors.dot} opacity="0.2" />
      <circle cx="65" cy="45" r="0.6" fill={colors.dot} opacity="0.2" />
    </g>
  );

  const Face = () => {
    // Eyes (y=50)
    const renderEyes = () => {
      if (emotion === 'dead') {
        return (
          <g stroke="#451a03" strokeWidth="2" strokeLinecap="round">
            <path d="M35 48 L45 52 M45 48 L35 52" /> 
            <path d="M55 48 L65 52 M65 48 L55 52" /> 
          </g>
        );
      }
      // Standard Eyes
      return (
        <g fill="#451a03">
          <circle cx="40" cy="50" r={emotion === 'cool' ? 0 : 3.5} />
          <circle cx="60" cy="50" r={emotion === 'cool' ? 0 : 3.5} />
        </g>
      );
    };

    // Mouth (y=65)
    const renderMouth = () => {
      if (emotion === 'happy') return <path d="M40 62 Q50 72 60 62" fill="none" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />;
      if (emotion === 'sad') return <path d="M40 68 Q50 58 60 68" fill="none" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />;
      if (emotion === 'cool') return <path d="M42 65 Q50 68 58 65" fill="none" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />;
      if (emotion === 'neutral') return <path d="M43 65 L57 65" fill="none" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />;
      return <path d="M45 65 L55 65" fill="none" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />;
    };

    return (
      <g>
        {renderEyes()}
        <g transform="translate(0, 2)">{renderMouth()}</g>
      </g>
    );
  };

  // --- 2. Clothing (Shirts) ---
  // Shirts should wrap around the lower half of the lemon ellipse

  const ShirtLayer = () => {
    // Clip path for shirts to stay inside lemon body
    return (
      <g>
        <defs>
          <clipPath id="lemon-body-clip">
            <ellipse cx="50" cy="55" rx="37" ry="31" /> {/* Slightly smaller to avoid hiding border */}
          </clipPath>
        </defs>
        <g clipPath="url(#lemon-body-clip)">
          {(() => {
            switch (shirt) {
              case 'shirt_1': // Blue Tee
                return (
                  <path d="M10 55 Q50 55 90 55 L90 90 L10 90 Z" fill="#3b82f6" opacity="0.9" />
                );
              case 'shirt_2': // Suit
                return (
                  <g>
                    <path d="M10 55 Q50 55 90 55 L90 90 L10 90 Z" fill="#1e293b" />
                    <path d="M50 55 L50 90" stroke="#fff" strokeWidth="0.5" opacity="0.2" />
                    <path d="M50 55 L40 65 L50 75 L60 65 Z" fill="#fff" /> {/* Shirt front */}
                    <path d="M50 65 L45 80 L55 80 Z" fill="#dc2626" /> {/* Tie */}
                  </g>
                );
              case 'shirt_3': // Dress
                return (
                   <g>
                     <path d="M10 55 Q50 55 90 55 L90 90 L10 90 Z" fill="#ec4899" />
                     <path d="M10 55 Q50 65 90 55" fill="none" stroke="#db2777" strokeWidth="2" strokeDasharray="4 4" />
                     <circle cx="50" cy="75" r="2" fill="#fff" opacity="0.5" />
                     <circle cx="35" cy="70" r="2" fill="#fff" opacity="0.5" />
                     <circle cx="65" cy="70" r="2" fill="#fff" opacity="0.5" />
                   </g>
                );
              case 'shirt_4': // Kimono
                return (
                  <g>
                     <path d="M10 55 Q50 55 90 55 L90 90 L10 90 Z" fill="#fcd34d" />
                     <path d="M50 55 L30 90" stroke="#f87171" strokeWidth="3" />
                     <path d="M50 55 L70 90" stroke="#f87171" strokeWidth="3" />
                  </g>
                );
              case 'shirt_5': // Vest
                return (
                  <g>
                    <path d="M10 55 Q50 55 90 55 L90 90 L10 90 Z" fill="#f97316" />
                    <rect x="48" y="55" width="4" height="35" fill="#fff" opacity="0.3" />
                    <circle cx="45" cy="65" r="1.5" fill="#7c2d12" />
                    <circle cx="45" cy="75" r="1.5" fill="#7c2d12" />
                  </g>
                );
              case 'shirt_6': // Lab Coat
                return (
                  <g>
                    <path d="M10 55 Q50 55 90 55 L90 90 L10 90 Z" fill="#f1f5f9" />
                    <path d="M50 55 L50 90" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M50 55 L40 65" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M50 55 L60 65" stroke="#cbd5e1" strokeWidth="1" />
                    <rect x="60" y="70" width="15" height="10" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
                  </g>
                );
              case 'shirt_7': // Bikini (Top only usually, but here simple strap)
                return (
                   <g>
                     <path d="M30 65 Q35 80 50 80 Q65 80 70 65" fill="none" stroke="#ec4899" strokeWidth="3" />
                     <circle cx="30" cy="65" r="6" fill="#ec4899" />
                     <circle cx="70" cy="65" r="6" fill="#ec4899" />
                   </g>
                );
              default: return null;
            }
          })()}
        </g>
      </g>
    );
  };

  // --- 3. Pants / Shoes ---
  // Since lemon has no legs, we render these as cute little feet/shoes at the bottom
  
  const PantsLayer = () => {
    switch (pants) {
      case 'pants_1': // Blue Sneakers
        return (
          <g transform="translate(0, 82)">
            <ellipse cx="40" cy="0" rx="6" ry="4" fill="#2563eb" />
            <ellipse cx="60" cy="0" rx="6" ry="4" fill="#2563eb" />
            <path d="M36 -2 L44 -2" stroke="#fff" strokeWidth="1" />
            <path d="M56 -2 L64 -2" stroke="#fff" strokeWidth="1" />
          </g>
        );
      case 'pants_2': // Green Boots
        return (
          <g transform="translate(0, 82)">
             <rect x="34" y="-4" width="12" height="8" rx="2" fill="#16a34a" />
             <rect x="54" y="-4" width="12" height="8" rx="2" fill="#16a34a" />
          </g>
        );
      default: return null;
    }
  };

  // --- 4. Hats ---
  // Positioned on top of head (y ~ 23)

  const HatLayer = () => {
    switch (hat) {
      case 'hat_1': // Top Hat
        return (
          <g transform="translate(50, 25)">
            <rect x="-20" y="0" width="40" height="4" fill="#1e293b" rx="1" /> {/* Brim */}
            <rect x="-14" y="-25" width="28" height="25" fill="#1e293b" /> {/* Top */}
            <rect x="-14" y="-6" width="28" height="4" fill="#dc2626" /> {/* Band */}
          </g>
        );
      case 'hat_2': // Cap
        return (
          <g transform="translate(50, 28)">
             <path d="M-18 0 Q0 -15 18 0" fill="#3b82f6" />
             <path d="M15 -2 L25 2 L15 4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" /> {/* Visor */}
             <circle cx="0" cy="-15" r="2" fill="#1d4ed8" />
          </g>
        );
      case 'hat_3': // Crown
        return (
          <g transform="translate(50, 25)">
            <path d="M-15 0 L-15 -12 L-5 -6 L0 -14 L5 -6 L15 -12 L15 0 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <circle cx="-15" cy="-12" r="2" fill="#ef4444" />
            <circle cx="0" cy="-14" r="2" fill="#3b82f6" />
            <circle cx="15" cy="-12" r="2" fill="#ef4444" />
          </g>
        );
      case 'hat_4': // Sun Hat
        return (
          <g transform="translate(50, 28)">
            <ellipse cx="0" cy="0" rx="25" ry="6" fill="#fde047" stroke="#d97706" strokeWidth="1" />
            <path d="M-12 0 Q0 -15 12 0" fill="#fde047" stroke="#d97706" strokeWidth="1" />
            <path d="M-12 0 Q0 -2 12 0" fill="none" stroke="#ef4444" strokeWidth="2" />
          </g>
        );
      case 'hat_5': // Grad Cap
        return (
          <g transform="translate(50, 22)">
            <path d="M0 -10 L-20 0 L0 10 L20 0 Z" fill="#1e293b" />
            <path d="M20 0 L20 15" stroke="#facc15" strokeWidth="1.5" />
            <circle cx="20" cy="15" r="1.5" fill="#facc15" />
          </g>
        );
      case 'hat_6': // Headphones
        return (
          <g>
            <path d="M20 50 Q20 15 80 50" fill="none" stroke="#333" strokeWidth="3" />
            <rect x="12" y="40" width="10" height="20" rx="3" fill="#ef4444" />
            <rect x="78" y="40" width="10" height="20" rx="3" fill="#ef4444" />
          </g>
        );
      case 'hat_7': // Viking Helmet
        return (
           <g transform="translate(50, 28)">
             <path d="M-18 0 Q0 -15 18 0" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
             <path d="M-18 0 L-25 -10" stroke="#fff" strokeWidth="3" />
             <path d="M18 0 L25 -10" stroke="#fff" strokeWidth="3" />
           </g>
        );
      default: return null;
    }
  };

  // --- 5. Glasses ---
  // Centered at y=50, x=50

  const GlassesLayer = () => {
    switch (glasses) {
      case 'glasses_1': // Cool Shades
        return (
          <g transform="translate(50, 50)">
            <path d="M-20 -5 L20 -5 L18 8 L5 8 L2 2 L-2 2 L-5 8 L-18 8 Z" fill="#111827" />
            <line x1="-20" y1="-4" x2="20" y2="-4" stroke="#111827" strokeWidth="2" />
          </g>
        );
      case 'glasses_2': // Nerd Specs
        return (
          <g transform="translate(50, 50)">
            <circle cx="-10" cy="0" r="8" fill="#fff" fillOpacity="0.3" stroke="#000" strokeWidth="2" />
            <circle cx="10" cy="0" r="8" fill="#fff" fillOpacity="0.3" stroke="#000" strokeWidth="2" />
            <line x1="-2" y1="0" x2="2" y2="0" stroke="#000" strokeWidth="2" />
          </g>
        );
      case 'glasses_3': // 3D Glasses
        return (
          <g transform="translate(50, 50)">
             <rect x="-22" y="-6" width="20" height="12" fill="none" stroke="#ef4444" strokeWidth="2" rx="2" />
             <rect x="2" y="-6" width="20" height="12" fill="none" stroke="#3b82f6" strokeWidth="2" rx="2" />
             <line x1="-2" y1="-6" x2="2" y2="-6" stroke="#000" strokeWidth="2" />
             <rect x="-22" y="-6" width="20" height="12" fill="#ef4444" opacity="0.3" rx="2" />
             <rect x="2" y="-6" width="20" height="12" fill="#3b82f6" opacity="0.3" rx="2" />
          </g>
        );
      default: return null;
    }
  };

  // --- 6. Accessories ---
  // Floating around the lemon

  const AccessoryLayer = () => {
    switch (accessory) {
      case 'acc_1': // Purse (Left)
        return (
          <g transform="translate(15, 60)">
             <path d="M0 0 Q5 -10 10 0" fill="none" stroke="#a16207" strokeWidth="1.5" />
             <rect x="0" y="0" width="14" height="10" rx="2" fill="#facc15" stroke="#a16207" strokeWidth="1" />
          </g>
        );
      case 'acc_2': // Scarf
        return (
          <path d="M25 75 Q50 85 75 75" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
        );
      case 'acc_3': // Ribbon (Top Right)
        return (
           <g transform="translate(75, 30) rotate(15)">
             <path d="M0 0 L8 8 L0 16 L-4 8 Z" fill="#ec4899" />
             <path d="M0 8 L-8 0 L-16 8 L-8 16 Z" fill="#ec4899" />
             <circle cx="0" cy="8" r="2.5" fill="#fbcfe8" />
           </g>
        );
      case 'acc_4': // Balloon (Right floating)
        return (
          <g transform="translate(85, 30)">
             <line x1="0" y1="30" x2="-5" y2="50" stroke="#94a3b8" strokeWidth="1" />
             <ellipse cx="0" cy="15" rx="10" ry="12" fill="#ef4444" opacity="0.9" />
             <path d="M-3 10 Q0 5 3 10" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
          </g>
        );
      case 'acc_5': // Guitar (Across body)
        return (
           <g transform="translate(75, 65) rotate(-20)">
              <rect x="-5" y="-20" width="4" height="30" fill="#78350f" />
              <circle cx="0" cy="10" r="12" fill="#ea580c" />
              <circle cx="0" cy="10" r="4" fill="#3f1605" />
           </g>
        );
      case 'acc_6': // Trumpet (Right)
        return (
           <g transform="translate(80, 55) rotate(-10)">
              <path d="M0 0 L15 -5 L20 -10" fill="none" stroke="#eab308" strokeWidth="3" />
              <circle cx="20" cy="-10" r="4" fill="#eab308" />
           </g>
        );
      case 'acc_7': // Mic (Right)
        return (
           <g transform="translate(80, 60)">
              <line x1="0" y1="0" x2="0" y2="15" stroke="#374151" strokeWidth="2" />
              <circle cx="0" cy="-2" r="3.5" fill="#1f2937" />
              <path d="M-2 -4 L2 -4 M-2 -2 L2 -2 M-2 0 L2 0" stroke="#4b5563" strokeWidth="0.5" />
           </g>
        );
      case 'acc_8': // Diamond (Floating Top Left)
        return (
           <g transform="translate(20, 30) rotate(-10)">
              <path d="M0 0 L6 6 L0 12 L-6 6 Z" fill="#38bdf8" opacity="0.8" />
              <path d="M-6 6 L6 6" stroke="#e0f2fe" strokeWidth="0.5" />
              <path d="M0 0 L0 12" stroke="#e0f2fe" strokeWidth="0.5" />
           </g>
        );
      case 'acc_9': // Lollipop (Right)
        return (
           <g transform="translate(80, 55) rotate(10)">
              <line x1="0" y1="0" x2="0" y2="15" stroke="#fff" strokeWidth="2" />
              <circle cx="0" cy="-5" r="6" fill="#ec4899" />
              <path d="M-3 -5 Q0 -8 3 -5" fill="none" stroke="#fff" strokeWidth="1" />
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
      className={`drop-shadow-lg ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* Render Order: Pants (Shoes) -> Body -> Shirt -> Face -> Glasses -> Hat -> Accessory */}
      
      <PantsLayer />
      <LemonBody />
      <ShirtLayer />
      <Face />
      <GlassesLayer />
      <HatLayer />
      <AccessoryLayer />
    </svg>
  );
};

export default LemonAvatar;
