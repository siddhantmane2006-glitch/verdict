'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Loader2, Brain, Zap, Crown, 
  Skull, Shield, Mail, Eye, Ghost, Lock, Smartphone
} from 'lucide-react';
import io, { Socket } from 'socket.io-client';

// --- TYPES ---
type GameState = 'matching' | 'playing' | 'victory_splash' | 'defeat_glitch' | 'win' | 'loss';
type PuzzleCategory = 'STREET SMARTS' | 'LATERAL THINKING' | 'ABSTRACT LOGIC';

interface Question {
  id: string;
  category: PuzzleCategory;
  difficulty: 'MEDIUM' | 'HARD';
  prompt: string; 
  visualContent?: React.ReactNode; // For non-text visuals
  options: { label: string; val: string }[];
  answer: string; 
}

// --- NEW "FUN & SMART" MOCK DECK ---
const FALLBACK_DECK: Question[] = [
  {
    id: 'q1',
    category: 'STREET SMARTS',
    difficulty: 'MEDIUM',
    prompt: 'You receive this text from "CEO_Mike". What gives it away as a scam?',
    visualContent: (
      <div className="bg-gray-100 p-4 rounded-xl text-black font-sans text-sm mb-4 border-l-4 border-red-500 w-full">
        <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs uppercase font-bold">
          <Smartphone size={12} /> iMessage
        </div>
        "Hey, I'm in a meeting and can't talk. Need you to buy 5x $100 Gift Cards for a client bonus ASAP. Will reimburse. Confidential."
      </div>
    ),
    options: [
        { label: 'The grammar is too perfect', val: 'a' }, 
        { label: 'CEOs don\'t use text', val: 'b' }, 
        { label: 'Urgency + Gift Cards = Scam', val: 'c' }, 
        { label: 'It is actually legit', val: 'd' }
    ],
    answer: 'c'
  },
  {
    id: 'q2',
    category: 'LATERAL THINKING',
    difficulty: 'HARD',
    prompt: 'A man is looking at a photograph of someone. His friend asks who it is. The man replies:',
    visualContent: (
      <div className="text-[#F04E23] font-mono text-lg md:text-xl font-bold italic mb-6 text-center">
        "Brothers and sisters, I have none.<br/>But that man's father is my father's son."
      </div>
    ),
    options: [
        { label: 'His Son', val: 'a' }, 
        { label: 'His Father', val: 'b' }, 
        { label: 'Himself', val: 'c' }, 
        { label: 'His Nephew', val: 'd' }
    ],
    answer: 'a' // "My father's son" = Me. "That man's father is ME." Therefore, that man is my son.
  },
  {
    id: 'q3',
    category: 'ABSTRACT LOGIC',
    difficulty: 'HARD',
    prompt: 'Which symbol completes the sequence?',
    visualContent: (
      <div className="flex gap-4 mb-6 text-4xl font-black text-white justify-center items-center">
        <span>⭐</span>
        <ArrowRight size={20} className="text-gray-600"/>
        <span>⭐⭐</span>
        <ArrowRight size={20} className="text-gray-600"/>
        <span>⭐⭐⭐</span>
        <ArrowRight size={20} className="text-gray-600"/>
        <div className="w-12 h-12 border-2 border-dashed border-[#F04E23] rounded flex items-center justify-center text-xl text-[#F04E23]">?</div>
      </div>
    ),
    options: [
        { label: '⭐⭐⭐⭐', val: 'a' }, // Too obvious?
        { label: '🌟', val: 'b' }, 
        { label: '💠', val: 'c' }, 
        { label: '4', val: 'd' }
    ],
    // Actually let's make it trickier in real data, but for now simple visual pattern
    answer: 'a' 
  }
];

// --- UTILS ---
const triggerHaptic = (type: 'heavy' | 'success' | 'light') => { 
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'heavy') navigator.vibrate(50);
        else if (type === 'success') navigator.vibrate([10, 30, 20]);
        else navigator.vibrate(10);
    }
};

const SOCKET_URL = 'http://103.195.6.231:3001';

export default function ArenaPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<'p1' | 'p2' | null>(null);

  const [view, setView] = useState<GameState>('matching');
  const [deck, setDeck] = useState<Question[]>(FALLBACK_DECK); 
  const [qIndex, setQIndex] = useState(0);
  
  // Interaction State
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null); // For instant flash feedback
  
  // Game Stats
  const [tugValue, setTugValue] = useState(50);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  
  const questionStartTime = useRef<number>(0);

  // --- SOCKET INIT ---
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit('find_match');

    newSocket.on('match_found', (data) => {
        setRoomId(data.roomId);
        setMyRole(data.role); 
        // In real prod, enable this: if (data.deck && data.deck.length > 0) setDeck(data.deck);
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

  // --- HANDLERS ---
  const handleAnswer = (val: string) => {
    const currentQ = deck[qIndex];
    const isCorrect = val === currentQ.answer;
    
    // 1. Instant UI Feedback
    setLastResult(isCorrect ? 'correct' : 'wrong');
    triggerHaptic(isCorrect ? 'success' : 'heavy');

    // 2. Logic Update
    if (isCorrect) {
        const speed = Date.now() - questionStartTime.current;
        setStats(p => ({ ...p, correct: p.correct + 1, total: p.total + 1 }));
        setTugValue(prev => myRole === 'p2' ? prev - 10 : prev + 10); 
        if (socket && roomId) socket.emit('submit_success', { roomId, timeTaken: speed });
    } else {
        setStats(p => ({ ...p, total: p.total + 1 }));
        setTugValue(prev => myRole === 'p2' ? prev + 10 : prev - 10);
        if (socket && roomId) socket.emit('submit_fail', { roomId });
    }

    // 3. Next Question Delay (Allow user to see the result flash)
    setTimeout(() => {
        setLastResult(null);
        setQIndex(prev => (prev + 1) % deck.length);
        questionStartTime.current = Date.now();
    }, 600); // 600ms delay to read feedback
  };

  const visualTug = myRole === 'p2' ? (100 - tugValue) : tugValue;
  const currentQ = deck[qIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] flex flex-col relative overflow-hidden select-none">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111] via-[#050505] to-[#000]"></div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <main className="flex-grow flex flex-col items-center justify-center px-4 relative z-10 w-full max-w-xl mx-auto py-6">

        {/* --- MATCHMAKING --- */}
        {view === 'matching' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col h-screen items-center justify-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                        <Zap className="text-[#F04E23] animate-pulse" size={40} />
                    </div>
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border-t-2 border-[#F04E23] rounded-full opacity-50"
                    />
                </div>
                <h2 className="text-2xl font-black tracking-tighter mb-2">SCANNING ARENA</h2>
                <p className="text-sm text-gray-500 font-mono">Searching for worthy opponent...</p>
            </motion.div>
        )}

        {/* --- PLAYING --- */}
        {view === 'playing' && currentQ && (
            <div className="w-full h-full flex flex-col justify-between">
                
                {/* HUD */}
                <div className="w-full mb-6">
                    <div className="flex justify-between items-end mb-2 px-2">
                        <div className="flex items-center gap-2">
                            <Skull size={16} className="text-red-500"/>
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Enemy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#F04E23] uppercase tracking-widest">You</span>
                            <Crown size={16} className="text-[#F04E23]"/>
                        </div>
                    </div>
                    
                    {/* TUG BAR */}
                    <div className="h-4 w-full bg-[#111] rounded-full overflow-hidden relative border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-20"></div>
                        <motion.div 
                            className="h-full bg-gradient-to-r from-red-600 via-[#F04E23] to-orange-400 shadow-[0_0_15px_#F04E23]" 
                            animate={{ width: `${visualTug}%` }} 
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        />
                    </div>
                    
                    <div className="text-center mt-4 font-mono text-4xl font-black text-white/90 tracking-tighter">
                        {timeLeft}<span className="text-sm text-white/30 ml-1">s</span>
                    </div>
                </div>

                {/* CARD AREA */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentQ.id}
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 1.05, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full flex-grow flex flex-col justify-center relative"
                    >
                        {/* RESULT OVERLAY FLASH */}
                        {lastResult && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className={`absolute inset-0 z-50 flex items-center justify-center rounded-3xl backdrop-blur-md ${lastResult === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                            >
                                <div className={`text-5xl font-black italic tracking-tighter ${lastResult === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                                    {lastResult === 'correct' ? 'NICE!' : 'NOPE'}
                                </div>
                            </motion.div>
                        )}

                        <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                            
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                    <span className="text-sm">{currentQ.emoji}</span>
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{currentQ.category}</span>
                                </div>
                                <span className="text-[10px] font-mono text-gray-600 uppercase">Diff: {currentQ.difficulty}</span>
                            </div>

                            {/* Prompt & Visual */}
                            <div className="flex-grow flex flex-col justify-center items-center text-center mb-8">
                                <h2 className="text-2xl font-bold leading-tight mb-6 text-white">
                                    {currentQ.prompt}
                                </h2>
                                {currentQ.visualContent}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 gap-3">
                                {currentQ.options.map((opt, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => !lastResult && handleAnswer(opt.val)} // Prevent double clicks
                                        className="group relative w-full p-4 bg-[#111] hover:bg-white border border-white/10 hover:border-white rounded-xl text-left transition-all duration-150 active:scale-[0.98]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-400 group-hover:text-black text-lg transition-colors">{opt.label}</span>
                                            <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-black/20 flex items-center justify-center">
                                                <ArrowRight size={14} className="text-white group-hover:text-black" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        )}

        {/* --- VICTORY SCREEN --- */}
        <AnimatePresence>
            {view === 'victory_splash' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center">
                        <Crown size={80} className="text-[#F04E23] mx-auto mb-4 drop-shadow-[0_0_30px_rgba(240,78,35,0.6)]" />
                        <h1 className="text-7xl font-black italic tracking-tighter text-white">GENIUS</h1>
                        <p className="text-gray-400 font-mono mt-4 tracking-widest uppercase text-xs">Dominance Established</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- WIN / LOSS FINAL --- */}
        {(view === 'win' || view === 'loss') && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/95">
                <div className="w-full max-w-sm text-center">
                    <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center border-4 ${view === 'win' ? 'border-[#F04E23] bg-[#F04E23]/10' : 'border-gray-700 bg-gray-800'}`}>
                        {view === 'win' ? <Crown size={40} className="text-[#F04E23]" /> : <Skull size={40} className="text-gray-500" />}
                    </div>
                    
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-2 text-white">
                        {view === 'win' ? 'Victory' : 'Defeated'}
                    </h2>
                    
                    <div className="flex justify-center gap-8 my-8 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Score</p>
                            <p className="text-2xl font-black text-white">{stats.correct}/{stats.total}</p>
                        </div>
                        <div className="w-px bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Elo</p>
                            <p className={`text-2xl font-black ${view === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                                {view === 'win' ? '+24' : '-18'}
                            </p>
                        </div>
                    </div>

                    <button onClick={() => window.location.reload()} className="w-full h-14 bg-white hover:bg-gray-200 text-black rounded-xl font-bold text-sm uppercase tracking-widest transition-all">
                        Find New Match
                    </button>
                </div>
            </motion.div>
        )}

      </main>
    </div>
  );
}