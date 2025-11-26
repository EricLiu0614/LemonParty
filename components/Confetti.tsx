
import React, { useEffect, useState, useRef } from 'react';
import { Particle } from '../types';

interface ConfettiProps {
  trigger: { x: number; y: number; type: 'success' | 'explosion' } | null;
}

const SUCCESS_COLORS = ['#fef08a', '#fde047', '#eab308', '#84cc16', '#bef264', '#f97316', '#ffffff'];
const EXPLOSION_COLORS = ['#ef4444', '#b91c1c', '#f87171', '#000000', '#fb923c', '#7f1d1d'];

const Confetti: React.FC<ConfettiProps> = ({ trigger }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (trigger) {
      const isExplosion = trigger.type === 'explosion';
      const colors = isExplosion ? EXPLOSION_COLORS : SUCCESS_COLORS;
      const count = isExplosion ? 60 : 30;
      const speedMultiplier = isExplosion ? 2.5 : 1;

      // Spawn particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Random spread, but weighted upwards for confetti
        const speed = (Math.random() * 8 + 4) * speedMultiplier; 
        
        newParticles.push({
          id: Date.now() + i + Math.random(),
          x: trigger.x,
          y: trigger.y,
          color: colors[Math.floor(Math.random() * colors.length)],
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
          },
          life: 1.0,
          size: Math.random() * 8 + 4
        });
      }
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [trigger]);

  const animate = () => {
    setParticles(prevParticles => {
      if (prevParticles.length === 0) return [];

      return prevParticles
        .map(p => ({
          ...p,
          x: p.x + p.velocity.x,
          y: p.y + p.velocity.y + 0.3, // Gravity
          velocity: {
            x: p.velocity.x * 0.96, // Friction
            y: p.velocity.y * 0.96
          },
          life: p.life - 0.015
        }))
        .filter(p => p.life > 0);
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full shadow-sm"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.life,
            transform: `scale(${p.life})`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
