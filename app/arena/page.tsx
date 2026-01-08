'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, X, Loader2, Brain, Zap, Fingerprint, Trophy, 
  Skull, Clock, TrendingUp, Target, Crown, Shield, MessageSquare, 
  AlertTriangle, Lock, GripVertical, Eye, Smile, Frown, Search, FileText,
  Terminal, Code, Hash, Flame, Activity // <--- Added Activity Here
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from '@/app/components/shared'; 

// --- TYPES ---
type GameState = 'matching' | 'playing' | 'victory_splash' | 'defeat_glitch' | 'win' | 'loss';
type PuzzleType = 'choice' | 'mash' | 'slider' | 'toggles' | 'sequence' | 'reorder' | 'social' | 'crime' | 'observation';

interface Question {
  id: string;
  type: PuzzleType;
  prompt: string;
  visual: any; 
  data?: any; 
  options?: { label: string; val: string }[];
  answer?: string; 
}

// --- UTILS ---
const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

const playHaptic = (type: 'good' | 'bad' | 'click') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (type === 'good') navigator.vibrate(20);
    if (type === 'bad') navigator.vibrate([40, 50, 40]);
    if (type === 'click') navigator.vibrate(5);
  }
};

// --- 1. THE BATTLE DECK ---
const generateBattleDeck = (): Question[] => {
  const puzzles: Question[] = [
    // ... (Keeping the same puzzle deck as before for brevity) ...
    { 
      id: 'cyb_1', type: 'choice', prompt: 'CLOSE THE TAG', 
      visual: { type: 'code', content: '<div>...?' }, 
      options: [{ label: '</div>', val: 'correct' }, { label: '<end>', val: 'wrong' }], 
      answer: 'correct' 
    },
    { 
      id: 'cyb_4', type: 'choice', prompt: 'WHICH IS BLACK?', 
      visual: { type: 'text', content: '#000 vs #FFF', color: 'text-white' }, 
      options: [{ label: '#000', val: 'correct' }, { label: '#FFF', val: 'wrong' }], 
      answer: 'correct' 
    },
    { 
      id: 'abs_1', type: 'choice', prompt: 'COMPLETE PATTERN', 
      visual: { type: 'text', content: '3, 6, 9, ?', color: 'text-blue-400' }, 
      options: [{ label: '11', val: 'wrong' }, { label: '12', val: 'correct' }], 
      answer: 'correct' 
    },
    { 
      id: 'obs_1', type: 'observation', prompt: 'MEMORIZE SCENE', 
      visual: { imageUrl: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=800&auto=format&fit=crop', question: 'WAS THERE AN APPLE?' }, 
      options: [{ label: 'YES', val: 'correct' }, { label: 'NO', val: 'wrong' }], answer: 'correct' 
    },
    { id: 'crime_1', type: 'crime', prompt: 'BREAK THE ALIBI', visual: { type: 'fact', content: 'FACT: It is raining.' }, options: [{ label: '"My coat is dry"', val: 'liar' }, { label: '"I used an umbrella"', val: 'truth' }], answer: 'liar' },
    { id: 'act_m1', type: 'mash', prompt: 'OVERLOAD SYSTEM', visual: { type: 'icon', icon: Zap, color: 'text-yellow-400' }, data: { target: 8 } },
    { id: 'act_s1', type: 'slider', prompt: 'SET TO 75%', visual: { type: 'text', content: '75', color: 'text-white' }, data: { target: 75, tolerance: 5 } },
    { id: 'ord_1', type: 'reorder', prompt: 'SMALLEST TO LARGEST', visual: { type: 'text', content: 'SORT', color: 'text-blue-400' }, data: { items: ['Atom', 'Human', 'Planet'], correct: ['Atom', 'Human', 'Planet'] } },
  ];

  return puzzles.sort(() => Math.random() - 0.5).slice(0, 15);
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
  const [reorderList, setReorderList] = useState<string[]>([]);

  // Observation State
  const [obsPhase, setObsPhase] = useState<'view' | 'flash' | 'quiz'>('view'); 

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

  // --- RESET STATE ON QUESTION CHANGE ---
  useEffect(() => {
    const currentQ = deck[qIndex];
    if (currentQ) {
        setSelectedOpt(null);
        setMashCount(0);
        setSliderVal(50);
        setToggles([false, false, false, false]);
        setSeqInput([]);
        setShowSeq(false);
        if (currentQ.type === 'reorder') setReorderList([...shuffleArray(currentQ.data.items)]);
        if (currentQ.type === 'sequence') {
            setShowSeq(true);
            setTimeout(() => setShowSeq(false), 2000);
        }
        
        // OBSERVATION LOGIC
        if (currentQ.type === 'observation') {
            setObsPhase('view');
            const viewTimer = setTimeout(() => {
                setObsPhase('flash');
                playHaptic('click');
                const flashTimer = setTimeout(() => {
                    setObsPhase('quiz');
                }, 500); 
                return () => clearTimeout(flashTimer);
            }, 3000); 
            return () => clearTimeout(viewTimer);
        }
    }
  }, [qIndex, deck]);

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

  // --- END STATES ---
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

  // --- HANDLERS ---
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
    setTimeout(() => {
      setQIndex(prev => (prev + 1) % deck.length);
      questionStartTime.current = Date.now();
    }, 200);
  };

  // Specific Handlers
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
    if (Math.abs(sliderVal - deck[qIndex].data.target) <= deck[qIndex].data.tolerance) handleSuccess(); else handleFail();
  };

  const handleToggle = (i: number) => {
    playHaptic('click');
    const newT = [...toggles]; newT[i] = !newT[i];
    setToggles(newT);
    const sum = newT.reduce((acc, v, idx) => acc + (v ? deck[qIndex].data.values[idx] : 0), 0);
    if (sum === deck[qIndex].data.targetSum) handleSuccess();
  };

  const handleSeqInput = (col: string) => {
    if (showSeq) return;
    playHaptic('click');
    const newSeq = [...seqInput, col];
    setSeqInput(newSeq);
    const target = deck[qIndex].data.sequence;
    if (newSeq[newSeq.length-1] !== target[newSeq.length-1]) { handleFail(); return; }
    if (newSeq.length === target.length) handleSuccess();
  };

  const handleReorderSwap = (idx: number) => {
    playHaptic('click');
    const newList = [...reorderList];
    const swapIdx = idx === newList.length - 1 ? 0 : idx + 1;
    [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
    setReorderList(newList);
    if (JSON.stringify(newList) === JSON.stringify(deck[qIndex].data.correct)) handleSuccess();
  };

  const currentQ = deck[qIndex];
  const avgSpeed = stats.total > 0 ? (stats.speedSum / stats.total / 1000).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] flex flex-col relative overflow-hidden">
      
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none"></div>

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
                    className="w-full bg-[#0F0F0F] border border-white/10 p-6 rounded-3xl shadow-2xl relative min-h-[350px] flex flex-col items-center justify-center text-center overflow-hidden"
                >
                    <div className="absolute top-4 z-10">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest border px-3 py-1 rounded-full 
                            ${currentQ.type === 'crime' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' : 
                              currentQ.type === 'observation' ? 'border-purple-500/50 text-purple-500 bg-purple-500/10' :
                              'border-white/10 text-gray-400 bg-white/5'}`}>
                            {currentQ.type === 'observation' && obsPhase !== 'quiz' ? 'OBSERVE!' : currentQ.prompt}
                        </span>
                    </div>
                    
                    {/* --- DYNAMIC PUZZLE RENDERING --- */}

                    {/* 1. OBSERVATION (MEMORY FLASH) */}
                    {currentQ.type === 'observation' && (
                        <>
                            {obsPhase === 'view' && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="w-full h-64 relative rounded-xl overflow-hidden mb-4"
                                >
                                    <img src={currentQ.visual.imageUrl} alt="Observe" className="w-full h-full object-cover" />
                                    <motion.div 
                                        className="absolute bottom-0 left-0 h-1 bg-white"
                                        initial={{ width: "100%" }} animate={{ width: "0%" }}
                                        transition={{ duration: 3, ease: "linear" }}
                                    />
                                </motion.div>
                            )}
                            {obsPhase === 'flash' && (
                                <motion.div 
                                    animate={{ backgroundColor: ["#000", "#F04E23", "#000", "#F04E23"] }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 z-20 flex items-center justify-center"
                                />
                            )}
                            {obsPhase === 'quiz' && (
                                <div className="w-full flex flex-col h-full animate-in fade-in zoom-in duration-300">
                                    <div className="flex-grow flex flex-col items-center justify-center mb-6">
                                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4"><Brain size={32} className="text-purple-500" /></div>
                                        <h2 className="text-3xl font-black tracking-tighter leading-none break-words max-w-full px-2">{currentQ.visual.question}</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        {currentQ.options?.map((opt: any, i: number) => (
                                            <button key={i} onClick={() => handleChoice(opt.val)} className="h-20 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-lg hover:bg-white hover:text-black transition-all">{opt.label}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* 2. STANDARD VISUALS (Choice, Crime, Social) */}
                    {(currentQ.type === 'choice' || currentQ.type === 'social' || currentQ.type === 'crime') && (
                        <>
                            <div className="flex-grow flex items-center justify-center w-full">
                                {currentQ.visual.type === 'code' ? (
                                    <div className="bg-black/50 p-6 rounded-lg border border-green-500/30 font-mono text-green-400 text-3xl font-bold shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                        <div className="flex items-center gap-2 text-xs text-green-700 mb-2"><Terminal size={12}/> bash</div>
                                        {currentQ.visual.content}
                                    </div>
                                ) : currentQ.visual.type === 'trap_size' ? (
                                    <div className="flex items-end gap-8 scale-125"><span className="text-6xl grayscale">🐁</span><span className="text-3xl grayscale">🐘</span></div>
                                ) : currentQ.visual.type === 'icon_arrow' ? (
                                    <ArrowRight size={80} className={`text-white transform ${currentQ.visual.dir === 'left' ? 'rotate-180' : ''}`} />
                                ) : currentQ.visual.type === 'grid' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {currentQ.visual.items.map((item: string, i: number) => <div key={i} className="text-4xl font-black">{item}</div>)}
                                    </div>
                                ) : currentQ.visual.type === 'fact' ? (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl transform -rotate-1">
                                        <div className="flex items-center gap-2 mb-2 text-yellow-500"><Search size={16} /><span className="text-xs font-black uppercase">Evidence</span></div>
                                        <p className="text-xl font-bold text-white font-mono">{currentQ.visual.content}</p>
                                    </div>
                                ) : currentQ.visual.type === 'chat' ? (
                                    <div className="bg-[#222] p-4 rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-none text-left max-w-[90%] border border-white/10">
                                        <p className="text-xs text-gray-500 mb-1">{currentQ.visual.sender}</p>
                                        <p className="text-lg font-medium">"{currentQ.visual.msg}"</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        {currentQ.visual.icon && <currentQ.visual.icon size={64} className={`${currentQ.visual.color}`} />}
                                        <h2 className={`${currentQ.visual.size || 'text-5xl'} font-black tracking-tighter ${currentQ.visual.color}`}>{currentQ.visual.content}</h2>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {currentQ.options?.map((opt: any, i: number) => (
                                    <button key={i} onClick={() => handleChoice(opt.val)} className="h-20 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-lg hover:bg-white hover:text-black transition-all">{opt.label}</button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* 3. REORDER (Drag Sim) */}
                    {currentQ.type === 'reorder' && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 w-full">
                            {reorderList.map((item, i) => (
                                <button key={i} onClick={() => handleReorderSwap(i)} className="w-full h-16 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-between px-4 active:bg-white/10">
                                    <span className="font-bold">{item}</span>
                                    <GripVertical size={16} className="text-gray-600" />
                                </button>
                            ))}
                            <p className="text-[10px] text-gray-500 mt-2">TAP TO SWAP ORDER</p>
                        </div>
                    )}

                    {/* 4. MASH */}
                    {currentQ.type === 'mash' && (
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <currentQ.visual.icon size={64} className={`${currentQ.visual.color} mb-4`} />
                            <button onPointerDown={handleMash} className="w-40 h-40 rounded-full bg-[#F04E23] border-4 border-white text-black font-black text-3xl shadow-[0_0_40px_#F04E23] active:scale-90 transition-transform flex flex-col items-center justify-center">
                                TAP! <span className="text-xs font-mono">{mashCount}/{currentQ.data.target}</span>
                            </button>
                        </div>
                    )}

                    {/* 5. SLIDER */}
                    {currentQ.type === 'slider' && (
                        <div className="flex flex-col items-center justify-center h-full gap-8 w-full px-4">
                            <div className="text-6xl font-black">{sliderVal}%</div>
                            <input type="range" min="0" max="100" value={sliderVal} onChange={(e)=>setSliderVal(parseInt(e.target.value))} onMouseUp={handleSliderRelease} onTouchEnd={handleSliderRelease} className="w-full h-12 bg-gray-800 rounded-lg appearance-none accent-[#F04E23]" />
                            <div className="text-xs font-mono text-gray-500">TARGET: {currentQ.data.target}%</div>
                        </div>
                    )}

                    {/* 6. TOGGLES */}
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

                    {/* 7. SEQUENCE */}
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

        {/* --- VIEW 3: JUDGMENT (WIN SCREEN) --- */}
        {view === 'win' && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                className="w-full max-w-md text-center bg-[#080808] p-8 rounded-[2.5rem] border border-white/5 shadow-[0_0_100px_rgba(240,78,35,0.1)] relative overflow-hidden"
            >
                {/* Decorative Background Watermark */}
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <span className="text-9xl font-black italic transform -rotate-12 select-none">JUDGE</span>
                </div>

                <div className="relative z-10">
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F04E23]/10 border border-[#F04E23]/30 rounded-full mb-8 backdrop-blur-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F04E23] animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-[#F04E23] uppercase">Dominance Verified</span>
                    </div>

                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 text-white leading-tight">
                        VERDICT:<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">ABSOLUTE</span>
                    </h2>

                    {/* Performance Analysis Card */}
                    <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-2xl border border-white/5 mb-8 text-left relative group">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <Activity size={16} />
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Neural Delta</span>
                            <span className="text-xs font-black text-green-500">+{stats.correct * 10} IQ</span>
                        </div>
                        <p className="text-gray-400 text-sm italic leading-relaxed">
                            "Subject neutralized. Your synaptic response time of <span className="text-white font-bold">{avgSpeed}s</span> exceeds the 99th percentile."
                        </p>
                    </div>

                    {/* FATE SELECTION */}
                    <AnimatePresence mode="wait">
                        {finisherState === 'pending' ? (
                            <motion.div 
                                key="choices"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-4"
                            >
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] mb-4">Determine Opponent's Fate</p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {/* ROAST (Aggressive) */}
                                    <button 
                                        onClick={() => setFinisherState('roasted')}
                                        className="group relative h-32 bg-black border border-red-900/30 rounded-3xl flex flex-col items-center justify-center transition-all hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                                    >
                                        <div className="absolute inset-0 bg-red-500/[0.02] opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity" />
                                        <Skull size={28} className="text-red-600 mb-2 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                                        <span className="text-xs font-black text-red-500 uppercase tracking-widest">Roast</span>
                                        <span className="text-[8px] text-red-900 font-mono mt-1 group-hover:text-red-500 transition-colors">+20 Infamy</span>
                                    </button>

                                    {/* SPARE (Noble) */}
                                    <button 
                                        onClick={() => setFinisherState('spared')}
                                        className="group relative h-32 bg-white text-black rounded-3xl flex flex-col items-center justify-center transition-all hover:bg-gray-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                                    >
                                        <Shield size={28} className="text-black mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-black uppercase tracking-widest">Spare</span>
                                        <span className="text-[8px] text-gray-500 font-mono mt-1 group-hover:text-gray-800 transition-colors">+10 Honor</span>
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-6 rounded-3xl border text-left relative overflow-hidden ${
                                    finisherState === 'roasted' 
                                    ? 'bg-red-500/5 border-red-500/20' 
                                    : 'bg-green-500/5 border-green-500/20'
                                }`}
                            >
                                <div className={`flex items-center gap-2 mb-3 ${finisherState === 'roasted' ? 'text-red-500' : 'text-green-500'}`}>
                                    {finisherState === 'roasted' ? <MessageSquare size={14}/> : <Shield size={14}/>}
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {finisherState === 'roasted' ? 'Transmission Logged' : 'Reputation Enhanced'}
                                    </span>
                                </div>
                                
                                <p className="text-white text-sm font-mono leading-relaxed italic">
                                    {finisherState === 'roasted' 
                                        ? "\"Transmission sent: 'Switch to coloring books. Logic is clearly not your primary function.' Infamy increased.\"" 
                                        : "\"You granted mercy. Your standing as a Master Architect has been broadcast to the network.\""}
                                </p>

                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="w-full mt-6 h-14 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#F04E23] hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    Next Victim <ArrowRight size={14} />
                                </button>
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