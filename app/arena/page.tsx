'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Loader2, Brain, Zap, Fingerprint, Crown, 
  Skull, Shield, MessageSquare, AlertTriangle, Search, 
  Terminal, Activity, Smartphone, Box
} from 'lucide-react';
import confetti from 'canvas-confetti';
import io, { Socket } from 'socket.io-client';

// --- TYPES ---
type GameState = 'matching' | 'playing' | 'victory_splash' | 'defeat_glitch' | 'win' | 'loss';
type PuzzleType = 'logic' | 'observation' | 'crime' | 'social';

interface Question {
  id: string;
  type: PuzzleType;
  prompt: string;
  visual: any; 
  options: { label: string; val: string }[];
  answer: string; 
}

// --- UTILS ---
const triggerHaptic = (type: string) => { 
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'heavy') navigator.vibrate(30);
        else if (type === 'success') navigator.vibrate([10, 30, 20]);
        else navigator.vibrate(10);
    }
};

const SOCKET_URL = 'http://localhost:3001'; 

export default function ArenaPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<'p1' | 'p2' | null>(null);

  const [view, setView] = useState<GameState>('matching');
  const [deck, setDeck] = useState<Question[]>([]); 
  const [qIndex, setQIndex] = useState(0);
  
  // Game Stats
  const [tugValue, setTugValue] = useState(50);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0, speedSum: 0 });
  
  // Interaction State
  const [obsPhase, setObsPhase] = useState<'view' | 'flash' | 'quiz'>('view'); 
  const [finisherState, setFinisherState] = useState<'pending' | 'roasted' | 'spared'>('pending');
  
  const questionStartTime = useRef<number>(0);

  // --- SOCKET INIT ---
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit('find_match');

    newSocket.on('match_found', (data) => {
        setRoomId(data.roomId);
        setMyRole(data.role); 
        setDeck(data.deck); 
        setView('playing');
        questionStartTime.current = Date.now();
    });

    newSocket.on('game_tick', (data) => {
        setTugValue(data.tugValue);
        setTimeLeft(data.timeLeft);
    });

    newSocket.on('game_over', ({ winnerId }) => {
        const isWinner = winnerId === newSocket.id;
        if (isWinner) {
            triggerHaptic('success');
            setView('victory_splash');
            setTimeout(() => setView('win'), 2500);
        } else {
            triggerHaptic('heavy');
            setView('defeat_glitch');
            setTimeout(() => setView('loss'), 2000);
        }
    });

    return () => { newSocket.disconnect(); };
  }, []);

  // --- RESET STATE ---
  useEffect(() => {
    const currentQ = deck[qIndex];
    if (currentQ) {
        if (currentQ.type === 'observation') {
            setObsPhase('view');
            setTimeout(() => {
                setObsPhase('flash');
                triggerHaptic('heavy');
                setTimeout(() => setObsPhase('quiz'), 500);
            }, 3000); 
        }
    }
  }, [qIndex, deck]);

  // --- HANDLERS ---
  const handleAnswer = (val: string) => {
    const currentQ = deck[qIndex];
    const isCorrect = val === currentQ.answer;
    
    if (isCorrect) {
        const speed = Date.now() - questionStartTime.current;
        triggerHaptic('success');
        setCombo(c => c + 1);
        setStats(p => ({ ...p, correct: p.correct + 1, speedSum: p.speedSum + speed }));
        if (socket && roomId) socket.emit('submit_success', { roomId, timeTaken: speed });
    } else {
        triggerHaptic('heavy');
        setCombo(0);
        setStats(p => ({ ...p, total: p.total + 1 }));
        if (socket && roomId) socket.emit('submit_fail', { roomId });
    }

    setTimeout(() => {
        setQIndex(prev => (prev + 1) % deck.length);
        questionStartTime.current = Date.now();
    }, 150);
  };

  // Mirror Logic: If I am P2, 0 is winning. So I visualize 100-val.
  const visualTug = myRole === 'p2' ? (100 - tugValue) : tugValue;
  const currentQ = deck[qIndex];
  const avgSpeed = stats.total > 0 ? (stats.speedSum / Math.max(stats.total, 1) / 1000).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] flex flex-col relative overflow-hidden select-none">
      
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none"></div>

      {/* --- MAIN CONTAINER (Added this tag to fix the error) --- */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-6 relative z-10 w-full max-w-2xl mx-auto py-8">

        {/* --- MATCHMAKING --- */}
        {view === 'matching' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col h-screen items-center justify-center">
                <div className="mb-8 scale-125 relative">
                    <div className="absolute -inset-6 border border-[#F04E23]/60 rounded-full animate-ping opacity-75"></div>
                    {/* Placeholder Logo if component missing */}
                    <div className="flex items-center gap-2 font-black text-3xl tracking-tighter">
                        <Box className="text-[#F04E23]" size={32} /> VERDICT
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 uppercase tracking-widest backdrop-blur-md">
                    <Loader2 size={12} className="animate-spin text-[#F04E23]"/> Scanning Arena...
                </div>
            </motion.div>
        )}

        {/* --- PLAYING --- */}
        {view === 'playing' && currentQ && (
            <div className="w-full h-screen flex flex-col justify-between pb-8 pt-4 relative">
                
                {/* TUG OF WAR BAR */}
                <div className="w-full px-2 mb-4">
                    <div className="w-full h-4 bg-[#111] rounded-full overflow-hidden relative border border-white/5">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-20"></div>
                        <motion.div 
                            className="h-full bg-[#F04E23]" 
                            animate={{ width: `${visualTug}%`, boxShadow: visualTug > 70 ? "0 0 30px #F04E23" : "0 0 0px #000" }} 
                            transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
                        />
                    </div>
                </div>

                {/* HEADER */}
                <header className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3 opacity-70"><Skull size={18} className="text-gray-400" /><div className="hidden md:block font-bold text-gray-500 uppercase text-[10px]">ENEMY</div></div>
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#111] rounded-xl border border-white/10"><span className={`text-xl font-black ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}</span></div>
                    <div className="flex items-center gap-3"><div className="hidden md:block text-right font-bold text-gray-500 uppercase text-[10px]">You</div><Fingerprint size={18} className="text-[#F04E23]" /></div>
                </header>

                {/* PUZZLE AREA */}
                <div className="flex-grow flex items-center justify-center px-4 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentQ.id}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                        className="w-full bg-[#0F0F0F] border border-white/10 p-6 rounded-3xl shadow-2xl relative min-h-[350px] flex flex-col items-center justify-center text-center overflow-hidden"
                    >
                        <div className="absolute top-4 z-10">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest border px-3 py-1 rounded-full border-white/10 text-gray-400 bg-white/5`}>
                                {currentQ.type === 'observation' && obsPhase !== 'quiz' ? 'OBSERVE!' : currentQ.prompt}
                            </span>
                        </div>
                        
                        {/* --- DYNAMIC RENDERER --- */}
                        
                        {/* 1. OBSERVATION */}
                        {currentQ.type === 'observation' && (
                            <>
                                {obsPhase === 'view' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-64 relative rounded-xl overflow-hidden mb-4">
                                        <img src={currentQ.visual.imageUrl} alt="Observe" className="w-full h-full object-cover" />
                                        <motion.div className="absolute bottom-0 left-0 h-1 bg-white" initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 3, ease: "linear" }} />
                                    </motion.div>
                                )}
                                {obsPhase === 'flash' && <motion.div animate={{ backgroundColor: ["#000", "#F04E23", "#000", "#F04E23"] }} transition={{ duration: 0.5 }} className="absolute inset-0 z-20 flex items-center justify-center"/>}
                                {obsPhase === 'quiz' && (
                                    <div className="w-full flex flex-col h-full animate-in fade-in zoom-in duration-300">
                                        <div className="flex-grow flex flex-col items-center justify-center mb-6">
                                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4"><Brain size={32} className="text-purple-500" /></div>
                                            <h2 className="text-3xl font-black tracking-tighter leading-none break-words max-w-full px-2">{currentQ.visual.question}</h2>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            {currentQ.options?.map((opt: any, i: number) => (
                                                <button key={i} onClick={() => handleAnswer(opt.val)} className="h-20 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-lg hover:bg-white hover:text-black transition-all">{opt.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* 2. GENERAL INTELLIGENCE */}
                        {(currentQ.type === 'logic' || currentQ.type === 'social' || currentQ.type === 'crime') && (
                            <>
                                <div className="flex-grow flex items-center justify-center w-full mb-4">
                                    {currentQ.visual.type === 'chat' ? (
                                        <div className="bg-[#222] p-6 rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl-none text-left max-w-[90%] border border-white/10 relative w-full">
                                            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500"><Smartphone size={14}/> {currentQ.visual.sender}</div>
                                            <p className="text-lg font-medium">"{currentQ.visual.msg}"</p>
                                        </div>
                                    ) : currentQ.visual.type === 'fact' ? (
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl w-full">
                                            <div className="flex items-center gap-2 mb-2 text-yellow-500"><Search size={16} /><span className="text-xs font-black uppercase">Riddle</span></div>
                                            <p className="text-xl font-bold text-white font-mono">{currentQ.visual.content}</p>
                                        </div>
                                    ) : (
                                        <div className={`text-center ${currentQ.visual.color || 'text-white'}`}>
                                            <div className={`${currentQ.visual.size || 'text-5xl'} font-black tracking-tighter`}>{currentQ.visual.content}</div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Universal Buttons */}
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {currentQ.options?.map((opt: any, i: number) => (
                                        <button key={i} onClick={() => handleAnswer(opt.val)} className="h-24 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xl hover:bg-white hover:text-black transition-all">
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                    </motion.div>
                </AnimatePresence>
                </div>
            </div>
        )}

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

        {/* --- WIN SCREEN --- */}
        {view === 'win' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/90">
                <div className="w-full max-w-md text-center bg-[#0F0F0F] p-8 rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(240,78,35,0.15)] overflow-hidden">
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
                </div>
            </motion.div>
        )}

        {/* --- LOSS SCREEN --- */}
        {view === 'loss' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/90">
                <div className="text-center max-w-md bg-[#0F0F0F] p-8 rounded-3xl border border-white/10 w-full">
                    <Brain size={40} className="text-gray-500 mx-auto mb-6" />
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-2 text-white">CALCULATION<br/>ERROR</h2>
                    <div className="mb-8 mt-6 p-4 border-l-2 border-[#F04E23] bg-[#F04E23]/5 rounded-r-lg text-left">
                        <p className="text-gray-300 text-sm italic">"Your logic was sound, but reaction time lagged. <strong className="text-white">Prove it was a fluke.</strong>"</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="w-full h-14 bg-[#111] hover:bg-white hover:text-black border border-white/20 rounded-xl font-bold text-sm uppercase tracking-widest transition-all text-white flex items-center justify-center gap-2">Redeem Honor <ArrowRight size={16}/></button>
                </div>
            </motion.div>
        )}

      </main>
    </div>
  );
}