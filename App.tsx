
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from './components/Card';
import Confetti from './components/Confetti';
import { CardType, GameState, LeaderboardEntry, LevelConfig, UserProfile, PowerupType, FashionItem, WordQuestion, FashionType } from './types';
import { RefreshCw, Play, Trophy, Sparkles, Eye, AlertTriangle, Timer, Star, Wand2, Clock, ShoppingCart, Coins, Gift, Home, ArrowLeft, Grid2X2, Shirt, BookOpen, Check, X, Calendar, Crown } from 'lucide-react';

// --- GAME CONSTANTS ---

const LEMON_EMOJIS = ['🍋', '🍋', '🍋', '🍋']; 
const OTHER_FRUITS = ['🍊', '🍐', '🍏', '🍎', '🍉', '🍇', '🥝', '🫐', '🍑', '🍒', '🍓', '🍍'];
const MINE_EMOJI = '💣';
const POWERUP_EMOJIS: Record<string, string> = {
  time: '⏰',
  'auto-match': '🪄',
  reveal: '👁️',
  'clear-4': '💥'
};

const LEVELS: LevelConfig[] = [
  { level: 1, cols: 3, rows: 4, timeLimit: 45, mines: 0, powerups: [] },
  { level: 2, cols: 4, rows: 4, timeLimit: 60, mines: 1, powerups: [] },
  { level: 3, cols: 4, rows: 5, timeLimit: 75, mines: 1, powerups: ['time'] },
  { level: 4, cols: 4, rows: 5, timeLimit: 60, mines: 2, powerups: ['auto-match'] },
  { level: 5, cols: 4, rows: 6, timeLimit: 90, mines: 3, powerups: ['time', 'auto-match'] },
];

const SHOP_ITEMS = [
  { id: 'reveal', name: 'X-Ray Specs', icon: <Eye />, price: 50, desc: 'Peek at all cards for 2s' },
  { id: 'time', name: 'Time Potion', icon: <Clock />, price: 50, desc: 'Add 20 seconds' },
  { id: 'clear4', name: 'Mega Wand', icon: <Grid2X2 />, price: 100, desc: 'Remove 4 tiles instantly' },
];

const FASHION_CATALOG: FashionItem[] = [
  // Glasses
  { id: 'glasses_1', type: 'glasses', name: 'Cool Shades', icon: '🕶️', price: 50 },
  { id: 'glasses_2', type: 'glasses', name: 'Nerd Specs', icon: '👓', price: 40 },
  { id: 'glasses_3', type: 'glasses', name: 'Goggles', icon: '🥽', price: 60 },
  
  // Hats
  { id: 'hat_1', type: 'hat', name: 'Top Hat', icon: '🎩', price: 100 },
  { id: 'hat_2', type: 'hat', name: 'Cap', icon: '🧢', price: 60 },
  { id: 'hat_3', type: 'hat', name: 'Crown', icon: '👑', price: 500 },
  { id: 'hat_4', type: 'hat', name: 'Sun Hat', icon: '👒', price: 80 },
  { id: 'hat_5', type: 'hat', name: 'Grad Cap', icon: '🎓', price: 120 },
  { id: 'hat_6', type: 'hat', name: 'Headphones', icon: '🎧', price: 90 },
  { id: 'hat_7', type: 'hat', name: 'Helmet', icon: '⛑️', price: 110 },
  
  // Shirts / Tops
  { id: 'shirt_1', type: 'shirt', name: 'T-Shirt', icon: '👕', price: 80 },
  { id: 'shirt_2', type: 'shirt', name: 'Suit', icon: '👔', price: 150 },
  { id: 'shirt_3', type: 'shirt', name: 'Dress', icon: '👗', price: 200 },
  { id: 'shirt_4', type: 'shirt', name: 'Kimono', icon: '👘', price: 300 },
  { id: 'shirt_5', type: 'shirt', name: 'Vest', icon: '🦺', price: 70 },
  { id: 'shirt_6', type: 'shirt', name: 'Lab Coat', icon: '🥼', price: 180 },
  { id: 'shirt_7', type: 'shirt', name: 'Bikini', icon: '👙', price: 120 },

  // Pants / Bottoms
  { id: 'pants_1', type: 'pants', name: 'Jeans', icon: '👖', price: 90 },
  { id: 'pants_2', type: 'pants', name: 'Shorts', icon: '🩳', price: 60 },
  
  // Accessories
  { id: 'acc_1', type: 'accessory', name: 'Purse', icon: '👜', price: 120 },
  { id: 'acc_2', type: 'accessory', name: 'Scarf', icon: '🧣', price: 70 },
  { id: 'acc_3', type: 'accessory', name: 'Ribbon', icon: '🎀', price: 40 },
  { id: 'acc_4', type: 'accessory', name: 'Balloon', icon: '🎈', price: 30 },
  { id: 'acc_5', type: 'accessory', name: 'Guitar', icon: '🎸', price: 350 },
  { id: 'acc_6', type: 'accessory', name: 'Trumpet', icon: '🎺', price: 150 },
  { id: 'acc_7', type: 'accessory', name: 'Mic', icon: '🎤', price: 200 },
  { id: 'acc_8', type: 'accessory', name: 'Diamond', icon: '💎', price: 1000 },
  { id: 'acc_9', type: 'accessory', name: 'Lollipop', icon: '🍭', price: 25 },
];

const WORD_GAME_DATA: WordQuestion[] = [
  { id: 1, word: 'Apple', options: ['苹果', '香蕉', '橙子'], correctIndex: 0 },
  { id: 2, word: 'School', options: ['医院', '学校', '工厂'], correctIndex: 1 },
  { id: 3, word: 'Teacher', options: ['医生', '工人', '老师'], correctIndex: 2 },
  { id: 4, word: 'Happy', options: ['快乐', '悲伤', '生气'], correctIndex: 0 },
  { id: 5, word: 'Book', options: ['书', '笔', '尺子'], correctIndex: 0 },
  { id: 6, word: 'Computer', options: ['电视', '收音机', '电脑'], correctIndex: 2 },
  { id: 7, word: 'Friend', options: ['敌人', '朋友', '邻居'], correctIndex: 1 },
  { id: 8, word: 'Morning', options: ['早上', '下午', '晚上'], correctIndex: 0 },
  { id: 9, word: 'Yellow', options: ['红色', '蓝色', '黄色'], correctIndex: 2 },
  { id: 10, word: 'Water', options: ['火', '水', '土'], correctIndex: 1 },
];

const DEFAULT_PROFILE: UserProfile = {
  coins: 0,
  inventory: { reveal: 0, time: 0, clear4: 0 },
  lastSpinDate: null,
  lastMinigameDate: null,
  ownedFashion: [],
  equippedFashion: {}
};

// --- SOUND UTILS ---

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playSound = (type: 'pop' | 'match' | 'error' | 'win' | 'explode' | 'tick' | 'magic' | 'coin' | 'equip') => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  switch (type) {
    case 'pop':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'equip':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'match':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.1);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'error':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case 'tick':
      osc.type = 'square';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    case 'magic':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    case 'explode':
      const bufferSize = audioCtx.sampleRate * 0.5;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = audioCtx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      noise.start(now);
      break;
    case 'win':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      osc.frequency.setValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
      break;
    case 'coin':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
  }
};

// --- COMPONENTS ---

const LemonAvatar: React.FC<{ equipped: UserProfile['equippedFashion'], size?: 'sm' | 'md' | 'lg' | 'xl', animate?: boolean }> = ({ equipped, size = 'md', animate = false }) => {
  const sizeClasses = {
    sm: 'text-4xl w-12 h-12',
    md: 'text-6xl w-20 h-20',
    lg: 'text-8xl w-32 h-32',
    xl: 'text-9xl w-40 h-40'
  };

  const getFashion = (id?: string) => FASHION_CATALOG.find(i => i.id === id)?.icon || null;

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses[size]} ${animate ? 'animate-dance' : ''}`}>
      {/* Base */}
      <span className="absolute inset-0 flex items-center justify-center z-10">🍋</span>
      
      {/* Layers */}
      {/* Shirt - Behind/Bottom */}
      {equipped.shirt && <span className="absolute top-[60%] left-1/2 -translate-x-1/2 text-[0.8em] z-20">{getFashion(equipped.shirt)}</span>}
      {/* Pants - Below Shirt */}
      {equipped.pants && <span className="absolute top-[90%] left-1/2 -translate-x-1/2 text-[0.8em] z-20">{getFashion(equipped.pants)}</span>}
      
      {/* Glasses - Middle */}
      {equipped.glasses && <span className="absolute top-[35%] left-1/2 -translate-x-1/2 text-[0.5em] z-30">{getFashion(equipped.glasses)}</span>}
      
      {/* Hat - Top */}
      {equipped.hat && <span className="absolute -top-[30%] left-1/2 -translate-x-1/2 text-[0.7em] z-40">{getFashion(equipped.hat)}</span>}
      
      {/* Accessory - Side */}
      {equipped.accessory && <span className="absolute top-[50%] -right-[30%] text-[0.5em] z-20 rotate-12">{getFashion(equipped.accessory)}</span>}
    </div>
  );
};

const App: React.FC = () => {
  // --- STATE ---
  
  // Game Configuration
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardType[]>([]);
  
  // Gameplay
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [moves, setMoves] = useState(0);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [totalPairsToMatch, setTotalPairsToMatch] = useState(0);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // Visual Effects
  const [isPeeking, setIsPeeking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [explosionTrigger, setExplosionTrigger] = useState<{ x: number, y: number, type: 'success' | 'explosion' } | null>(null);

  // User Data & Leaderboard
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  // Daily Spin State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);

  // Mini Game State
  const [minigameQIdx, setMinigameQIdx] = useState(0);
  const [minigameScore, setMinigameScore] = useState(0);
  const [minigameAnswerStatus, setMinigameAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

  // --- PERSISTENCE ---

  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('lemon-party-leaderboard');
    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));

    const savedProfile = localStorage.getItem('lemon-party-profile-v2'); // bumped version
    if (savedProfile) {
      setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) });
    }
  }, []);

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('lemon-party-profile-v2', JSON.stringify(newProfile));
  };

  const saveScore = () => {
    if (!playerName.trim()) return;
    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: totalScore + moves * 10,
      level: currentLevelIdx + 1,
      date: Date.now()
    };
    const updated = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
    setLeaderboard(updated);
    localStorage.setItem('lemon-party-leaderboard', JSON.stringify(updated));
    setGameState(GameState.IDLE);
  };

  // --- GAME LOGIC ---

  const startLevel = useCallback((levelIdx: number) => {
    const config = LEVELS[levelIdx] || LEVELS[LEVELS.length - 1]; 
    
    // Grid Setup
    const totalCards = config.rows * config.cols;
    const mineCount = config.mines;
    const powerupCount = config.powerups.length;
    const fruitPairsCount = (totalCards - (mineCount * 2) - (powerupCount * 2)) / 2;

    if (fruitPairsCount < 0) {
      console.error("Invalid level config");
      return;
    }

    let deck: CardType[] = [];
    let idCounter = 0;

    // Add Mines
    for (let i = 0; i < mineCount; i++) {
      deck.push({ id: idCounter++, content: MINE_EMOJI, type: 'mine', isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, content: MINE_EMOJI, type: 'mine', isFlipped: false, isMatched: false });
    }

    // Add Powerups (In-grid)
    config.powerups.forEach(pType => {
      deck.push({ id: idCounter++, content: POWERUP_EMOJIS[pType], type: 'powerup', powerupType: pType, isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, content: POWERUP_EMOJIS[pType], type: 'powerup', powerupType: pType, isFlipped: false, isMatched: false });
    });

    // Add Fruits
    const fruits = [...LEMON_EMOJIS.slice(0, 2), ...OTHER_FRUITS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < fruitPairsCount; i++) {
      const fruit = fruits[i % fruits.length];
      deck.push({ id: idCounter++, content: fruit, type: 'fruit', isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, content: fruit, type: 'fruit', isFlipped: false, isMatched: false });
    }

    // Shuffle
    deck = deck.sort(() => 0.5 - Math.random());

    setCards(deck);
    setFlippedCards([]);
    setMatchedPairsCount(0);
    setTotalPairsToMatch(fruitPairsCount + powerupCount);
    setMoves(0);
    setTimeLeft(config.timeLimit);
    setIsPeeking(false);
    setIsShaking(false);
    setExplosionTrigger(null);
    setGameState(GameState.PLAYING);
    setAiMessage("");
    
    if (levelIdx === 0) setTotalScore(0);
    playSound('pop');
  }, []);

  // Timer
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          if (prev <= 31) playSound('tick');
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleTimeOut = () => {
    setGameState(GameState.GAME_OVER);
    playSound('error');
    setAiMessage("Time's up! The lemons have soured.");
  };

  // Card Click
  const handleCardClick = (card: CardType) => {
    if (gameState !== GameState.PLAYING || isPeeking) return;
    if (flippedCards.length >= 2 || flippedCards.some(c => c.id === card.id)) return;

    playSound('pop');
    const newCards = cards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    setFlippedCards(prev => [...prev, card]);
  };

  // Match Checking
  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = flippedCards;

      if (first.content === second.content) {
        if (first.type === 'mine') {
          if (matchedPairsCount < totalPairsToMatch) {
            triggerExplosion();
            return;
          } else {
            handleSuccessMatch(first, second);
          }
        } else if (first.type === 'powerup' && first.powerupType) {
           activatePowerup(first.powerupType);
           handleSuccessMatch(first, second);
        } else {
           handleSuccessMatch(first, second);
        }
      } else {
        playSound('error');
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards]);

  const triggerExplosion = () => {
    setIsShaking(true);
    playSound('explode');
    const rect = document.getElementById('game-grid')?.getBoundingClientRect();
    setExplosionTrigger({ 
      x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2, 
      y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2, 
      type: 'explosion' 
    });
    
    setTimeout(() => {
      setGameState(GameState.GAME_OVER);
      generateEndMessage(false);
    }, 800);
  };

  const handleSuccessMatch = (first: CardType, second: CardType) => {
    playSound('match');
    const rect = document.getElementById('game-grid')?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width/2 : window.innerWidth/2;
    const centerY = rect ? rect.top + rect.height/2 : window.innerHeight/2;
    setExplosionTrigger({ x: centerX, y: centerY, type: 'success' });

    setTimeout(() => {
      setCards(prev => prev.map(c => 
        c.id === first.id || c.id === second.id 
          ? { ...c, isMatched: true, isFlipped: true } 
          : c
      ));
      setMatchedPairsCount(prev => prev + 1);
      setFlippedCards([]);
    }, 200);
    setTimeout(() => setExplosionTrigger(null), 500);
  };

  // --- POWERUP & INVENTORY LOGIC ---

  const activatePowerup = (type: string, fromInventory = false) => {
    playSound('magic');
    
    if (type === 'time') {
      setTimeLeft(t => t + 20);
    } 
    else if (type === 'auto-match' || type === 'clear-4') {
      const pairsToMatch = type === 'clear-4' ? 2 : 1;
      
      setTimeout(() => {
        setCards(currentCards => {
          let available = currentCards.filter(c => !c.isMatched && c.type !== 'mine' && c.type !== 'powerup');
          let matchedCount = 0;
          let newCards = [...currentCards];
          
          for (let i = 0; i < pairsToMatch; i++) {
             if (available.length < 2) break;
             const targetContent = available[0].content;
             const pair = available.filter(c => c.content === targetContent);
             
             if (pair.length === 2) {
               matchedCount++;
               newCards = newCards.map(c => 
                 c.id === pair[0].id || c.id === pair[1].id 
                   ? { ...c, isMatched: true, isFlipped: true } 
                   : c
               );
               available = available.filter(c => c.content !== targetContent);
             }
          }
          
          if (matchedCount > 0) {
             setMatchedPairsCount(c => c + matchedCount);
          }
          return newCards;
        });
      }, 500);
    }
    else if (type === 'reveal') {
       setIsPeeking(true);
       setCards(prev => prev.map(c => ({...c, isPeeking: true})));
       setTimeout(() => {
          setCards(prev => prev.map(c => ({...c, isPeeking: false})));
          setIsPeeking(false);
       }, 2000);
    }

    if (fromInventory) {
      const key = type === 'clear-4' ? 'clear4' : (type === 'auto-match' ? 'autoMatch' : type) as keyof typeof profile.inventory;
      if (profile.inventory[key] && profile.inventory[key] > 0) {
        updateProfile({
          ...profile,
          inventory: {
            ...profile.inventory,
            [key]: profile.inventory[key] - 1
          }
        });
      }
    }
  };

  // --- WIN/LEVEL LOGIC ---

  useEffect(() => {
    if (matchedPairsCount > 0 && matchedPairsCount >= totalPairsToMatch) {
      playSound('win');
      
      // Calc reward
      const timeBonus = timeLeft * 5;
      const levelCoinReward = (currentLevelIdx + 1) * 20; 
      const levelScore = 100 + timeBonus;

      setTotalScore(prev => prev + levelScore);
      
      // Award Coins
      updateProfile({
        ...profile,
        coins: profile.coins + levelCoinReward
      });

      if (currentLevelIdx < LEVELS.length - 1) {
        setTimeout(() => setGameState(GameState.LEVEL_COMPLETE), 1000);
      } else {
        setTimeout(() => {
          setGameState(GameState.WON_GAME);
          generateEndMessage(true);
        }, 1000);
      }
    }
  }, [matchedPairsCount, totalPairsToMatch]);

  const nextLevel = () => {
    const nextIdx = currentLevelIdx + 1;
    setCurrentLevelIdx(nextIdx);
    startLevel(nextIdx);
  };

  const generateEndMessage = async (isWin: boolean) => {
    try {
      if (!process.env.API_KEY) {
        setAiMessage(isWin ? "Ultimate Lemon Champion!" : "Explosive Defeat!");
        return;
      }
      setIsLoadingAi(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = isWin 
        ? `Write a short, funny congratulatory sentence for beating a hard memory game level.`
        : `Write a short, funny roast for stepping on a mine in a memory game.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setAiMessage(response.text || (isWin ? "You are a Legend!" : "Try again!"));
    } catch (e) {
      setAiMessage(isWin ? "Victory!" : "Boom!");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // --- SHOP & SPIN & FASHION LOGIC ---

  const buyItem = (item: any) => { // Generic buy for items/fashion
    if (profile.coins >= item.price) {
      playSound('coin');
      
      if ('type' in item) { // Fashion Item
         if (profile.ownedFashion.includes(item.id)) return;
         updateProfile({
           ...profile,
           coins: profile.coins - item.price,
           ownedFashion: [...profile.ownedFashion, item.id]
         });
      } else { // Powerup
         const key = item.id as keyof typeof profile.inventory;
         updateProfile({
           ...profile,
           coins: profile.coins - item.price,
           inventory: {
             ...profile.inventory,
             [key]: (profile.inventory[key] || 0) + 1
           }
         });
      }
    } else {
      playSound('error');
    }
  };

  const equipFashion = (item: FashionItem) => {
    playSound('equip');
    const newEquipped = { ...profile.equippedFashion };
    
    // Toggle off if already equipped
    if (newEquipped[item.type] === item.id) {
       delete newEquipped[item.type];
    } else {
       newEquipped[item.type] = item.id;
    }

    updateProfile({
      ...profile,
      equippedFashion: newEquipped
    });
  };

  const checkDailySpin = () => {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastSpinDate === today) {
      alert("You've already spun today! Come back tomorrow.");
      return;
    }
    setGameState(GameState.DAILY_SPIN);
  };

  const performSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    playSound('pop');
    
    // Animate for 2 seconds
    setTimeout(() => {
      const reward = Math.floor(Math.random() * 80) + 20; // 20-100 coins
      setSpinResult(reward);
      setIsSpinning(false);
      playSound('win');
      
      const today = new Date().toISOString().split('T')[0];
      updateProfile({
        ...profile,
        coins: profile.coins + reward,
        lastSpinDate: today
      });
    }, 2000);
  };

  // --- MINI GAME LOGIC ---
  const startMiniGame = () => {
     const today = new Date().toISOString().split('T')[0];
     if (profile.lastMinigameDate === today) {
       alert("You've already learned today! Come back tomorrow.");
       return;
     }
     setMinigameQIdx(0);
     setMinigameScore(0);
     setMinigameAnswerStatus(null);
     setGameState(GameState.MINIGAME_PLAYING);
  };

  const answerMiniGame = (optionIndex: number) => {
     if (minigameAnswerStatus) return; // Wait for next q

     const currentQ = WORD_GAME_DATA[minigameQIdx];
     const isCorrect = optionIndex === currentQ.correctIndex;
     
     if (isCorrect) {
       playSound('match');
       setMinigameScore(s => s + 1);
       setMinigameAnswerStatus('correct');
     } else {
       playSound('error');
       setMinigameAnswerStatus('wrong');
     }

     setTimeout(() => {
        if (minigameQIdx < 9) {
           setMinigameQIdx(q => q + 1);
           setMinigameAnswerStatus(null);
        } else {
           // Finish
           const coinsEarned = (minigameScore + (isCorrect ? 1 : 0)) * 10;
           const today = new Date().toISOString().split('T')[0];
           updateProfile({
              ...profile,
              coins: profile.coins + coinsEarned,
              lastMinigameDate: today
           });
           alert(`Quiz Complete! Score: ${minigameScore + (isCorrect ? 1 : 0)}/10. Earned ${coinsEarned} Coins!`);
           setGameState(GameState.IDLE);
        }
     }, 1000);
  };

  // --- RENDER HELPERS ---

  const getGridClass = () => {
    const cols = LEVELS[currentLevelIdx]?.cols || 4;
    switch(cols) {
      case 3: return "grid-cols-3";
      case 4: return "grid-cols-4";
      case 5: return "grid-cols-5";
      default: return "grid-cols-4";
    }
  };

  // --- MAIN RENDER ---

  if (gameState === GameState.IDLE) {
    return (
      <div className="h-full w-full bg-yellow-50 flex flex-col items-center p-4 overflow-y-auto">
        
        {/* Animated Lemon Character */}
        <div className="mt-8 mb-4">
           <LemonAvatar equipped={profile.equippedFashion} size="xl" animate />
        </div>

        <h1 className="text-5xl font-extrabold text-yellow-600 mb-1 drop-shadow-sm">Lemon Party</h1>
        <p className="text-yellow-700 mb-6 font-medium">Match, Dress Up, Learn!</p>
        
        <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
          <button 
            onClick={() => { setCurrentLevelIdx(0); startLevel(0); }}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg text-xl transition transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <Play size={24} /> Start Game
          </button>
          
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => setGameState(GameState.SHOP)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} /> Shop
              </button>
              <button 
                onClick={() => setGameState(GameState.WARDROBE)}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Shirt size={18} /> Style
              </button>
              <button 
                onClick={checkDailySpin}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Gift size={18} /> Spin
              </button>
              <button 
                onClick={startMiniGame}
                className={`text-white font-bold py-2 rounded-xl shadow-md flex items-center justify-center gap-2 ${profile.lastMinigameDate === new Date().toISOString().split('T')[0] ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
              >
                <BookOpen size={18} /> Quiz
              </button>
          </div>
        </div>

        {/* User Coin Display */}
        <div className="bg-yellow-100 px-6 py-2 rounded-full border border-yellow-300 flex items-center gap-2 text-yellow-800 font-bold mb-8">
           <Coins size={20} className="text-yellow-600"/> {profile.coins} Coins
        </div>

        {/* Leaderboard Section */}
        <div className="w-full max-w-xs bg-white rounded-2xl shadow-lg p-4 border border-yellow-200">
           <h3 className="text-lg font-bold text-yellow-800 mb-2 flex items-center gap-2"><Trophy size={18} className="text-yellow-500"/> Top Lemons</h3>
           {leaderboard.length === 0 ? (
             <p className="text-gray-400 text-sm text-center italic py-2">No scores yet. Be the first!</p>
           ) : (
             <ul className="space-y-2">
               {leaderboard.map((entry, idx) => (
                 <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-1">
                    <div className="flex items-center gap-2">
                       <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'}`}>{idx+1}</span>
                       <span className="font-medium text-gray-700 truncate max-w-[100px]">{entry.name}</span>
                    </div>
                    <span className="font-bold text-yellow-600">{entry.score}</span>
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>
    );
  }

  // SHOP SCREEN (Props/Items)
  if (gameState === GameState.SHOP) {
    return (
      <div className="h-full w-full bg-purple-50 p-4 overflow-y-auto">
         <header className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
            <button onClick={() => setGameState(GameState.IDLE)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100"><ArrowLeft /></button>
            <h2 className="text-2xl font-bold text-purple-900">Power-up Shop</h2>
            <div className="bg-yellow-400 text-white px-4 py-1 rounded-full font-bold flex items-center gap-2"><Coins size={16}/> {profile.coins}</div>
         </header>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto pb-8">
            {SHOP_ITEMS.map(item => (
               <div key={item.id} className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center border-2 border-transparent hover:border-purple-300 transition">
                  <div className="text-purple-500 mb-4 bg-purple-50 p-4 rounded-full">{item.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 h-10">{item.desc}</p>
                  <div className="text-sm text-gray-400 mb-4">Owned: {profile.inventory[item.id as keyof typeof profile.inventory] || 0}</div>
                  <button 
                    onClick={() => buyItem(item)}
                    className="w-full py-2 rounded-lg font-bold bg-yellow-400 hover:bg-yellow-500 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={profile.coins < item.price}
                  >
                    {item.price} <Coins size={14}/>
                  </button>
               </div>
            ))}
         </div>
      </div>
    );
  }

  // WARDROBE SCREEN
  if (gameState === GameState.WARDROBE) {
    return (
      <div className="h-full w-full bg-pink-50 p-4 flex flex-col overflow-hidden">
         <header className="flex items-center justify-between mb-4 max-w-2xl mx-auto w-full flex-shrink-0">
            <button onClick={() => setGameState(GameState.IDLE)} className="p-2 bg-white rounded-full shadow hover:bg-gray-100"><ArrowLeft /></button>
            <h2 className="text-2xl font-bold text-pink-900">Lemon Style</h2>
            <div className="bg-yellow-400 text-white px-4 py-1 rounded-full font-bold flex items-center gap-2"><Coins size={16}/> {profile.coins}</div>
         </header>

         <div className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto overflow-hidden">
            {/* Preview */}
            <div className="bg-white rounded-3xl p-8 mb-6 shadow-md w-full flex justify-center border border-pink-100 flex-shrink-0">
               <LemonAvatar equipped={profile.equippedFashion} size="xl" />
            </div>

            {/* Catalog */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto pb-20 px-2">
              {FASHION_CATALOG.map(item => {
                 const isOwned = profile.ownedFashion.includes(item.id);
                 const isEquipped = profile.equippedFashion[item.type] === item.id;

                 return (
                   <div key={item.id} className={`bg-white p-3 rounded-xl shadow-sm flex flex-col items-center border-2 ${isEquipped ? 'border-pink-500 bg-pink-50' : 'border-transparent'}`}>
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <div className="text-sm font-bold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500 mb-2 capitalize">{item.type}</div>
                      
                      {isOwned ? (
                        <button 
                          onClick={() => equipFashion(item)}
                          className={`w-full py-1 rounded text-xs font-bold ${isEquipped ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                          {isEquipped ? 'Unequip' : 'Equip'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => buyItem(item)}
                          disabled={profile.coins < item.price}
                          className="w-full py-1 rounded text-xs font-bold bg-yellow-400 text-white disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {item.price} <Coins size={10} />
                        </button>
                      )}
                   </div>
                 );
              })}
            </div>
         </div>
      </div>
    );
  }

  // SPIN SCREEN
  if (gameState === GameState.DAILY_SPIN) {
    return (
       <div className="h-full w-full bg-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <Confetti trigger={spinResult ? {x: window.innerWidth/2, y: window.innerHeight/2, type: 'success'} : null} />
          
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full relative z-10">
             <h2 className="text-2xl font-bold text-blue-900 mb-8">Daily Lemon Spin</h2>
             
             <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Wheel Graphic */}
                <div className={`w-full h-full rounded-full border-8 border-yellow-400 bg-conic-gradient relative ${isSpinning ? 'animate-spin-wheel' : ''} shadow-inner bg-yellow-100 flex items-center justify-center overflow-hidden`}>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-1 h-full bg-yellow-200/50 absolute rotate-0"></div>
                     <div className="w-1 h-full bg-yellow-200/50 absolute rotate-45"></div>
                     <div className="w-1 h-full bg-yellow-200/50 absolute rotate-90"></div>
                     <div className="w-1 h-full bg-yellow-200/50 absolute rotate-135"></div>
                   </div>
                   <span className="text-6xl">🍋</span>
                </div>
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-red-500 text-4xl">▼</div>
             </div>

             {spinResult === null ? (
               <button 
                 onClick={performSpin}
                 disabled={isSpinning}
                 className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-50"
               >
                 {isSpinning ? 'Spinning...' : 'SPIN!'}
               </button>
             ) : (
               <div className="animate-pop">
                  <p className="text-xl text-gray-600 mb-2">You won!</p>
                  <p className="text-4xl font-extrabold text-yellow-500 mb-6 flex items-center justify-center gap-2">
                    +{spinResult} <Coins />
                  </p>
                  <button onClick={() => setGameState(GameState.IDLE)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl">
                    Awesome
                  </button>
               </div>
             )}
          </div>
       </div>
    );
  }

  // MINI GAME SCREEN
  if (gameState === GameState.MINIGAME_PLAYING) {
     const question = WORD_GAME_DATA[minigameQIdx];

     return (
       <div className="h-full w-full bg-green-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border-b-4 border-green-200">
             <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-bold">Q{minigameQIdx + 1}/10</span>
                <span className="text-green-600 font-bold flex items-center gap-1"><Star size={16} fill="currentColor"/> {minigameScore}</span>
             </div>

             <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-2">{question.word}</h2>
                <p className="text-gray-400">Select the correct meaning</p>
             </div>

             <div className="space-y-3">
               {question.options.map((option, idx) => {
                 let btnClass = "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700";
                 
                 if (minigameAnswerStatus === 'correct' && idx === question.correctIndex) {
                    btnClass = "bg-green-500 border-green-600 text-white";
                 } else if (minigameAnswerStatus === 'wrong' && idx === question.correctIndex) {
                    btnClass = "bg-green-500 border-green-600 text-white opacity-50";
                 } else if (minigameAnswerStatus === 'wrong' && idx !== question.correctIndex) {
                    btnClass = "bg-red-100 border-red-200 text-red-400"; // Should highlight the selected wrong one ideally, but this is simple feedback
                 }

                 return (
                   <button 
                      key={idx}
                      onClick={() => answerMiniGame(idx)}
                      disabled={minigameAnswerStatus !== null}
                      className={`w-full py-4 rounded-xl border-2 font-bold text-lg transition ${btnClass}`}
                   >
                     {option}
                   </button>
                 )
               })}
             </div>
          </div>
       </div>
     )
  }

  // GAME PLAY VIEW
  return (
    <div className={`h-full w-full bg-yellow-50 flex flex-col items-center py-4 px-2 relative overflow-hidden transition-transform duration-100 ${isShaking ? 'animate-shake bg-red-50' : ''}`}>
      <Confetti trigger={explosionTrigger} />

      {/* HEADER */}
      <header className="w-full max-w-lg mb-2 space-y-2">
        <div className="flex justify-between items-center px-2">
           <div className="flex items-center gap-3">
              <button onClick={() => setGameState(GameState.IDLE)} className="p-1 bg-white rounded-lg shadow-sm"><Home size={18} className="text-yellow-700"/></button>
              <h2 className="text-xl font-bold text-yellow-800">Lvl {currentLevelIdx + 1}</h2>
           </div>
           
           <div className={`flex items-center gap-2 font-mono font-bold text-xl px-4 py-1 rounded-full border-2 transition-colors ${timeLeft <= 10 ? 'bg-red-100 border-red-500 text-red-600 animate-pulse-fast' : 'bg-white border-yellow-400 text-yellow-600'}`}>
              <Timer size={20} />
              {timeLeft}s
           </div>
        </div>
      </header>

      {/* GAME GRID */}
      <main className="relative z-10 w-full max-w-lg flex-1 flex flex-col justify-center mb-20">
        <div id="game-grid" className={`grid ${getGridClass()} gap-2 md:gap-3 mx-auto perspective-1000 w-full aspect-[4/5] md:aspect-square content-center`}>
          {cards.map(card => (
            <Card 
              key={card.id} 
              card={card} 
              onClick={handleCardClick}
              disabled={gameState !== GameState.PLAYING}
            />
          ))}
        </div>
      </main>

      {/* INVENTORY BAR (Fixed Bottom) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-xl border border-yellow-200 rounded-2xl p-2 flex gap-4 z-40 max-w-md w-[95%] justify-center">
         <InventoryButton 
            icon={<Eye size={20}/>} 
            count={profile.inventory.reveal} 
            onClick={() => activatePowerup('reveal', true)}
            color="text-blue-500"
         />
         <InventoryButton 
            icon={<Clock size={20}/>} 
            count={profile.inventory.time} 
            onClick={() => activatePowerup('time', true)}
            color="text-green-500"
         />
         <InventoryButton 
            icon={<Grid2X2 size={20}/>} 
            count={profile.inventory.clear4} 
            onClick={() => activatePowerup('clear-4', true)}
            color="text-purple-500"
         />
      </div>

      {/* LEVEL COMPLETE MODAL */}
      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-pop">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400">
              <Star className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-spin-slow" fill="currentColor" />
              <h2 className="text-3xl font-extrabold text-yellow-800 mb-2">Level Complete!</h2>
              <div className="flex justify-center items-center gap-2 text-yellow-600 mb-6 font-bold text-lg">
                 <span>Reward:</span>
                 <span className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full"><Coins size={16}/> {(currentLevelIdx + 1) * 20}</span>
              </div>
              <button onClick={nextLevel} className="w-full bg-yellow-500 text-white font-bold py-3 rounded-xl hover:bg-yellow-600 transition shadow-lg flex justify-center items-center gap-2">
                Next Level <Play size={20} />
              </button>
           </div>
        </div>
      )}

      {/* GAME OVER / WIN MODAL */}
      {(gameState === GameState.WON_GAME || gameState === GameState.GAME_OVER) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-pop">
          <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 text-center relative overflow-hidden ${gameState === GameState.WON_GAME ? 'bg-white border-yellow-400' : 'bg-slate-900 border-red-500 text-white'}`}>
             
             <div className="mb-6 flex justify-center">
               {gameState === GameState.WON_GAME ? <Trophy size={64} className="text-yellow-500" /> : <AlertTriangle size={64} className="text-red-500" />}
             </div>

             <h2 className="text-3xl font-bold mb-2">{gameState === GameState.WON_GAME ? 'Victory!' : 'Game Over'}</h2>
             <p className="opacity-80 mb-6">Total Score: {totalScore}</p>
             
             {/* AI Message */}
             <div className={`p-4 rounded-xl mb-6 text-sm italic ${gameState === GameState.WON_GAME ? 'bg-yellow-50 text-yellow-800' : 'bg-white/10 text-gray-300'}`}>
                {isLoadingAi ? <span className="animate-pulse">Consulting the lemon spirits...</span> : `"${aiMessage}"`}
             </div>

             {/* Leaderboard Input */}
             <div className="mb-6">
               <label className="block text-sm font-bold mb-2 opacity-70">Enter your name for the record:</label>
               <input 
                 type="text" 
                 maxLength={12}
                 placeholder="LemonKing"
                 value={playerName} 
                 onChange={(e) => setPlayerName(e.target.value)}
                 className={`w-full px-4 py-2 rounded-lg text-center font-bold text-lg outline-none ring-2 ${gameState === GameState.WON_GAME ? 'bg-gray-100 text-gray-800 ring-yellow-300 focus:ring-yellow-500' : 'bg-slate-800 text-white ring-red-900 focus:ring-red-500'}`}
               />
             </div>

             <button onClick={saveScore} className={`w-full font-bold py-3 rounded-xl shadow-lg transform transition active:scale-95 ${gameState === GameState.WON_GAME ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                Submit Score & Menu
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryButton: React.FC<{ icon: React.ReactNode, count: number, onClick: () => void, color: string }> = ({ icon, count, onClick, color }) => (
  <button 
     onClick={onClick} 
     disabled={count === 0}
     className={`relative p-3 rounded-xl bg-gray-50 border border-gray-200 shadow-sm flex flex-col items-center min-w-[70px] transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 ${color}`}
  >
     <div className="mb-1">{icon}</div>
     <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
       {count}
     </div>
  </button>
);

export default App;
