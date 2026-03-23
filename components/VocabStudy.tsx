import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, BookOpen, PenLine, BarChart3, ChevronRight, ChevronLeft, RotateCcw, Check, X, Minus, Eye, EyeOff, RefreshCw, TrendingUp, Star, AlertCircle, HelpCircle, Filter } from 'lucide-react';
import { VocabWord, VocabMasteryMap, VocabMasteryEntry, VocabGradeResult, VocabMasteryLevel } from '../types';
import rawVocab from '../vocabulary-test/ket_vocabulary_v2.json';

// ─── Constants ────────────────────────────────────────────────────────────────

const VOCAB: VocabWord[] = rawVocab as VocabWord[];
const MASTERY_KEY = 'ket-vocab-mastery';

type SubState = 'menu' | 'review' | 'dictation' | 'results' | 'stats';

// ─── Mastery helpers ──────────────────────────────────────────────────────────

function loadMastery(): VocabMasteryMap {
  try {
    return JSON.parse(localStorage.getItem(MASTERY_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveMastery(m: VocabMasteryMap) {
  localStorage.setItem(MASTERY_KEY, JSON.stringify(m));
}

function getMasteryLevel(entry?: VocabMasteryEntry): VocabMasteryLevel {
  if (!entry || entry.attempts === 0) return 'untested';
  const rate = entry.correct / entry.attempts;
  if (rate >= 0.8 && entry.attempts >= 3) return 'mastered';
  if (rate >= 0.5) return 'needs_review';
  return 'weak';
}

function scoreWord(entry?: VocabMasteryEntry): number {
  if (!entry || entry.attempts === 0) return 0.5;
  return entry.correct / entry.attempts;
}

function selectWords(mastery: VocabMasteryMap, count: number): VocabWord[] {
  const scored = VOCAB.map(w => ({ w, s: scoreWord(mastery[String(w.id)]) }));
  scored.sort((a, b) => a.s - b.s);

  const weak   = scored.filter(x => x.s < 0.5).map(x => x.w);
  const medium = scored.filter(x => x.s >= 0.5 && x.s < 0.8).map(x => x.w);
  const good   = scored.filter(x => x.s >= 0.8).map(x => x.w);

  const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const selected: VocabWord[] = [];
  let rem = count;

  const weakQ  = Math.min(Math.floor(count * 0.6), weak.length);
  selected.push(...shuffle(weak).slice(0, weakQ));
  rem -= weakQ;

  const medQ = Math.min(Math.floor(count * 0.3), medium.length);
  selected.push(...shuffle(medium).slice(0, medQ));
  rem -= medQ;

  const pool = shuffle([...good, ...medium, ...weak]).filter(w => !selected.includes(w));
  selected.push(...pool.slice(0, rem));

  return shuffle(selected).slice(0, count);
}

// ─── Grading helpers ──────────────────────────────────────────────────────────

function normalizeAnswer(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function gradeAnswer(submitted: string, word: VocabWord): VocabGradeResult['grade'] {
  const s = normalizeAnswer(submitted);
  if (!s) return 'wrong';
  // Accept any alternative separated by "/"
  const alts = word.word.split('/').map(a => normalizeAnswer(a.trim()));
  if (alts.some(a => a === s)) return 'correct';
  // "Close" = first letter matches and length diff ≤ 2
  const primary = normalizeAnswer(word.word.split('/')[0]);
  if (primary[0] === s[0] && Math.abs(primary.length - s.length) <= 2) return 'close';
  return 'wrong';
}

function updateMastery(
  mastery: VocabMasteryMap,
  results: VocabGradeResult[],
  sessionId: string
): VocabMasteryMap {
  const today = new Date().toISOString().split('T')[0];
  const next = { ...mastery };
  for (const r of results) {
    const key = String(r.word.id);
    const prev = next[key] ?? {
      word: r.word.word, translation: r.word.translation,
      attempts: 0, correct: 0, lastTested: '', history: [],
    };
    const isCorrect = r.grade === 'correct';
    const entry: VocabMasteryEntry = {
      ...prev,
      attempts: prev.attempts + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      lastTested: today,
      history: [
        ...prev.history.slice(-49),
        { date: today, sessionId, correct: isCorrect, submitted: r.submitted },
      ],
    };
    next[key] = entry;
  }
  return next;
}

// ─── Sub-screen: Menu ─────────────────────────────────────────────────────────

interface MenuScreenProps {
  onBack: () => void;
  onReview: (words: VocabWord[], hint: boolean) => void;
  onDictation: (words: VocabWord[], hint: boolean) => void;
  onStats: () => void;
}

const COUNTS = [10, 20, 30, 50];

const MenuScreen: React.FC<MenuScreenProps> = ({ onBack, onReview, onDictation, onStats }) => {
  const [count, setCount] = useState(20);
  const [showHint, setShowHint] = useState(true);
  const mastery = loadMastery();

  const total = VOCAB.length;
  const tested = Object.values(mastery).filter(e => e.attempts > 0).length;
  const mastered = Object.values(mastery).filter(e => getMasteryLevel(e) === 'mastered').length;
  const weak = Object.values(mastery).filter(e => getMasteryLevel(e) === 'weak').length;

  const handleStart = (mode: 'review' | 'dictation') => {
    const words = selectWords(mastery, count);
    if (mode === 'review') onReview(words, showHint);
    else onDictation(words, showHint);
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-yellow-50 to-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur border-b border-yellow-100 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-yellow-100 transition">
          <ArrowLeft size={20} className="text-yellow-700" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-yellow-700">KET 单词学习</h1>
          <p className="text-xs text-yellow-600">共 {total} 个单词</p>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 max-w-md mx-auto w-full">

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-yellow-100">
            <div className="text-2xl font-extrabold text-yellow-500">{tested}</div>
            <div className="text-xs text-gray-500 mt-0.5">已测试</div>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-extrabold text-green-500">{mastered}</div>
            <div className="text-xs text-gray-500 mt-0.5">已掌握</div>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-red-100">
            <div className="text-2xl font-extrabold text-red-400">{weak}</div>
            <div className="text-xs text-gray-500 mt-0.5">需加强</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>总体进度</span>
            <span className="text-yellow-600 font-bold">{Math.round(tested / total * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all"
              style={{ width: `${(tested / total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>已完成 {tested} 词</span>
            <span>剩余 {total - tested} 词</span>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">本次设置</h3>

          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-2 block">抽取单词数量</label>
            <div className="grid grid-cols-4 gap-2">
              {COUNTS.map(c => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`py-2 rounded-xl text-sm font-bold transition ${
                    count === c
                      ? 'bg-yellow-400 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {showHint ? <Eye size={16} /> : <EyeOff size={16} />}
              首字母提示
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors relative ${showHint ? 'bg-yellow-400' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showHint ? 'left-5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>

        {/* Action buttons */}
        <button
          onClick={() => handleStart('review')}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
        >
          <BookOpen size={20} /> 复习模式（先看答案）
        </button>

        <button
          onClick={() => handleStart('dictation')}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
        >
          <PenLine size={20} /> 默写模式（直接测试）
        </button>

        <button
          onClick={onStats}
          className="w-full bg-white text-gray-600 font-bold py-3.5 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center gap-2 transition hover:bg-gray-50 active:scale-95"
        >
          <BarChart3 size={20} className="text-green-500" /> 查看掌握报告
        </button>
      </div>
    </div>
  );
};

// ─── Sub-screen: Review ───────────────────────────────────────────────────────

interface ReviewScreenProps {
  words: VocabWord[];
  onStartDictation: () => void;
  onBack: () => void;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ words, onStartDictation, onBack }) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<'cards' | 'list'>('cards');

  const current = words[idx];

  const next = () => { setFlipped(false); setTimeout(() => setIdx(i => Math.min(i + 1, words.length - 1)), 150); };
  const prev = () => { setFlipped(false); setTimeout(() => setIdx(i => Math.max(i - 1, 0)), 150); };

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur border-b border-blue-100 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-blue-100 transition">
          <ArrowLeft size={20} className="text-blue-700" />
        </button>
        <div className="flex-1">
          <h2 className="font-extrabold text-blue-700">复习模式</h2>
          <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${((idx + 1) / words.length) * 100}%` }} />
          </div>
        </div>
        <span className="text-sm font-bold text-blue-500">{idx + 1}/{words.length}</span>
        <button
          onClick={() => setMode(m => m === 'cards' ? 'list' : 'cards')}
          className="p-2 rounded-full hover:bg-blue-100 transition text-blue-600"
        >
          <Filter size={18} />
        </button>
      </div>

      {mode === 'cards' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          {/* Flashcard */}
          <div
            onClick={() => setFlipped(f => !f)}
            className="w-full max-w-sm aspect-[4/3] cursor-pointer"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Front: Chinese */}
              <div
                className="absolute inset-0 bg-white rounded-3xl shadow-xl border-2 border-blue-100 flex flex-col items-center justify-center p-6"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-5xl mb-3">🀄</div>
                <div className="text-3xl font-extrabold text-gray-800 text-center leading-tight">
                  {current.translation}
                </div>
                <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                  <RotateCcw size={12} /> 点击翻转查看英文
                </div>
              </div>
              {/* Back: English */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="text-5xl mb-3">🔤</div>
                <div className="text-3xl font-extrabold text-white text-center leading-tight">
                  {current.word}
                </div>
                <div className="mt-2 text-blue-200 text-sm text-center">{current.translation}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <button
              onClick={prev}
              disabled={idx === 0}
              className="p-3 rounded-full bg-white shadow border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition active:scale-90"
            >
              <ChevronLeft size={22} className="text-gray-700" />
            </button>
            <span className="text-gray-400 text-sm font-medium">{idx + 1} / {words.length}</span>
            <button
              onClick={next}
              disabled={idx === words.length - 1}
              className="p-3 rounded-full bg-white shadow border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition active:scale-90"
            >
              <ChevronRight size={22} className="text-gray-700" />
            </button>
          </div>
        </div>
      ) : (
        /* List view */
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-md mx-auto space-y-2">
            {words.map((w, i) => (
              <div
                key={w.id}
                className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-4"
              >
                <span className="text-xs text-gray-400 font-bold w-6">{i + 1}</span>
                <span className="flex-1 text-gray-700 font-medium">{w.translation}</span>
                <span className="font-bold text-blue-600">{w.word}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={onStartDictation}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
        >
          <PenLine size={20} /> 开始默写测试
        </button>
      </div>
    </div>
  );
};

// ─── Sub-screen: Dictation ────────────────────────────────────────────────────

interface DictationScreenProps {
  words: VocabWord[];
  showHint: boolean;
  onFinish: (results: VocabGradeResult[]) => void;
  onBack: () => void;
}

const DictationScreen: React.FC<DictationScreenProps> = ({ words, showHint, onFinish, onBack }) => {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(words.length).fill(''));
  const inputRef = useRef<HTMLInputElement>(null);

  const current = words[idx];
  const hint = showHint ? current.word[0].toUpperCase() : null;
  const isLast = idx === words.length - 1;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [idx]);

  const goNext = useCallback(() => {
    if (isLast) {
      const results: VocabGradeResult[] = words.map((w, i) => ({
        word: w,
        submitted: answers[i].trim(),
        grade: gradeAnswer(answers[i], w),
      }));
      onFinish(results);
    } else {
      setIdx(i => i + 1);
    }
  }, [isLast, words, answers, onFinish]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') goNext();
  };

  const updateAnswer = (val: string) => {
    setAnswers(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  return (
    <div className="h-full w-full bg-gradient-to-b from-yellow-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur border-b border-yellow-100 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-yellow-100 transition">
          <ArrowLeft size={20} className="text-yellow-700" />
        </button>
        <div className="flex-1">
          <h2 className="font-extrabold text-yellow-700">默写测试</h2>
          <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${((idx + 1) / words.length) * 100}%` }} />
          </div>
        </div>
        <span className="text-sm font-bold text-yellow-500">{idx + 1}/{words.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Word prompt */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border-2 border-yellow-100 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-5xl mb-4">✏️</div>
          <div className="text-3xl font-extrabold text-gray-800 leading-tight mb-2">
            {current.translation}
          </div>
          {hint && (
            <div className="mt-3 px-4 py-1.5 bg-yellow-50 rounded-full text-yellow-700 font-bold text-sm tracking-widest">
              {hint}{'_ '.repeat(Math.max(0, current.word.length - 1)).trim()}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="w-full max-w-sm">
          <input
            ref={inputRef}
            type="text"
            value={answers[idx]}
            onChange={e => updateAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入英文单词..."
            className="w-full px-5 py-4 rounded-2xl border-2 border-yellow-200 focus:border-yellow-400 outline-none text-xl font-bold text-center text-gray-700 shadow-sm transition bg-white"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          <p className="text-center text-xs text-gray-400 mt-2">按 Enter 或点击下方按钮继续</p>
        </div>

        {/* Previous answers preview (last 2) */}
        {idx > 0 && (
          <div className="w-full max-w-sm space-y-1.5">
            {[idx - 1, idx - 2].filter(i => i >= 0).map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/60 rounded-xl border border-gray-100 text-sm">
                <span className="text-gray-400 w-5 text-right">{i + 1}.</span>
                <span className="text-gray-500 flex-1">{words[i].translation}</span>
                <span className="font-bold text-gray-600">{answers[i] || <span className="text-gray-300 italic">空</span>}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
        {idx > 0 && (
          <button
            onClick={() => setIdx(i => i - 1)}
            className="flex-none px-4 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <button
          onClick={goNext}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
        >
          {isLast ? '提交批改 ✓' : <>下一题 <ChevronRight size={18} /></>}
        </button>
      </div>
    </div>
  );
};

// ─── Sub-screen: Results ──────────────────────────────────────────────────────

interface ResultsScreenProps {
  results: VocabGradeResult[];
  onRetry: () => void;
  onBack: () => void;
}

const GRADE_COLOR: Record<VocabGradeResult['grade'], string> = {
  correct: 'text-green-600',
  close: 'text-yellow-600',
  wrong: 'text-red-500',
};

const GRADE_BG: Record<VocabGradeResult['grade'], string> = {
  correct: 'bg-green-50 border-green-100',
  close: 'bg-yellow-50 border-yellow-100',
  wrong: 'bg-red-50 border-red-100',
};

const GRADE_ICON: Record<VocabGradeResult['grade'], React.ReactNode> = {
  correct: <Check size={16} />,
  close: <Minus size={16} />,
  wrong: <X size={16} />,
};

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onRetry, onBack }) => {
  const correct  = results.filter(r => r.grade === 'correct').length;
  const close    = results.filter(r => r.grade === 'close').length;
  const wrong    = results.filter(r => r.grade === 'wrong').length;
  const pct      = Math.round((correct / results.length) * 100);

  const grade    = pct >= 90 ? '优秀 🌟' : pct >= 70 ? '良好 👍' : pct >= 50 ? '继续努力 💪' : '加油 🔥';
  const gradeBg  = pct >= 90 ? 'from-yellow-400 to-yellow-500' : pct >= 70 ? 'from-green-400 to-green-500' : pct >= 50 ? 'from-blue-400 to-blue-500' : 'from-red-400 to-red-500';

  return (
    <div className="h-full w-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="font-extrabold text-gray-700">批改结果</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Score card */}
          <div className={`bg-gradient-to-br ${gradeBg} rounded-3xl p-6 text-white text-center shadow-lg`}>
            <div className="text-5xl font-extrabold mb-1">{correct}/{results.length}</div>
            <div className="text-white/80 text-lg mb-3">{pct}% 正确率</div>
            <div className="text-xl font-bold">{grade}</div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="bg-white/20 rounded-full px-3 py-1">✓ 正确 {correct}</span>
              <span className="bg-white/20 rounded-full px-3 py-1">≈ 接近 {close}</span>
              <span className="bg-white/20 rounded-full px-3 py-1">✗ 错误 {wrong}</span>
            </div>
          </div>

          {/* Wrong words focus */}
          {wrong + close > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
              <h3 className="font-bold text-red-600 mb-3 flex items-center gap-1.5 text-sm">
                <AlertCircle size={15} /> 需要重点记忆
              </h3>
              <div className="space-y-2">
                {results.filter(r => r.grade !== 'correct').map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex-1">{r.word.translation}</span>
                    <span className="text-gray-400 text-xs mx-2">你写: {r.submitted || '（空）'}</span>
                    <span className="font-bold text-red-600">{r.word.word}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-700 text-sm">全部题目</h3>
            </div>
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 ${GRADE_BG[r.grade]}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-none ${
                  r.grade === 'correct' ? 'bg-green-400' : r.grade === 'close' ? 'bg-yellow-400' : 'bg-red-400'
                }`}>
                  {GRADE_ICON[r.grade]}
                </span>
                <span className="text-gray-500 text-sm flex-1">{r.word.translation}</span>
                {r.grade !== 'correct' && (
                  <span className="text-xs text-gray-400 line-through">{r.submitted || '空'}</span>
                )}
                <span className={`font-bold text-sm ${GRADE_COLOR[r.grade]}`}>
                  {r.word.word}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-2xl shadow flex items-center justify-center gap-2 transition active:scale-95"
        >
          <RefreshCw size={18} /> 重新默写
        </button>
        <button
          onClick={onBack}
          className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition active:scale-95"
        >
          <ArrowLeft size={18} /> 返回菜单
        </button>
      </div>
    </div>
  );
};

// ─── Sub-screen: Stats ────────────────────────────────────────────────────────

interface StatsScreenProps {
  onBack: () => void;
}

const LEVEL_CONFIG: Record<VocabMasteryLevel, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  mastered:     { label: '已掌握', color: 'text-green-600',  bg: 'bg-green-50 border-green-100',  icon: <Star size={14} className="text-green-500" fill="currentColor" /> },
  needs_review: { label: '需巩固', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100', icon: <AlertCircle size={14} className="text-yellow-500" /> },
  weak:         { label: '未掌握', color: 'text-red-500',    bg: 'bg-red-50 border-red-100',       icon: <X size={14} className="text-red-500" /> },
  untested:     { label: '未测试', color: 'text-gray-400',   bg: 'bg-gray-50 border-gray-100',     icon: <HelpCircle size={14} className="text-gray-400" /> },
};

const StatsScreen: React.FC<StatsScreenProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<VocabMasteryLevel | 'all'>('all');
  const mastery = loadMastery();

  const counts: Record<VocabMasteryLevel, number> = { mastered: 0, needs_review: 0, weak: 0, untested: 0 };
  VOCAB.forEach(w => counts[getMasteryLevel(mastery[String(w.id)])]++);

  const total = VOCAB.length;
  const tested = total - counts.untested;
  const totalAttempts = Object.values(mastery).reduce((s, e) => s + e.attempts, 0);
  const totalCorrect  = Object.values(mastery).reduce((s, e) => s + e.correct, 0);
  const overallRate   = totalAttempts ? Math.round(totalCorrect / totalAttempts * 100) : 0;

  const wordList = VOCAB
    .filter(w => filter === 'all' ? getMasteryLevel(mastery[String(w.id)]) !== 'untested' : getMasteryLevel(mastery[String(w.id)]) === filter)
    .map(w => ({ w, entry: mastery[String(w.id)], level: getMasteryLevel(mastery[String(w.id)]) as VocabMasteryLevel }))
    .sort((a, b) => {
      const order: Record<VocabMasteryLevel, number> = { weak: 0, needs_review: 1, untested: 2, mastered: 3 };
      return order[a.level] - order[b.level];
    });

  return (
    <div className="h-full w-full bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur border-b border-green-100 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-green-100 transition">
          <ArrowLeft size={20} className="text-green-700" />
        </button>
        <h2 className="font-extrabold text-green-700">掌握情况报告</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Overview */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
            <div className="flex justify-between items-end mb-3">
              <div>
                <div className="text-2xl font-extrabold text-gray-800">{tested}/{total}</div>
                <div className="text-xs text-gray-400">已测试单词</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-green-600">{overallRate}%</div>
                <div className="text-xs text-gray-400">总体正确率</div>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: `${counts.mastered / total * 100}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">{counts.mastered} 词已掌握</div>
          </div>

          {/* Counts grid */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(LEVEL_CONFIG) as VocabMasteryLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setFilter(f => f === level ? 'all' : level)}
                className={`p-3 rounded-xl text-left border transition ${LEVEL_CONFIG[level].bg} ${filter === level ? 'ring-2 ring-offset-1 ring-yellow-400' : ''}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {LEVEL_CONFIG[level].icon}
                  <span className={`text-xs font-bold ${LEVEL_CONFIG[level].color}`}>{LEVEL_CONFIG[level].label}</span>
                </div>
                <div className={`text-2xl font-extrabold ${LEVEL_CONFIG[level].color}`}>{counts[level]}</div>
              </button>
            ))}
          </div>

          {/* Word list */}
          {wordList.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-700 text-sm">
                  {filter === 'all' ? '已测试单词' : LEVEL_CONFIG[filter].label + '的单词'}
                  <span className="ml-1 text-gray-400 font-normal">({wordList.length})</span>
                </h3>
                {filter !== 'all' && (
                  <button onClick={() => setFilter('all')} className="text-xs text-gray-400 hover:text-gray-600">
                    显示全部
                  </button>
                )}
              </div>
              {wordList.map(({ w, entry, level }) => {
                const rate = entry?.attempts ? Math.round(entry.correct / entry.attempts * 100) : 0;
                return (
                  <div key={w.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex-none">{LEVEL_CONFIG[level].icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-700 text-sm truncate">{w.word}</div>
                      <div className="text-xs text-gray-400 truncate">{w.translation}</div>
                    </div>
                    <div className="text-right text-xs text-gray-400 flex-none">
                      <div className={`font-bold ${LEVEL_CONFIG[level].color}`}>{rate}%</div>
                      <div>{entry?.attempts ?? 0}次</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {wordList.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <TrendingUp size={40} className="mx-auto mb-2 opacity-30" />
              <p>还没有符合条件的记录</p>
              <p className="text-sm mt-1">先做几次默写测试吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────

interface VocabStudyProps {
  onBack: () => void;
}

const VocabStudy: React.FC<VocabStudyProps> = ({ onBack }) => {
  const [sub, setSub] = useState<SubState>('menu');
  const [sessionWords, setSessionWords] = useState<VocabWord[]>([]);
  const [showHint, setShowHint] = useState(true);
  const [results, setResults] = useState<VocabGradeResult[]>([]);
  const sessionId = useRef(new Date().toISOString());

  const startReview = (words: VocabWord[], hint: boolean) => {
    setSessionWords(words);
    setShowHint(hint);
    setSub('review');
  };

  // Called from menu only — sets a fresh word selection
  const startDictation = (words: VocabWord[], hint: boolean) => {
    setSessionWords(words);
    setShowHint(hint);
    sessionId.current = new Date().toISOString();
    setSub('dictation');
  };

  const handleFinish = (res: VocabGradeResult[]) => {
    setResults(res);
    const mastery = loadMastery();
    const updated = updateMastery(mastery, res, sessionId.current);
    saveMastery(updated);
    setSub('results');
  };

  const handleRetry = () => {
    sessionId.current = new Date().toISOString();
    setSub('dictation');
  };

  return (
    <div className="h-full w-full">
      {sub === 'menu' && (
        <MenuScreen
          onBack={onBack}
          onReview={startReview}
          onDictation={startDictation}
          onStats={() => setSub('stats')}
        />
      )}
      {sub === 'review' && (
        <ReviewScreen
          words={sessionWords}
          onStartDictation={() => {
            // Reuse the exact same words from review — no re-selection
            sessionId.current = new Date().toISOString();
            setSub('dictation');
          }}
          onBack={() => setSub('menu')}
        />
      )}
      {sub === 'dictation' && (
        <DictationScreen
          words={sessionWords}
          showHint={showHint}
          onFinish={handleFinish}
          onBack={() => setSub('menu')}
        />
      )}
      {sub === 'results' && (
        <ResultsScreen
          results={results}
          onRetry={handleRetry}
          onBack={() => setSub('menu')}
        />
      )}
      {sub === 'stats' && (
        <StatsScreen onBack={() => setSub('menu')} />
      )}
    </div>
  );
};

export default VocabStudy;
