
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
  MINIGAME_PLAYING = 'MINIGAME_PLAYING',
  CHAT = 'CHAT',
  ISLAND = 'ISLAND',
  VOCAB_STUDY = 'VOCAB_STUDY',
}

// ---- Vocabulary Study types ----

export interface VocabWord {
  id: number;
  word: string;
  translation: string;
}

export interface VocabMasteryEntry {
  word: string;
  translation: string;
  attempts: number;
  correct: number;
  lastTested: string;
  history: Array<{ date: string; sessionId: string; correct: boolean; submitted: string }>;
}

export type VocabMasteryMap = Record<string, VocabMasteryEntry>;

export type VocabMasteryLevel = 'mastered' | 'needs_review' | 'weak' | 'untested';

export interface VocabGradeResult {
  word: VocabWord;
  submitted: string;
  grade: 'correct' | 'close' | 'wrong';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
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

export type FashionType = 'hat' | 'glasses' | 'shirt' | 'pants' | 'accessory' | 'skin';

export interface FashionItem {
  id: string;
  type: FashionType;
  name: string;
  icon: string; // Emoji
  price: number;
  color?: string; // For skin items
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
    skin?: string;
  };
}

export interface WordQuestion {
  id: number;
  word: string;
  options: string[];
  correctIndex: number;
}
