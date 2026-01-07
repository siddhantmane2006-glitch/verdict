'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, X, Loader2, Brain, Zap, Fingerprint, Trophy, 
  Skull, Clock, TrendingUp, Target, Crown, Shield, MessageSquare, 
  AlertTriangle, RotateCw, MoveHorizontal, Hash, ToggleLeft 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from '@/app/components/shared'; 

// --- TYPES ---
type GameState = 'matching' | 'playing' | 'victory_splash' | 'defeat_glitch' | 'win' | 'loss';
type PuzzleType = 'choice' | 'mash' | 'slider' | 'toggles' | 'sequence';

interface Question {
  id: string;
  type: PuzzleType;
  prompt: string;
  visual: any; // visual content config
  data?: any; // Extra data for interactive puzzles (target, sequence, etc)
  options?: { label: string; val: string }[];
  answer?: string; // For choice/math
}

// --- 1. THE 50+ PUZZLE GENERATOR ---
const generateBattleDeck = (): Question[] => {
  const puzzles: Question[] = [
    // --- STROOP & VISUAL TRAPS (1-10) ---
    { id: 'c1', type: 'choice', prompt: 'Tap the COLOR', visual: { type: 'text', content: 'GREEN', color: 'text-red-500', size: 'text-7xl' }, options: [{ label: 'Green', val: 'green' }, { label: 'Red', val: 'red' }], answer: 'red' },
    { id: 'c2', type: 'choice', prompt: 'Tap the COLOR', visual: { type: 'text', content: 'BLUE', color: 'text-yellow-400', size: 'text-7xl' }, options: [{ label: 'Blue', val: 'blue' }, { label: 'Yellow', val: 'yellow' }], answer: 'yellow' },
    { id: 'c3', type: 'choice', prompt: 'Tap the TEXT', visual: { type: 'text', content: 'PURPLE', color: 'text-white', size: 'text-7xl' }, options: [{ label: 'Purple', val: 'purple' }, { label: 'White', val: 'white' }], answer: 'purple' },
    { id: 'c4', type: 'choice', prompt: 'Tap the COLOR', visual: { type: 'text', content: 'ORANGE', color: 'text-blue-500', size: 'text-7xl' }, options: [{ label: 'Orange', val: 'orange' }, { label: 'Blue', val: 'blue' }], answer: 'blue' },
    { id: 'v1', type: 'choice', prompt: 'Swipe OPPOSITE', visual: { type: 'icon_arrow', dir: 'right' }, options: [{ label: 'Left', val: 'left' }, { label: 'Right', val: 'right' }], answer: 'left' },
    { id: 'v2', type: 'choice', prompt: 'Swipe WITH arrow', visual: { type: 'icon_arrow', dir: 'left' }, options: [{ label: 'Left', val: 'left' }, { label: 'Right', val: 'right' }], answer: 'left' },
    { id: 'v3', type: 'choice', prompt: 'Which is BIGGER?', visual: { type: 'trap_size' }, options: [{ label: '🐘', val: 'elephant' }, { label: '🐁', val: 'mouse' }], answer: 'elephant' },
    { id: 'v4', type: 'choice', prompt: 'Fastest Speed?', visual: { type: 'text', content: '⚡ vs 🔊', color: 'text-white', size: 'text-6xl' }, options: [{ label: 'Light', val: 'light' }, { label: 'Sound', val: 'sound' }], answer: 'light' },
    
    // --- MATH & LOGIC (11-25) ---
    { id: 'm1', type: 'choice', prompt: '50 divided by half', visual: { type: 'text', content: '50 / 0.5', color: 'text-white', size: 'text-6xl' }, options: [{ label: '25', val: '25' }, { label: '100', val: '100' }], answer: '100' },
    { id: 'm2', type: 'choice', prompt: 'Quick Math', visual: { type: 'text', content: '12 x 12', color: 'text-white', size: 'text-6xl' }, options: [{ label: '144', val: '144' }, { label: '124', val: '124' }], answer: '144' },
    { id: 'm3', type: 'choice', prompt: 'Solve', visual: { type: 'text', content: '5 + 5 x 5', color: 'text-blue-400', size: 'text-6xl' }, options: [{ label: '30', val: '30' }, { label: '50', val: '50' }], answer: '30' },
    { id: 'm4', type: 'choice', prompt: 'Square Root', visual: { type: 'text', content: '√81', color: 'text-white', size: 'text-7xl' }, options: [{ label: '9', val: '9' }, { label: '8', val: '8' }], answer: '9' },
    { id: 'm5', type: 'choice', prompt: 'Binary for 5', visual: { type: 'text', content: '101', color: 'text-green-500', size: 'text-6xl' }, options: [{ label: '3', val: '3' }, { label: '5', val: '5' }], answer: '5' },
    { id: 'l1', type: 'choice', prompt: 'Days in Feb?', visual: { type: 'text', content: '📅', color: 'text-white', size: 'text-8xl' }, options: [{ label: '28/29', val: 'correct' }, { label: '30', val: 'wrong' }], answer: 'correct' },
    { id: 'l2', type: 'choice', prompt: 'Pure Black?', visual: { type: 'text', content: '#000 vs #111', color: 'text-gray-500', size: 'text-5xl' }, options: [{ label: '#000', val: '0' }, { label: '#111', val: '1' }], answer: '0' },
    
    // --- INTERACTIVE: MASHERS (26-30) ---
    { id: 'act_m1', type: 'mash', prompt: 'OVERLOAD SYSTEM', visual: { type: 'icon', icon: Zap, color: 'text-yellow-400' }, data: { target: 8 } },
    { id: 'act_m2', type: 'mash', prompt: 'BREAK ENCRYPTION', visual: { type: 'icon', icon: Lock, color: 'text-red-500' }, data: { target: 6 } },
    { id: 'act_m3', type: 'mash', prompt: 'CHARGE BATTERY', visual: { type: 'icon', icon: Fingerprint, color: 'text-green-500' }, data: { target: 10 } },

    // --- INTERACTIVE: SLIDERS (31-35) ---
    { id: 'act_s1', type: 'slider', prompt: 'SET TO 75%', visual: { type: 'text', content: '75', color: 'text-white' }, data: { target: 75, tolerance: 5 } },
    { id: 'act_s2', type: 'slider', prompt: 'SET TO 20%', visual: { type: 'text', content: '20', color: 'text-blue-400' }, data: { target: 20, tolerance: 5 } },
    { id: 'act_s3', type: 'slider', prompt: 'CALIBRATE: 50%', visual: { type: 'text', content: '50', color: 'text-green-400' }, data: { target: 50, tolerance: 3 } },

    // --- INTERACTIVE: TOGGLES (36-40) ---
    { id: 'act_t1', type: 'toggles', prompt: 'MAKE SUM 6', visual: { type: 'text', content: '4 + 2', color: 'text-white' }, data: { values: [8, 4, 2, 1], targetSum: 6 } },
    { id: 'act_t2', type: 'toggles', prompt: 'MAKE SUM 9', visual: { type: 'text', content: '8 + 1', color: 'text-white' }, data: { values: [8, 4, 2, 1], targetSum: 9 } },
    
    // --- INTERACTIVE: MEMORY (41-45) ---
    { id: 'act_seq1', type: 'sequence', prompt: 'REPEAT PATTERN', visual: { type: 'text', content: '👀', color: 'text-white' }, data: { sequence: ['red', 'blue', 'red'] } },
    { id: 'act_seq2', type: 'sequence', prompt: 'REPEAT PATTERN', visual: { type: 'text', content: '🧠', color: 'text-white' }, data: { sequence: ['green', 'yellow', 'green'] } },
  ];

  return puzzles.sort(() => Math.random() - 0.5).slice(0, 15); // Return random 15 per match
};

// --- UTILS ---
const playHaptic = (type: 'good' | 'bad' | 'click') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (type === 'good') navigator.vibrate(20);
    if (type === 'bad') navigator.vibrate([40, 50, 40]);
    if (type === 'click') navigator.vibrate(5);
  }
};

export default function ArenaPage() {
  const [view, setView] = useState<GameState>('matching');
  const [deck, setDeck] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  
  // Game Stats
  const [tugValue, setTugValue] = useState(50); 
  const [timeLeft, setTimeLeft] = useState(45);
  const [combo, setCombo] = useState(0);
  
  // Interaction State
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [mashCount, setMashCount] = useState(0);
  const [sliderVal, setSliderVal] = useState(50);
  const [toggles, setToggles] = useState([false, false, false, false]);
  const [seqInput, setSeqInput] = useState<string[]>([]);
  const [showSeq, setShowSeq] = useState(false);

  // Result State
  const [stats, setStats] = useState({ correct: 0, total: 0, speedSum: 0 });
  const [finisherState, setFinisherState] = useState<'pending' | 'roasted' | 'spared'>('pending');
  
  const questionStartTime = useRef<number>(0);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- INIT ---
  useEffect(() => {
    setDeck(generateBattleDeck());
    const matchTimer = setTimeout(() => {
        setView('playing');
        questionStartTime.current = Date.now();
    }, 3000); 
    return () => clearTimeout(matchTimer);
  }, []);

  // --- GAME CLOCK ---
  useEffect(() => {
    if (view === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (tugValue > 50) setView('victory_splash'); else setView('defeat_glitch'); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [view, tugValue]);

  // --- END STATES TRANSITIONS ---
  useEffect(() => {
    if (view === 'victory_splash') {
        confetti({ particleCount: 150, spread: 70, colors: ['#F04E23', '#FFF'] });
        setTimeout(() => setView('win'), 2500);
    } else if (view === 'defeat_glitch') {
        playHaptic('bad');
        setTimeout(() => setView('loss'), 2000);
    }
  }, [view]);

  // --- BOT SIMULATION ---
  useEffect(() => {
    if (view === 'playing') {
        const scheduleBot = () => {
            let min = 800; let max = 1800;
            if (tugValue > 70) { min = 500; max = 1000; } 
            else if (tugValue < 30) { min = 1500; max = 2500; }
            const delay = Math.random() * (max - min) + min;

            botTimeoutRef.current = setTimeout(() => {
                setTugValue(prev => {
                    const newVal = prev - (Math.floor(Math.random() * 5) + 8);
                    if (newVal <= 0) { setView('defeat_glitch'); return 0; }
                    return newVal;
                });
                scheduleBot();
            }, delay);
        };
        scheduleBot();
        return () => { if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current); };
    }
  }, [view, tugValue]);

  // --- SHARED SUCCESS/FAIL LOGIC ---
  const handleSuccess = () => {
    const speed = Date.now() - questionStartTime.current;
    playHaptic('good');
    setCombo(c => c + 1);
    setStats(p => ({ correct: p.correct + 1, total: p.total + 1, speedSum: p.speedSum + speed }));
    
    setTugValue(prev => {
        const next = prev + (18 + Math.min(combo * 2, 12));
        if (next >= 100) { setView('victory_splash'); return 100; }
        return next;
    });

    nextQuestion();
  };

  const handleFail = () => {
    playHaptic('bad');
    setCombo(0);
    setTugValue(prev => Math.max(prev - 15, 0));
    setStats(p => ({ ...p, total: p.total + 1 }));
    nextQuestion();
  };

  const nextQuestion = () => {
    // Small delay to show result
    setTimeout(() => {
      setQIndex(prev => (prev + 1) % deck.length);
      // Reset Interactive States
      setSelectedOpt(null);
      setMashCount(0);
      setSliderVal(50);
      setToggles([false,false,false,false]);
      setSeqInput([]);
      setShowSeq(false);
      questionStartTime.current = Date.now();
    }, 200);
  };

  // --- INTERACTIVE HANDLERS ---
  const handleChoice = (val: string) => {
    setSelectedOpt(val);
    if (val === deck[qIndex].answer) handleSuccess(); else handleFail();
  };

  const handleMash = () => {
    playHaptic('click');
    const newCount = mashCount + 1;
    setMashCount(newCount);
    if (newCount >= deck[qIndex].data.target) handleSuccess();
  };

  const handleSliderRelease = () => {
    const target = deck[qIndex].data.target;
    if (Math.abs(sliderVal - target) <= deck[qIndex].data.tolerance) handleSuccess(); else handleFail();
  };

  const handleToggle = (i: number) => {
    playHaptic('click');
    const newT = [...toggles]; newT[i] = !newT[i];
    setToggles(newT);
    // Check sum
    const vals = deck[qIndex].data.values;
    const sum = newT.reduce((acc, v, idx) => acc + (v ? vals[idx] : 0), 0);
    if (sum === deck[qIndex].data.targetSum) handleSuccess();
  };

  // Sequence Logic
  useEffect(() => {
    if (deck[qIndex]?.type === 'sequence') {
        setShowSeq(true);
        setTimeout(() => setShowSeq(false), 2000);
    }
  }, [qIndex, deck]);

  const handleSeqInput = (col: string) => {
    if (showSeq) return;
    playHaptic('click');
    const newSeq = [...seqInput, col];
    setSeqInput(newSeq);
    const target = deck[qIndex].data.sequence;
    
    if (newSeq[newSeq.length-1] !== target[newSeq.length-1]) { handleFail(); return; }
    if (newSeq.length === target.length) handleSuccess();
  };

  const currentQ = deck[qIndex];
  const avgSpeed = stats.total > 0 ? (stats.speedSum / stats.total / 1000).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] flex flex-col relative overflow-hidden">
      
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      
      {/* --- VICTORY SPLASH --- */}
      <AnimatePresence>
        {view === 'victory_splash' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black px-4 overflow-hidden">
                <motion.div animate={{ backgroundColor: ["#000", "#F04E23", "#000", "#F04E23", "#F04E23"] }} transition={{ duration: 0.5 }} className="absolute inset-0"/>
                <motion.div initial={{ scale: 2 }} animate={{ scale: 1 }} className="relative z-10 text-center mix-blend-hard-light w-full">
                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-black leading-none break-words">VERDICT</h1>
                    <div className="bg-black text-[#F04E23] text-xl md:text-3xl font-mono font-bold px-6 py-2 inline-block transform -skew-x-12 mt-4">DELIVERED</div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- DEFEAT CRASH --- */}
      <AnimatePresence>
        {view === 'defeat_glitch' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black px-4 overflow-hidden">
                <motion.div animate={{ x: [-20, 20, -15, 15, 0], backgroundColor: ["#000", "#ef4444", "#000"] }} transition={{ duration: 0.4 }} className="absolute inset-0 opacity-20"/>
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1.1 }} className="relative z-10 text-center w-full">
                    <AlertTriangle size={60} className="text-red-500 mx-auto mb-6 animate-pulse" />
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-red-500 leading-none break-words">OVERRULED</h1>
                    <div className="mt-4 font-mono text-red-400 tracking-[0.5em] text-xs">SYSTEM FAILURE</div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-6 relative z-10 w-full max-w-2xl mx-auto py-8">
        
        {/* --- MATCHMAKING --- */}
        {view === 'matching' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col items-center">
              <div className="mb-8 scale-125 relative">
                  <div className="absolute -inset-6 border border-[#F04E23]/60 rounded-full animate-ping opacity-75"></div>
                  <div className="relative z-10"><Logo size="lg" /></div>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 uppercase tracking-widest backdrop-blur-md">
                 <Loader2 size={12} className="animate-spin text-[#F04E23]"/> Scanning Arena...
              </div>
           </motion.div>
        )}

        {/* --- BATTLE ARENA --- */}
        {view === 'playing' && currentQ && (
          <div className="w-full flex flex-col gap-6 h-full justify-between pb-8">
            <header className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3 opacity-70"><Skull size={18} className="text-gray-400" /><div className="hidden md:block font-bold text-gray-500 uppercase text-[10px]">KillerMike</div></div>
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#111] rounded-xl border border-white/10"><span className={`text-xl font-black ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}</span></div>
                <div className="flex items-center gap-3"><div className="hidden md:block text-right font-bold text-gray-500 uppercase text-[10px]">You</div><Fingerprint size={18} className="text-[#F04E23]" /></div>
            </header>

            <div className="w-full px-2">
                <div className="w-full h-4 bg-[#111] rounded-full overflow-hidden relative border border-white/5">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-20"></div>
                    <motion.div className="h-full bg-[#F04E23]" animate={{ width: `${tugValue}%`, boxShadow: tugValue > 70 ? "0 0 30px #F04E23" : "0 0 0px #000" }} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentQ.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                    className="w-full bg-[#0F0F0F] border border-white/10 p-6 rounded-3xl shadow-2xl relative min-h-[350px] flex flex-col items-center justify-center text-center"
                >
                    <div className="absolute top-4"><span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest border border-white/10 bg-white/5 px-3 py-1 rounded-full">{currentQ.prompt}</span></div>
                    
                    {/* --- DYNAMIC PUZZLE RENDERING --- */}
                    
                    {/* 1. CHOICE */}
                    {currentQ.type === 'choice' && (
                        <>
                            <div className="flex-grow flex items-center justify-center">
                                {currentQ.visual.type === 'trap_size' ? (
                                    <div className="flex items-end gap-8 scale-125"><span className="text-6xl grayscale">🐁</span><span className="text-3xl grayscale">🐘</span></div>
                                ) : currentQ.visual.type === 'icon_arrow' ? (
                                    <ArrowRight size={80} className={`text-white transform ${currentQ.visual.dir === 'left' ? 'rotate-180' : ''}`} />
                                ) : (
                                    <h2 className={`${currentQ.visual.size || 'text-5xl'} font-black tracking-tighter ${currentQ.visual.color}`}>{currentQ.visual.content}</h2>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {currentQ.options?.map((opt: any, i: number) => (
                                    <button key={i} onClick={() => handleChoice(opt.val)} className="h-20 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-lg hover:bg-white hover:text-black transition-all">{opt.label}</button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* 2. MASH */}
                    {currentQ.type === 'mash' && (
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <button onPointerDown={handleMash} className="w-40 h-40 rounded-full bg-[#F04E23] border-4 border-white text-black font-black text-3xl shadow-[0_0_40px_#F04E23] active:scale-90 transition-transform flex flex-col items-center justify-center">
                                TAP! <span className="text-xs font-mono">{mashCount}/{currentQ.data.target}</span>
                            </button>
                        </div>
                    )}

                    {/* 3. SLIDER */}
                    {currentQ.type === 'slider' && (
                        <div className="flex flex-col items-center justify-center h-full gap-8 w-full px-4">
                            <div className="text-6xl font-black">{sliderVal}%</div>
                            <input type="range" min="0" max="100" value={sliderVal} onChange={(e)=>setSliderVal(parseInt(e.target.value))} onMouseUp={handleSliderRelease} onTouchEnd={handleSliderRelease} className="w-full h-12 bg-gray-800 rounded-lg appearance-none accent-[#F04E23]" />
                            <div className="text-xs font-mono text-gray-500">TARGET: {currentQ.data.target}%</div>
                        </div>
                    )}

                    {/* 4. TOGGLES */}
                    {currentQ.type === 'toggles' && (
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <div className="flex gap-4">
                                {toggles.map((on, i) => (
                                    <button key={i} onClick={() => handleToggle(i)} className={`w-14 h-20 rounded-lg border-2 ${on ? 'bg-[#F04E23] border-[#F04E23]' : 'bg-black border-white/20'}`}>
                                        <span className="text-xs font-mono text-white/50">{currentQ.data.values[i]}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="text-xl font-mono">SUM: {toggles.reduce((acc, v, i) => acc + (v ? currentQ.data.values[i] : 0), 0)}</div>
                        </div>
                    )}

                    {/* 5. SEQUENCE */}
                    {currentQ.type === 'sequence' && (
                        <div className="flex flex-col items-center justify-center h-full gap-6 w-full">
                            <div className="flex gap-3 h-12">
                                {showSeq ? currentQ.data.sequence.map((c: string, i: number) => (
                                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} />
                                )) : <span className="font-mono text-gray-500 animate-pulse">REPLICATE...</span>}
                            </div>
                            <div className="grid grid-cols-4 gap-2 w-full">
                                {['red', 'blue', 'green', 'yellow'].map(c => (
                                    <button key={c} onClick={() => handleSeqInput(c)} className="h-16 rounded-xl border border-white/10" style={{ backgroundColor: c === 'red' ? '#ef4444' : c === 'blue' ? '#3b82f6' : c === 'green' ? '#22c55e' : '#eab308' }} />
                                ))}
                            </div>
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* --- VIEW 3: WIN SCREEN --- */}
        {view === 'win' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center bg-[#0F0F0F] p-8 rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(240,78,35,0.15)] overflow-hidden">
                 <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F04E23]/10 border border-[#F04E23]/30 rounded-full mb-6"><Crown size={14} className="text-[#F04E23]" /><span className="text-[10px] font-black tracking-[0.3em] text-[#F04E23] uppercase">Case Closed</span></div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 text-white leading-none">VERDICT:<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F04E23] to-yellow-500">ABSOLUTE</span></h2>
                    <div className="bg-[#111] p-5 rounded-2xl border border-white/5 mb-8 text-left">
                        <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-mono text-gray-500 uppercase">Neural Speed</span><span className="text-xs font-black text-green-500">{avgSpeed}s</span></div>
                        <p className="text-gray-400 text-sm italic">"You processed logic <span className="text-white font-bold">88% faster</span>. Synaptic response verified."</p>
                    </div>
                    <AnimatePresence mode="wait">
                        {finisherState === 'pending' ? (
                            <motion.div key="choices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="grid grid-cols-2 gap-3">
                                <button onClick={() => setFinisherState('roasted')} className="group h-24 bg-black border border-red-900/40 rounded-2xl flex flex-col items-center justify-center hover:border-red-500"><Skull size={20} className="text-red-600 mb-2" /><span className="text-xs font-black text-red-500 uppercase tracking-widest">Roast</span></button>
                                <button onClick={() => setFinisherState('spared')} className="group h-24 bg-white text-black rounded-2xl flex flex-col items-center justify-center hover:bg-gray-200"><Shield size={20} className="text-black mb-2" /><span className="text-xs font-black uppercase tracking-widest">Spare</span></button>
                            </motion.div>
                        ) : (
                            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-2xl border text-left ${finisherState === 'roasted' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                <p className="text-white text-sm font-mono italic">{finisherState === 'roasted' ? "\"Switch to coloring books. Logic isn't for you.\"" : "\"Mercy granted. Reputation increased.\""}</p>
                                <button onClick={() => window.location.reload()} className="w-full mt-6 h-12 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest">Hunt Next Victim</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </div>
            </motion.div>
        )}

        {/* --- VIEW 4: LOSS SCREEN --- */}
        {view === 'loss' && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md bg-[#0F0F0F] p-8 rounded-3xl border border-white/10">
                <Brain size={40} className="text-gray-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black uppercase tracking-tight mb-2 text-white">CALCULATION<br/>ERROR</h2>
                <div className="mb-8 mt-6 p-4 border-l-2 border-[#F04E23] bg-[#F04E23]/5 rounded-r-lg text-left">
                     <p className="text-gray-300 text-sm italic">"Your logic was sound, but reaction time lagged. <strong className="text-white">Prove it was a fluke.</strong>"</p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full h-14 bg-[#111] hover:bg-white hover:text-black border border-white/20 rounded-xl font-bold text-sm uppercase tracking-widest transition-all text-white flex items-center justify-center gap-2">Redeem Honor <ArrowRight size={16}/></button>
             </motion.div>
        )}

      </main>
    </div>
  );
}