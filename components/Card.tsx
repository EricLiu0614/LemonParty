
import React from 'react';
import { CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick: (card: CardType) => void;
  disabled: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched && !card.isPeeking) {
      onClick(card);
    }
  };

  const showFace = card.isFlipped || card.isPeeking;
  
  // Visual Styles
  const isMine = card.type === 'mine';
  const isPowerup = card.type === 'powerup';

  let borderColor = 'border-yellow-300';
  let bgColor = 'bg-white';
  
  if (isMine) {
    borderColor = 'border-red-500';
    bgColor = 'bg-red-50';
  } else if (isPowerup) {
    borderColor = 'border-purple-400';
    bgColor = 'bg-purple-50';
  }

  return (
    <div 
      className={`relative w-full aspect-square perspective-1000 cursor-pointer group ${card.isMatched ? 'animate-match-success' : ''}`}
      onClick={handleClick}
    >
      <div
        className={`w-full h-full duration-500 transform-style-3d transition-transform ${
          showFace ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Face (Hidden initially) */}
        <div 
          className={`absolute w-full h-full rounded-2xl shadow-xl flex items-center justify-center backface-hidden rotate-y-180 border-4 ${borderColor} ${bgColor}`}
        >
          <span className="text-4xl md:text-5xl select-none filter drop-shadow-md transform transition-transform group-hover:scale-110">
            {card.content}
          </span>
          {isMine && <div className="absolute inset-0 bg-red-500/10 rounded-xl animate-pulse" />}
          {isPowerup && <div className="absolute inset-0 bg-purple-500/10 rounded-xl animate-pulse" />}
        </div>

        {/* Back Face (Visible initially) */}
        <div 
          className="absolute w-full h-full bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-md backface-hidden flex items-center justify-center border-2 border-yellow-200"
        >
          {/* Decorative pattern on back */}
          <div className="w-1/2 h-1/2 bg-white/20 rounded-full animate-pulse" />
          <span className="absolute text-yellow-100/50 text-2xl font-bold">L</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
