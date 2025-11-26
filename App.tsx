
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from './components/Card';
import Confetti from './components/Confetti';
import { CardType, GameState, LeaderboardEntry, LevelConfig } from './types';
import { RefreshCw, Play, Trophy, Sparkles, Eye, AlertTriangle, Timer, Star, Wand2, Clock } from 'lucide-react';

// --- GAME CONSTANTS ---

const LEMON_EMOJIS = ['🍋', '🍋', '🍋', '🍋']; 
const OTHER_FRUITS = ['🍊', '🍐', '🍏', '🍎', '🍉', '🍇', '🥝', '🫐', '🍑', '🍒', '🍓', '🍍'];
const MINE_EMOJI = '💣';
const POWERUP_EMOJIS = {
  time: '⏰',
  'auto-match': '🪄',
  reveal: '👁️'
};

const LEVELS: LevelConfig[] = [
  { level: 1, cols: 3, rows: 4, timeLimit: 45, mines: 0, powerups: [] },
  { level: 2, cols: 4, rows: 4, timeLimit: 60, mines: 1, powerups: [] },
  { level: 3, cols: 4, rows: 5, timeLimit: 75, mines: 1, powerups: ['time'] },
  { level: 4, cols: 4, rows: 5, timeLimit: 60, mines: 2, powerups: ['auto-match'] },
  { level: 5, cols: 4, rows: 6, timeLimit: 90, mines: 3, powerups: ['time', 'auto-match'] },
];

// --- SOUND UTILS (Simple Synthesizer) ---

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playSound = (type: 'pop' | 'match' | 'error' | 'win' | 'explode' | 'tick' | 'magic') => {
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
      // Noise buffer for explosion
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
  }
};

const App: React.FC = () => {
  // Game Configuration State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardType[]>([]);
  
  // Gameplay State
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [moves, setMoves] = useState(0);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0); // Tracks fruits/powerups, excludes mines
  const [totalPairsToMatch, setTotalPairsToMatch] = useState(0); // Target count to win level (excluding mines)
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // Skill/Powerup State
  const [isPeeking, setIsPeeking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  // Visual Effects
  const [explosionTrigger, setExplosionTrigger] = useState<{ x: number, y: number, type: 'success' | 'explosion' } | null>(null);

  // GenAI & Leaderboard
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalScore, setTotalScore] = useState(0); // Cumulative score across levels

  // Load Leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('lemon-party-leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  const saveScore = () => {
    if (!playerName.trim()) return;
    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: totalScore + moves * 10, // Score calc logic
      level: currentLevelIdx + 1,
      date: Date.now()
    };
    const updated = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
    setLeaderboard(updated);
    localStorage.setItem('lemon-party-leaderboard', JSON.stringify(updated));
    setGameState(GameState.IDLE); // Reset to title
  };

  // --- GAME INITIALIZATION ---

  const startLevel = useCallback((levelIdx: number) => {
    const config = LEVELS[levelIdx] || LEVELS[LEVELS.length - 1]; // Fallback to last level config
    
    // Grid Size
    const totalCards = config.rows * config.cols;
    const mineCount = config.mines;
    const powerupCount = config.powerups.length;
    const fruitPairsCount = (totalCards - (mineCount * 2) - (powerupCount * 2)) / 2;

    if (fruitPairsCount < 0) {
      console.error("Invalid level config: Not enough space for fruits");
      return;
    }

    // 1. Create Deck Items
    let deck: CardType[] = [];
    let idCounter = 0;

    // Add Mines
    for (let i = 0; i < mineCount; i++) {
      deck.push({ id: idCounter++, content: MINE_EMOJI, type: 'mine', isFlipped: false, isMatched: false });
      deck.push({ id: idCounter++, content: MINE_EMOJI, type: 'mine', isFlipped: false, isMatched: false });
    }

    // Add Powerups
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

    // Set State
    setCards(deck);
    setFlippedCards([]);
    setMatchedPairsCount(0);
    setTotalPairsToMatch(fruitPairsCount + powerupCount); // Mines are not matched to win
    setMoves(0);
    setTimeLeft(config.timeLimit);
    setIsPeeking(false);
    setIsShaking(false);
    setExplosionTrigger(null);
    setGameState(GameState.PLAYING);
    setAiMessage("");
    
    // Play sound
    if (levelIdx === 0) setTotalScore(0);
    playSound('pop');
  }, []);

  // --- TIMER LOGIC ---

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          // Sound effect for urgency
          if (prev <= 31) {
             // Play tick every second if < 30s
             playSound('tick');
          }
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

  // --- INTERACTION HANDLERS ---

  const handleCardClick = (card: CardType) => {
    if (gameState !== GameState.PLAYING) return;
    if (isPeeking) return; 
    if (flippedCards.length >= 2 || flippedCards.some(c => c.id === card.id)) return;

    playSound('pop');
    const newCards = cards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    setFlippedCards(prev => [...prev, card]);
  };

  // Check Matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = flippedCards;

      if (first.content === second.content) {
        // --- MATCH FOUND ---
        
        // 1. MINE Check
        if (first.type === 'mine') {
          // Are these the LAST things on board?
          // We need to check if all Safe cards are already matched.
          if (matchedPairsCount < totalPairsToMatch) {
            // Explode
            triggerExplosion();
            return;
          } else {
            // Winning Match (Last pair was mines) - Actually usually mines aren't matched last, they are just avoided.
            // But if user cleared everything else, matching mines is fine or game just ends automatically?
            // Current Logic: Mines are "Danger", matching them early kills you.
            // Matching them last is "Safe disposal".
            handleSuccessMatch(first, second);
          }
        } 
        
        // 2. Powerup Check
        else if (first.type === 'powerup' && first.powerupType) {
           activatePowerup(first.powerupType);
           handleSuccessMatch(first, second);
        }
        
        // 3. Normal Fruit
        else {
           handleSuccessMatch(first, second);
        }

      } else {
        // --- NO MATCH ---
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

  // --- POWERUPS ---

  const activatePowerup = (type: string) => {
    playSound('magic');
    if (type === 'time') {
      setTimeLeft(t => t + 20); // Add 20s
    } 
    else if (type === 'auto-match') {
      // Find a non-matched, non-mine pair
      setTimeout(() => {
        setCards(currentCards => {
          const available = currentCards.filter(c => !c.isMatched && c.type !== 'mine' && c.type !== 'powerup');
          if (available.length >= 2) {
             // Find a pair
             const targetContent = available[0].content;
             const pair = available.filter(c => c.content === targetContent);
             if (pair.length === 2) {
               // Trigger match
               // Note: We simulate match by updating state directly to avoid loop complexity
               setMatchedPairsCount(c => c + 1);
               return currentCards.map(c => 
                 c.id === pair[0].id || c.id === pair[1].id 
                   ? { ...c, isMatched: true, isFlipped: true } 
                   : c
               );
             }
          }
          return currentCards;
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
  };

  // --- LEVEL WIN CHECK ---

  useEffect(() => {
    if (matchedPairsCount > 0 && matchedPairsCount === totalPairsToMatch) {
      playSound('win');
      // Calculate Score for level
      const timeBonus = timeLeft * 5;
      const levelScore = 100 + timeBonus;
      setTotalScore(prev => prev + levelScore);

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

  // --- AI MESSAGE ---

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
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-6xl font-extrabold text-yellow-600 mb-8 drop-shadow-sm">Lemon Party</h1>
        <button 
          onClick={() => { setCurrentLevelIdx(0); startLevel(0); }}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 px-12 rounded-full shadow-lg text-2xl transition transform hover:scale-105 mb-12 flex items-center gap-3"
        >
          <Play size={32} /> Start Adventure
        </button>

        {leaderboard.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-yellow-200">
             <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2"><Trophy className="text-yellow-500"/> Hall of Fame</h2>
             <div className="space-y-3">
               {leaderboard.map((entry, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-yellow-600 w-6">#{idx+1}</span>
                      <span className="font-semibold text-slate-700">{entry.name}</span>
                    </div>
                    <div className="text-sm text-yellow-700 font-mono">
                      Lvl {entry.level} • {entry.score}pts
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-yellow-50 flex flex-col items-center py-4 px-2 relative overflow-hidden transition-transform duration-100 ${isShaking ? 'animate-shake bg-red-50' : ''}`}>
      <Confetti trigger={explosionTrigger} />

      {/* HEADER */}
      <header className="w-full max-w-lg mb-4 space-y-2">
        <div className="flex justify-between items-center px-2">
           <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
             <span>Level {currentLevelIdx + 1}</span>
             <span className="text-sm bg-yellow-200 px-2 py-0.5 rounded-full text-yellow-800">Score: {totalScore}</span>
           </h2>
           
           <div className={`flex items-center gap-2 font-mono font-bold text-xl px-4 py-1 rounded-full border-2 transition-colors ${timeLeft <= 10 ? 'bg-red-100 border-red-500 text-red-600 animate-pulse-fast' : 'bg-white border-yellow-400 text-yellow-600'}`}>
              <Timer size={20} />
              {timeLeft}s
           </div>
        </div>
      </header>

      {/* GAME GRID */}
      <main className="relative z-10 w-full max-w-lg flex-1 flex flex-col justify-center">
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

      {/* LEVEL COMPLETE MODAL */}
      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-pop">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400">
              <Star className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-spin-slow" fill="currentColor" />
              <h2 className="text-3xl font-extrabold text-yellow-800 mb-2">Level Complete!</h2>
              <p className="text-yellow-600 mb-6">Bonus Points: {timeLeft * 5}</p>
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

export default App;
