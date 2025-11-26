
export type CardCategory = 'fruit' | 'mine' | 'powerup';
export type PowerupType = 'time' | 'auto-match' | 'reveal';

export interface CardType {
  id: number;
  content: string; // Emoji or Image URL
  type: CardCategory;
  powerupType?: PowerupType;
  isFlipped: boolean;
  isMatched: boolean;
  isPeeking?: boolean; // For skill effect
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  life: number;
  size: number;
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  WON_GAME = 'WON_GAME',
  GAME_OVER = 'GAME_OVER'
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: number;
}

export interface LevelConfig {
  level: number;
  rows: number;
  cols: number;
  timeLimit: number;
  mines: number;
  powerups: PowerupType[];
}
