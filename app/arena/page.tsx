'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, X, Loader2, Brain, Zap, Fingerprint, Trophy, 
  Skull, Clock, TrendingUp, Target, Crown, Shield, MessageSquare, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from '@/app/components/shared'; 

// --- TYPES ---
type GameState = 'matching' | 'playing' | 'victory_splash' | 'defeat_glitch' | 'win' | 'loss';

// --- 1. QUESTION POOL (Updated visual sizes for mobile) ---
const BATTLE_QUESTIONS = [
  { id: 'c1', prompt: 'Tap the COLOR of the text', visual: { type: 'text', content: 'GREEN', color: 'text-red-500', size: 'text-5xl md:text-7xl' }, options: [{ label: 'Green', val: 'green' }, { label: 'Red', val: 'red' }], answer: 'red' },
  { id: 'c2', prompt: 'Tap the COLOR of the text', visual: { type: 'text', content: 'BLUE', color: 'text-yellow-400', size: 'text-5xl md:text-7xl' }, options: [{ label: 'Blue', val: 'blue' }, { label: 'Yellow', val: 'yellow' }], answer: 'yellow' },
  { id: 'm1', prompt: '50 divided by half', visual: { type: 'text', content: '50 / 0.5', color: 'text-white', size: 'text-4xl md:text-6xl' }, options: [{ label: '25', val: '25' }, { label: '100', val: '100' }], answer: '100' },
  { id: 'v1', prompt: 'Swipe OPPOSITE to arrow', visual: { type: 'icon_arrow', dir: 'right' }, options: [{ label: 'Left', val: 'left' }, { label: 'Right', val: 'right' }], answer: 'left' },
  { id: 'l1', prompt: 'Which month has 28 days?', visual: { type: 'text', content: '📅', color: 'text-white', size: 'text-6xl md:text-8xl' }, options: [{ label: 'Feb', val: 'feb' }, { label: 'All', val: 'all' }], answer: 'all' },
];

// --- UTILS ---
const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

const playHaptic = (type: 'good' | 'bad') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (type === 'good') navigator.vibrate(20);
    if (type === 'bad') navigator.vibrate([50, 100, 50]);
  }
};

export default function ArenaPage() {
  const [view, setView] = useState<GameState>('matching');
  const [deck, setDeck] = useState<any[]>([]);
  const [qIndex, setQIndex] = useState(0);
  
  const [tugValue, setTugValue] = useState(50); 
  const [timeLeft, setTimeLeft] = useState(45);
  const [combo, setCombo] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  
  const [stats, setStats] = useState({ correct: 0, total: 0, speedSum: 0 });
  const [finisherState, setFinisherState] = useState<'pending' | 'roasted' | 'spared'>('pending');
  
  const questionStartTime = useRef<number>(0);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- INIT ---
  useEffect(() => {
    const fullDeck = shuffleArray(BATTLE_QUESTIONS);
    setDeck(fullDeck);
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

  // --- WIN SPLASH ---
  useEffect(() => {
    if (view === 'victory_splash') {
        confetti({ particleCount: 150, spread: 70, colors: ['#F04E23', '#FFF'] });
        const timer = setTimeout(() => setView('win'), 2500);
        return () => clearTimeout(timer);
    }
  }, [view]);

  // --- LOSS GLITCH ---
  useEffect(() => {
    if (view === 'defeat_glitch') {
        playHaptic('bad');
        const timer = setTimeout(() => setView('loss'), 2000);
        return () => clearTimeout(timer);
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

  // --- ANSWER LOGIC ---
  const handleAnswer = (val: string) => {
    if (!deck.length) return;
    setSelectedOpt(val);

    const now = Date.now();
    const speed = now - questionStartTime.current;
    const currentQ = deck[qIndex];
    const isCorrect = val === currentQ.answer;

    if (isCorrect) {
      playHaptic('good');
      setCombo(c => c + 1);
      setStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1, speedSum: prev.speedSum + speed }));

      setTugValue(prev => {
          const next = prev + (18 + Math.min(combo * 2, 12));
          if (next >= 100) { setView('victory_splash'); return 100; }
          return next;
      });

      setTimeout(() => {
          setQIndex(prev => (prev + 1) % deck.length);
          setSelectedOpt(null);
          questionStartTime.current = Date.now(); 
      }, 150);

    } else {
      playHaptic('bad');
      setCombo(0);
      setTugValue(prev => Math.max(prev - 15, 0)); 
      setStats(prev => ({ ...prev, total: prev.total + 1 })); 
      
      setTimeout(() => {
        setQIndex(prev => (prev + 1) % deck.length);
        setSelectedOpt(null);
        questionStartTime.current = Date.now();
      }, 150);
    }
  };

  const currentQ = deck[qIndex];
  const avgSpeed = stats.total > 0 ? (stats.speedSum / stats.total / 1000).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] flex flex-col relative overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none"></div>

      {/* === ANIMATION 1: VICTORY SPLASH (Responsive Text) === */}
      <AnimatePresence>
        {view === 'victory_splash' && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black px-4"
            >
                <motion.div 
                    animate={{ backgroundColor: ["#000", "#F04E23", "#000", "#F04E23", "#F04E23"] }}
                    transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] }}
                    className="absolute inset-0"
                />
                <motion.div 
                    initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center mix-blend-hard-light w-full"
                >
                    {/* Responsive Font Size: 6xl on mobile, 9xl on desktop */}
                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-black leading-none break-words">
                        VERDICT
                    </h1>
                    <div className="bg-black text-[#F04E23] text-xl md:text-3xl font-mono font-bold px-6 py-2 inline-block transform -skew-x-12 mt-4">
                        DELIVERED
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* === ANIMATION 2: DEFEAT CRASH (Responsive Text) === */}
      <AnimatePresence>
        {view === 'defeat_glitch' && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black px-4"
            >
                <motion.div 
                    animate={{ x: [-20, 20, -15, 15, -5, 5, 0], backgroundColor: ["#000", "#ef4444", "#000", "#000"] }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 opacity-20"
                />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.1, opacity: 1 }} 
                    className="relative z-10 text-center w-full"
                >
                    <AlertTriangle size={60} className="text-red-500 mx-auto mb-6 animate-pulse" />
                    {/* Responsive Font Size */}
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-red-500 leading-none break-words">
                        OVERRULED
                    </h1>
                    <div className="mt-4 font-mono text-red-400 tracking-[0.5em] text-xs">SYSTEM FAILURE</div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-6 relative z-10 w-full max-w-2xl mx-auto py-8">
        
        {/* === MATCHMAKING === */}
        {view === 'matching' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col items-center">
              <div className="mb-8 scale-125 relative">
                  <div className="absolute -inset-6 border border-[#F04E23]/60 rounded-full animate-ping opacity-75"></div>
                  <div className="relative z-10"><Logo size="lg" /></div>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 uppercase tracking-widest backdrop-blur-md">
                 <Loader2 size={12} className="animate-spin text-[#F04E23]"/>
                 Scanning Arena...
              </div>
           </motion.div>
        )}

        {/* === BATTLE ARENA === */}
        {view === 'playing' && currentQ && (
          <div className="w-full flex flex-col gap-6">
            <header className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3 opacity-70">
                    <Skull size={18} className="text-gray-400" />
                    <div className="hidden md:block font-bold text-gray-500 uppercase text-[10px]">KillerMike</div>
                </div>
                <div className={`flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 ${timeLeft < 10 ? 'border-red-500 bg-red-900/20' : 'border-white/10 bg-[#111]'}`}>
                    <span className={`text-xl md:text-2xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}</span>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">SEC</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right font-bold text-gray-500 uppercase text-[10px]">You</div>
                    <div className="w-10 h-10 bg-[#F04E23]/10 border border-[#F04E23]/50 rounded-xl flex items-center justify-center relative">
                        <Fingerprint size={18} className="text-[#F04E23]" />
                    </div>
                </div>
            </header>

            <div className="w-full px-2">
                <div className="w-full h-4 bg-[#111] rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-20"></div>
                    <motion.div 
                        className="h-full bg-[#F04E23]"
                        animate={{ width: `${tugValue}%`, boxShadow: tugValue > 70 ? "0 0 50px #F04E23, 0 0 20px #fff" : "0 0 15px #F04E23" }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentQ.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                    className="w-full bg-[#0F0F0F] border border-white/10 p-6 rounded-3xl shadow-2xl relative min-h-[280px] flex flex-col items-center justify-center text-center"
                >
                    <div className="absolute top-4">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest border border-white/10 bg-white/5 px-3 py-1 rounded-full">{currentQ.prompt}</span>
                    </div>
                    <div className="flex items-center justify-center w-full mt-4">
                        {currentQ.visual.type === 'trap_size' ? (
                            <div className="flex items-end gap-4 md:gap-8 transform scale-100 md:scale-110">
                                <span className="text-6xl md:text-8xl grayscale contrast-125">🐁</span>
                                <span className="text-3xl md:text-4xl grayscale contrast-125">🐘</span>
                            </div>
                        ) : currentQ.visual.type === 'icon_arrow' ? (
                            <ArrowRight size={80} className={`text-white transform transition-transform ${currentQ.visual.dir === 'left' ? 'rotate-180' : ''}`} />
                        ) : (
                            // Responsive Font Size for Question Text
                            <h2 className={`${currentQ.visual.size || 'text-4xl md:text-6xl'} font-black tracking-tighter ${currentQ.visual.color} leading-none break-words max-w-full px-2`}>
                                {currentQ.visual.content}
                            </h2>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-3 w-full">
                {currentQ.options.map((opt: any, idx: number) => (
                    <button 
                        key={idx} onClick={() => handleAnswer(opt.val)} 
                        disabled={selectedOpt !== null}
                        className={`h-20 md:h-24 rounded-2xl border transition-all duration-100 flex flex-col items-center justify-center relative group
                            ${selectedOpt === opt.val ? 'bg-white border-white text-black scale-95' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 active:scale-95'}`}
                    >
                        <span className="text-lg md:text-xl font-black uppercase tracking-tight z-10">{opt.label}</span>
                    </button>
                ))}
            </div>
          </div>
        )}

        {/* === VIEW 3: WIN SCREEN (Responsive) === */}
        {view === 'win' && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-md text-center bg-[#0F0F0F] p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(240,78,35,0.15)] overflow-hidden"
            >
                 <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F04E23]/10 border border-[#F04E23]/30 rounded-full mb-6">
                        <Crown size={14} className="text-[#F04E23]" />
                        <span className="text-[10px] font-black tracking-[0.3em] text-[#F04E23] uppercase">Case Closed</span>
                    </div>
                    
                    {/* Responsive Title */}
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white leading-none">
                        VERDICT:<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F04E23] to-yellow-500">ABSOLUTE</span>
                    </h2>
                    
                    <div className="bg-[#111] p-5 rounded-2xl border border-white/5 mb-8 text-left">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-mono text-gray-500 uppercase">Neural Speed</span>
                            <span className="text-xs font-black text-green-500">{avgSpeed}s</span>
                        </div>
                        <p className="text-gray-400 text-sm italic leading-relaxed">
                            "You processed the logic <span className="text-white font-bold">88% faster</span>. Synaptic response verified."
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {finisherState === 'pending' ? (
                            <motion.div key="choices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="grid grid-cols-2 gap-3">
                                <button onClick={() => setFinisherState('roasted')} className="group h-24 md:h-28 bg-black border border-red-900/40 rounded-2xl flex flex-col items-center justify-center transition-all hover:border-red-500">
                                    <Skull size={20} className="text-red-600 mb-2" />
                                    <span className="text-xs font-black text-red-500 uppercase tracking-widest">Roast</span>
                                </button>
                                <button onClick={() => setFinisherState('spared')} className="group h-24 md:h-28 bg-white text-black rounded-2xl flex flex-col items-center justify-center hover:bg-gray-200">
                                    <Shield size={20} className="text-black mb-2" />
                                    <span className="text-xs font-black uppercase tracking-widest">Spare</span>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-2xl border text-left ${finisherState === 'roasted' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                <p className="text-white text-sm font-mono leading-snug italic">
                                    {finisherState === 'roasted' ? "\"Switch to coloring books. Logic isn't for you.\"" : "\"Mercy granted. Reputation increased.\""}
                                </p>
                                <button onClick={() => window.location.reload()} className="w-full mt-6 h-12 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest">Hunt Next Victim</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </div>
            </motion.div>
        )}

        {/* === VIEW 4: LOSS SCREEN === */}
        {view === 'loss' && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md bg-[#0F0F0F] p-8 rounded-3xl border border-white/10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Brain size={40} className="text-gray-500" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tight mb-2 text-white">CALCULATION<br/>ERROR</h2>
                <div className="mb-8 mt-6 p-4 border-l-2 border-[#F04E23] bg-[#F04E23]/5 rounded-r-lg text-left">
                     <p className="text-gray-300 text-sm italic leading-relaxed">
                        "Your logic was sound, but reaction time lagged. <strong className="text-white">Prove it was a fluke.</strong>"
                     </p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full h-14 bg-[#111] hover:bg-white hover:text-black border border-white/20 rounded-xl font-bold text-sm uppercase tracking-widest transition-all text-white flex items-center justify-center gap-2">
                    Redeem Honor <ArrowRight size={16}/>
                </button>
             </motion.div>
        )}

      </main>
    </div>
  );
}