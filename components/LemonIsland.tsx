import React, { useState, useEffect, useRef } from 'react';
import { LemonAvatar } from './LemonAvatar';
import { UserProfile } from '../types';
import { ShoppingCart, Shirt, Play, MessageCircle, BookOpen, Gift, MapPin } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Building {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: React.ReactNode;
  triggerRange: number;
  imageSrc?: string;
  scale?: number;
}

interface LemonIslandProps {
  profile: UserProfile;
  onEnterBuilding: (buildingId: string) => void;
}

export const LemonIsland: React.FC<LemonIslandProps> = ({ profile, onEnterBuilding }) => {
  const [playerPos, setPlayerPos] = useState<Point>({ x: 300, y: 500 }); // Center
  const [targetPos, setTargetPos] = useState<Point | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [nearbyBuilding, setNearbyBuilding] = useState<Building | null>(null);
  
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const speed = 0.3; // Faster movement

  // --- ASSETS & MAP DATA (Vertical Layout 600x1000) ---

  const buildings: Building[] = [
    { id: 'game', name: 'Adventure', x: 300, y: 180, width: 140, height: 140, color: '#4ade80', icon: <Play size={40} color="#fff"/>, triggerRange: 110, imageSrc: '/building-game.png', scale: 1 },
    { id: 'shop', name: 'Market', x: 120, y: 380, width: 120, height: 100, color: '#c084fc', icon: <ShoppingCart size={35} color="#fff"/>, triggerRange: 90, imageSrc: '/building-shop.png', scale: 1.1 },
    { id: 'style', name: 'Wardrobe', x: 480, y: 380, width: 120, height: 100, color: '#f472b6', icon: <Shirt size={35} color="#fff"/>, triggerRange: 90, imageSrc: '/building-style.png', scale: 1.1 },
    { id: 'quiz', name: 'Academy', x: 150, y: 650, width: 130, height: 110, color: '#60a5fa', icon: <BookOpen size={35} color="#fff"/>, triggerRange: 90, imageSrc: '/building-quiz.png', scale: 1.1 },
    { id: 'spin', name: 'Lucky Spot', x: 450, y: 650, width: 130, height: 110, color: '#fbbf24', icon: <Gift size={35} color="#fff"/>, triggerRange: 90, imageSrc: '/building-spin.png', scale: 1.1 },
    { id: 'chat', name: 'Lounge', x: 300, y: 850, width: 140, height: 80, color: '#fb923c', icon: <MessageCircle size={35} color="#fff"/>, triggerRange: 90, imageSrc: '/building-chat.png', scale: 1 },
  ];

  const trees = [
    { x: 50, y: 100, scale: 1 }, { x: 550, y: 120, scale: 1.1 }, 
    { x: 50, y: 900, scale: 1.2 }, { x: 550, y: 850, scale: 1 },
    { x: 100, y: 500, scale: 0.8 }, { x: 500, y: 500, scale: 0.8 }
  ];

  const clouds = [
    { x: 100, y: 100, speed: 10 }, { x: 500, y: 300, speed: 15 }, { x: 300, y: 600, speed: 8 }
  ];

  // --- ANIMATION LOOP ---

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined && targetPos) {
      const deltaTime = time - lastTimeRef.current;
      
      setPlayerPos(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          setTargetPos(null);
          setIsMoving(false);
          return targetPos;
        }

        const moveDist = speed * deltaTime;
        const ratio = moveDist / distance;
        
        return {
          x: prev.x + dx * ratio,
          y: prev.y + dy * ratio
        };
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetPos]);

  // Check Triggers
  useEffect(() => {
    let found: Building | null = null;
    for (const b of buildings) {
      const dx = playerPos.x - b.x;
      const dy = playerPos.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < b.triggerRange) {
        found = b;
        break;
      }
    }
    setNearbyBuilding(found);
  }, [playerPos]);

  // Handle interactions
  const handleMapInteraction = (clientX: number, clientY: number, svg: SVGSVGElement) => {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    
    try {
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const svgPoint = point.matrixTransform(ctm.inverse());
        // Ensure point is within bounds (optional, but good for safety)
        // const safeX = Math.max(0, Math.min(600, svgPoint.x));
        // const safeY = Math.max(0, Math.min(1000, svgPoint.y));
        setTargetPos({ x: svgPoint.x, y: svgPoint.y });
        setIsMoving(true);
      }
    } catch (e) {
      console.warn("SVG point transform failed", e);
    }
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    handleMapInteraction(e.clientX, e.clientY, e.currentTarget);
  };

  const handleMapTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.changedTouches[0];
    handleMapInteraction(touch.clientX, touch.clientY, e.currentTarget);
  };

  // --- COMPONENTS ---

  const BuildingNode = ({ b, isActive }: { b: Building, isActive: boolean }) => (
    <g transform={`translate(${b.x}, ${b.y})`}>
      {/* Range Ring */}
      {isActive && (
         <circle r={b.triggerRange} fill="white" stroke={b.color} strokeWidth="2" strokeDasharray="5 5" opacity="0.3" className="animate-spin-slow" />
      )}
      
      {/* Shadow */}
      <ellipse cx="0" cy={b.height/2} rx={b.width/2} ry={12} fill="#000" opacity="0.15" />
      
      {b.imageSrc ? (
        <image 
          href={b.imageSrc} 
          x={-(b.width * (b.scale || 1)) / 2} 
          y={-(b.height * (b.scale || 1)) / 2 - 10}
          width={b.width * (b.scale || 1)} 
          height={b.height * (b.scale || 1)} 
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <rect width={b.width} height={b.height} x={-b.width/2} y={-b.height/2} fill={b.color} />
      )}

      {/* Label */}
      <g transform={`translate(0, ${b.height/2 + 35})`}>
        <rect x="-50" y="-12" width="100" height="24" rx="12" fill="white" stroke={b.color} strokeWidth="2" />
        <text y="5" textAnchor="middle" fontSize="12" fontWeight="bold" fill={b.color} fontFamily="sans-serif">
          {b.name}
        </text>
      </g>
    </g>
  );

  const PalmTree = ({ x, y, scale }: { x: number, y: number, scale: number }) => (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
       <ellipse cx="0" cy="5" rx="15" ry="5" fill="#000" opacity="0.1" />
       <path d="M-2 0 Q0 -20 5 -40 L-5 -40 Q-5 -20 -2 0" fill="#854d0e" />
       <g transform="translate(0, -40)">
          <path d="M0 0 Q20 -20 30 0 Q20 10 0 0" fill="#4ade80" stroke="#166534" strokeWidth="1" />
          <path d="M0 0 Q-20 -20 -30 0 Q-20 10 0 0" fill="#4ade80" stroke="#166534" strokeWidth="1" />
          <path d="M0 0 Q10 -30 0 -40 Q-10 -30 0 0" fill="#4ade80" stroke="#166534" strokeWidth="1" />
       </g>
    </g>
  );

  return (
    <div className="w-full h-full bg-[#0ea5e9] relative overflow-hidden select-none">
      
      {/* Ocean Waves */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iIzM4YmRmOCIgZmlsbC1vcGFjaXR5PSIwLjIiIGQ9Ik0wLDIyNEw0OCwyMTMuM0M5NiwyMDMsMTkyLDE4MSwyODgsMTgxLjNDMzg0LDE4MSw0ODAsMjAzLDU3NiwyMjRDNjcyLDI0NSw3NjgsMjY3LDg2NCwyNTZDOTYwLDI0NSwxMDU2LDIwMywxMTUyLDE5MkMxMjQ4LDE4MSwxMzQ0LDIwMywxMzkyLDIxM0wxNDQwLDIyNEwxNDQwLDMyMEwxMzkyLDMyMEMxMzQ0LDMyMCwxMjQ4LDMyMCwxMTUyLDMyMEMxMDU2LDMyMCw5NjAsMzIwLDg2NCwzMjBDNzY4LDMyMCw2NzIsMzIwLDU3NiwzMjBDNDgwLDMyMCwzODQsMzIwLDI4OCwzMjBAMTkyLDMyMCw5NiwzMjAsNDgsMzIwTDAsMzIwWiI+PC9wYXRoPjwvc3ZnPg==')] opacity-30 animate-pulse bg-bottom bg-repeat-x fixed h-full w-full pointer-events-none"></div>

      <svg 
        viewBox="0 0 600 1000" 
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full z-10"
        onClick={handleMapClick}
        onTouchEnd={handleMapTouch}
        style={{ cursor: isMoving ? 'grabbing' : 'pointer' }}
      >
        {/* Base */}
        <image href="/island-map.png" x="0" y="0" width="600" height="1000" preserveAspectRatio="none" />

        {/* Objects */}
        {trees.map((t, i) => <PalmTree key={i} {...t} />)}
        {buildings.map(b => (
          <BuildingNode key={b.id} b={b} isActive={nearbyBuilding?.id === b.id} />
        ))}

        {/* Marker */}
        {targetPos && (
           <g transform={`translate(${targetPos.x}, ${targetPos.y})`}>
              <ellipse cx="0" cy="0" rx="10" ry="5" fill="#fff" opacity="0.5" className="animate-ping" />
              <path d="M0 0 L-5 -10 L5 -10 Z" fill="#ef4444" className="animate-bounce" />
           </g>
        )}

        {/* Avatar */}
        <g 
          transform={`translate(${playerPos.x}, ${playerPos.y})`} 
          style={{ transition: 'transform 0.05s linear' }} 
        >
           <ellipse cx="0" cy="15" rx="20" ry="6" fill="#000" opacity="0.2" /> 
           <foreignObject x="-40" y="-70" width="80" height="80" style={{ pointerEvents: 'none' }}>
              <div className={`w-full h-full transition-transform ${isMoving ? 'animate-dance scale-110' : ''}`}>
                <LemonAvatar equippedItems={profile.equippedFashion} size={80} emotion={isMoving ? 'happy' : 'neutral'} />
              </div>
           </foreignObject>
           <g transform="translate(0, 35)">
             <rect x="-25" y="-10" width="50" height="16" rx="8" fill="rgba(0,0,0,0.4)" />
             <text y="2" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">YOU</text>
           </g>
        </g>

        {/* Clouds */}
        {clouds.map((c, i) => (
          <g key={i} opacity="0.8" style={{ animation: `float ${c.speed}s infinite linear alternate` }}>
             <path d={`M${c.x} ${c.y} Q${c.x+20} ${c.y-20} ${c.x+40} ${c.y} Q${c.x+60} ${c.y-20} ${c.x+80} ${c.y} Q${c.x+40} ${c.y+20} ${c.x} ${c.y}`} fill="white" />
          </g>
        ))}
        
        <rect x="0" y="0" width="600" height="1000" fill="#fff" opacity="0" />
      </svg>

      {/* UI Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg border-2 border-blue-200 flex items-center gap-3 z-50 pointer-events-none">
         <MapPin className="text-blue-500 animate-bounce" size={20} />
         <span className="font-bold text-blue-800">Lemon Island</span>
      </div>

      {/* Interaction Modal */}
      {nearbyBuilding && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-pop z-50">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onEnterBuilding(nearbyBuilding.id);
             }}
             className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl border-4 border-white flex flex-col items-center gap-1 transform transition hover:scale-105 hover:rotate-1 cursor-pointer pointer-events-auto"
           >
             <span className="text-sm opacity-90 uppercase tracking-wider">Enter</span>
             <span className="text-2xl flex items-center gap-2">{nearbyBuilding.icon} {nearbyBuilding.name}</span>
           </button>
        </div>
      )}
    </div>
  );
};
