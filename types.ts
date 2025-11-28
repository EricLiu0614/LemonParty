
export type CardCategory = 'fruit' | 'mine' | 'powerup';
export type PowerupType = 'time' | 'auto-match' | 'reveal' | 'clear-4';

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
  GAME_OVER = 'GAME_OVER',
  SHOP = 'SHOP',
  DAILY_SPIN = 'DAILY_SPIN',
  WARDROBE = 'WARDROBE',
  MINIGAME_MENU = 'MINIGAME_MENU',
  MINIGAME_PLAYING = 'MINIGAME_PLAYING'
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

export interface Inventory {
  reveal: number;
  time: number;
  clear4: number;
}

export type FashionType = 'hat' | 'glasses' | 'shirt' | 'pants' | 'accessory';

export interface FashionItem {
  id: string;
  type: FashionType;
  name: string;
  icon: string; // Emoji
  price: number;
}

export interface UserProfile {
  coins: number;
  inventory: Inventory;
  lastSpinDate: string | null; // YYYY-MM-DD
  lastMinigameDate: string | null; // YYYY-MM-DD
  ownedFashion: string[]; // List of item IDs
  equippedFashion: {
    hat?: string;
    glasses?: string;
    shirt?: string;
    pants?: string;
    accessory?: string;
  };
}

export interface WordQuestion {
  id: number;
  word: string;
  options: string[];
  correctIndex: number;
}
