'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Check, X, Loader2, Brain, AlertCircle, TrendingUp, Zap, Fingerprint, Lock, 
  ArrowUp, Square, Circle, Triangle, Hexagon, Quote, Minus, Plus, HelpCircle
} from 'lucide-react';
import { joinWaitlist } from '@/app/actions/waitlist';
import { getAiVerdict } from '@/app/actions/ai';
import { trackVisit, trackQuizResult } from '@/app/actions/analytics';
import { Logo } from '@/app/components/shared';
import confetti from 'canvas-confetti';
import useSound from 'use-sound'; // <--- IMPORT THIS

// --- 1. SOUND ASSETS ---
// Ensure these files exist in your public/sounds folder
const SOUNDS = {
  click: '/sounds/ui_mechanical_click.mp3', // Heavy mechanical switch
  type: '/sounds/data_blip_fast.mp3',       // High pitched matrix blip
  success: '/sounds/coin_impact_heavy.mp3', // Satisfying thud/ching
  fail: '/sounds/glitch_static_burst.mp3',  // Jarring static
  win: '/sounds/cinematic_bass_drop.mp3',   // God-like ambience
};

// --- 2. CUSTOM HOOK FOR PITCH VARIATION (THE ADDICTION JUICE) ---
const useJuicySound = (url: string, { volume = 0.5 } = {}) => {
  const [play] = useSound(url, { volume, interrupt: true });

  const trigger = () => {
    // Randomize pitch between 0.9 and 1.1 to prevent ear fatigue
    const randomRate = 0.9 + Math.random() * 0.2;
    play({ playbackRate: randomRate });
  };

  return trigger;
};

// --- QUESTION DATA (Same as before) ---
type QuestionType = 'mcq' | 'input_number' | 'text_area' | 'visual_matrix' | 'visual_sequence' | 'visual_odd_one';

interface Question {
  id: number;
  type: QuestionType;
  q: string;
  options?: any[]; 
  a?: number | string; 
  placeholder?: string;
  data?: any; 
}

const QUESTIONS: Question[] = [
  // ... (Your existing questions array remains unchanged) ...
  { 
    id: 1, type: 'visual_sequence',
    q: "Complete the sequence.",
    data: ['arrow-up', 'arrow-right', 'arrow-down'], 
    options: [{ id: 0, type: 'arrow-up' }, { id: 1, type: 'arrow-left' }, { id: 2, type: 'circle-outline' }, { id: 3, type: 'arrow-right' }],
    a: 1 
  },
  {
    id: 2, type: 'visual_matrix',
    q: "Select the missing piece.",
    data: ['circle-outline', 'circle-x', 'circle-fill', 'square-outline', 'square-x', 'square-fill', 'triangle-outline', 'triangle-x', -1],
    options: [{ id: 0, val: 'triangle-outline' }, { id: 1, val: 'triangle-fill' }, { id: 2, val: 'circle-fill' }, { id: 3, val: 'square-x' }],
    a: 1
  },
  { 
    id: 3, type: 'mcq',
    q: "What number comes next?\n3, 6, 18, 72, ...",
    options: ["144", "216", "360", "288"], 
    a: 2
  },
  {
    id: 4, type: 'visual_odd_one',
    q: "Select the odd shape out.",
    data: ['square-outline', 'hexagon-outline', 'triangle-outline', 'semicircle-outline'],
    options: [0, 1, 2, 3],
    a: 3
  },
  {
    id: 5, type: 'mcq',
    q: "If 🟧 + 🟧 = 10\nand 🟧 + 🔺 = 14\nWhat is 🔺 - 🟧?",
    options: ["3", "4", "5", "2"],
    a: 1
  },
  {
    id: 6, type: 'text_area',
    q: "Final Analysis: Why do you deserve to enter the Arena?",
    placeholder: "I see what others miss...",
    a: "N/A" 
  }
];

type ViewState = 'intro' | 'quiz' | 'collect_email' | 'result_pass' | 'result_fail' | 'joined';

const getRank = (score: number) => {
  if (score === 6) return { percent: "TOP 0.1%", label: "OMNISCIENT", color: "text-[#F04E23]" };
  if (score === 5) return { percent: "TOP 5%", label: "MASTERMIND", color: "text-emerald-400" };
  if (score >= 4) return { percent: "TOP 20%", label: "ARCHITECT", color: "text-blue-400" };
  return { percent: "BOTTOM 50%", label: "NPC", color: "text-gray-400" };
};

export default function WaitlistPage() {
  const [view, setView] = useState<ViewState>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [email, setEmail] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [aiRemark, setAiRemark] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  
  const visitorIdRef = useRef<string>('');
  const rank = getRank(score);

  // --- 3. INITIALIZE SOUNDS ---
  const playClick = useJuicySound(SOUNDS.click, { volume: 0.4 });
  const playType = useJuicySound(SOUNDS.type, { volume: 0.15 }); // Low volume for rapid fire
  const playSuccess = useJuicySound(SOUNDS.success, { volume: 0.6 });
  const playFail = useJuicySound(SOUNDS.fail, { volume: 0.5 });
  const playWin = useJuicySound(SOUNDS.win, { volume: 1.0 });

  useEffect(() => {
    let vId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    visitorIdRef.current = vId;
    trackVisit(vId);
  }, []);

  const handleNext = (isCorrect: boolean, inputValue?: string) => {
    // AUDIO FEEDBACK
    if (QUESTIONS[currentQ].id !== 6) { // Don't play score sounds for manifesto yet
        if (isCorrect) {
            setTimeout(() => playSuccess(), 100); // Slight delay for rhythm
        } else {
            playFail();
        }
    } else {
        playClick(); // Just click for text submit
    }

    if (QUESTIONS[currentQ].id === 6 && inputValue) setManifesto(inputValue);
    if (isCorrect && QUESTIONS[currentQ].id < 6) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOpt(null);
        setTextAnswer('');
      } else {
        setView('collect_email');
      }
    }, 500); // Increased delay slightly to let sound breathe
  };

  const submitMCQ = (index: number) => {
    playClick(); // Immediate tactile feedback
    setSelectedOpt(index);
    const isCorrect = index === QUESTIONS[currentQ].a;
    handleNext(isCorrect);
  };

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAnswer.trim()) return;
    const isCorrect = true; 
    handleNext(isCorrect, textAnswer);
  };

  // --- 4. TYPING SOUND HANDLER ---
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTextAnswer(e.target.value);
      playType(); // Triggers the "Matrix" data blip
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setStatus('loading');
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('score', score.toString());
    formData.append('rank_label', rank.label);
    formData.append('manifesto', manifesto);
    if (visitorIdRef.current) formData.append('visitor_id', visitorIdRef.current);

    const result = await joinWaitlist(formData);

    if (result.success) {
      const passed = score >= 4;
      const verdictText = await getAiVerdict(score, manifesto);
      setAiRemark(verdictText);
      if (visitorIdRef.current) await trackQuizResult(visitorIdRef.current, score, passed);
      
      setStatus('success');
      
      if (passed) {
        setView('result_pass');
        playWin(); // AUDIO: The Bass Drop
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#F04E23', '#ffffff'] });
      } else {
        setView('result_fail');
        playFail(); // AUDIO: The Glitch
      }
    } else {
      setStatus('error');
      playFail();
      setMsg(result.message);
    }
  };

  const restartQuiz = () => {
    playClick();
    setCurrentQ(0);
    setScore(0);
    setSelectedOpt(null);
    setTextAnswer('');
    setEmail('');
    setView('quiz');
  };

  // ... (RenderShape function remains the same) ...
  const RenderShape = ({ type, className = "" }: { type: string, className?: string }) => {
    const baseClass = `transition-all duration-300 ${className}`;
    if (type === 'arrow-up') return <ArrowUp className={baseClass} />;
    if (type === 'arrow-right') return <ArrowUp className={`${baseClass} rotate-90`} />;
    if (type === 'arrow-down') return <ArrowUp className={`${baseClass} rotate-180`} />;
    if (type === 'arrow-left') return <ArrowUp className={`${baseClass} -rotate-90`} />;
    if (type.includes('circle')) {
        if (type.includes('outline')) return <Circle className={baseClass} />;
        if (type.includes('x')) return <div className="relative"><Circle className={baseClass} /><Plus className={`absolute inset-0 m-auto ${className} rotate-45 scale-50`} /></div>;
        if (type.includes('fill')) return <Circle className={baseClass} fill="currentColor" />;
    }
    if (type.includes('square')) {
        if (type.includes('outline')) return <Square className={baseClass} />;
        if (type.includes('x')) return <div className="relative"><Square className={baseClass} /><Plus className={`absolute inset-0 m-auto ${className} rotate-45 scale-50`} /></div>;
        if (type.includes('fill')) return <Square className={baseClass} fill="currentColor" />;
    }
    if (type.includes('triangle')) {
        if (type.includes('outline')) return <Triangle className={baseClass} />;
        if (type.includes('x')) return <div className="relative"><Triangle className={baseClass} /><Plus className={`absolute inset-0 m-auto ${className} rotate-45 scale-50`} /></div>;
        if (type.includes('fill')) return <Triangle className={baseClass} fill="currentColor" />;
    }
    if (type === 'hexagon-outline') return <Hexagon className={baseClass} />;
    if (type === 'semicircle-outline') return <div className={`w-8 h-4 rounded-t-full border-2 border-current border-b-0 ${className.replace('w-8 h-8','').replace('text-','border-')}`}></div>;
    return <HelpCircle className={baseClass} />;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] selection:text-white flex flex-col relative overflow-hidden">
      {/* ... (Backgrounds remain the same) ... */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '32px 32px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none"></div>

      <main className="flex-grow flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-xl mx-auto py-12">
        <AnimatePresence mode="wait">
          
          {/* 1. INTRO */}
          {view === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center flex flex-col items-center">
              <div className="mb-8 scale-125"><Logo size="lg" /></div>
              {/* ... (Intro Text) ... */}
              <div className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 uppercase tracking-widest backdrop-blur-md shadow-inner">
                <Brain size={14} className="text-[#F04E23]" />
                Cognitive Calibration
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">TEST YOUR<br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">INTELLECT</span></h1>
              <p className="text-gray-400 text-base mb-12 font-medium max-w-sm leading-relaxed">Verdict isn't for everyone. Prove you have the logical reasoning to compete in the Arena.</p>
              
              <button onClick={() => { playClick(); setView('quiz'); }} className="group relative h-14 px-10 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#F04E23] hover:text-white hover:scale-105 transition-all flex items-center gap-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Zap size={18} fill="currentColor" /> Start Assessment
              </button>
            </motion.div>
          )}

          {/* 2. QUIZ VIEWER */}
          {view === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="w-full">
                {/* ... (Progress Bar) ... */}
                <div className="flex justify-between items-end mb-8 px-1">
                    <span className="text-xs font-mono text-[#F04E23] uppercase tracking-widest font-bold">Problem {currentQ + 1} <span className="text-gray-600">/ 6</span></span>
                    <div className="flex gap-1">{QUESTIONS.map((_, i) => (<div key={i} className={`h-1 w-4 rounded-full transition-colors ${i <= currentQ ? 'bg-[#F04E23]' : 'bg-gray-800'}`}></div>))}</div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                    <h2 className="text-xl md:text-2xl font-bold mb-8 leading-snug text-white/90">{QUESTIONS[currentQ].q}</h2>
                    <div className="space-y-6">
                        
                        {/* --- RENDER BUTTONS (Visual Matrix) --- */}
                        {QUESTIONS[currentQ].type === 'visual_matrix' && (
                            <div className="flex flex-col items-center gap-8">
                                <div className="grid grid-cols-3 gap-2 bg-[#151515] p-3 rounded-2xl border border-white/5">
                                    {QUESTIONS[currentQ].data?.map((type: any, i: number) => (
                                        <div key={i} className="w-20 h-20 bg-black/50 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                                            {type === -1 ? <span className="text-[#F04E23] font-mono text-2xl animate-pulse">?</span> : <RenderShape type={type} className="w-8 h-8 text-gray-300" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-4 gap-2 w-full">
                                    {QUESTIONS[currentQ].options?.map((opt: any, idx: number) => (
                                        <button key={idx} onMouseEnter={() => playType()} onClick={() => submitMCQ(idx)} disabled={selectedOpt !== null} className={`h-20 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${selectedOpt === idx ? 'bg-[#F04E23] border-[#F04E23]' : 'bg-[#151515] border-white/10 hover:border-white/30'}`}>
                                            {selectedOpt === idx ? <Loader2 className="animate-spin text-white"/> : <RenderShape type={opt.val} className={selectedOpt === idx ? "text-white w-8 h-8" : "text-gray-400 w-8 h-8"} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- RENDER BUTTONS (Sequence) --- */}
                        {QUESTIONS[currentQ].type === 'visual_sequence' && (
                            <div className="flex flex-col items-center gap-8">
                                <div className="flex items-center justify-center gap-3 bg-[#151515] p-6 rounded-2xl border border-white/5 w-full">
                                    {QUESTIONS[currentQ].data?.map((type: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2"><RenderShape type={type} className="w-10 h-10 text-white" /><ArrowRight size={12} className="text-gray-700" /></div>
                                    ))}
                                    <div className="w-10 h-10 border-2 border-dashed border-[#F04E23]/50 rounded-lg flex items-center justify-center"><span className="text-[#F04E23] font-bold">?</span></div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 w-full">
                                    {QUESTIONS[currentQ].options?.map((opt: any, idx: number) => (
                                        <button key={idx} onMouseEnter={() => playType()} onClick={() => submitMCQ(idx)} disabled={selectedOpt !== null} className={`h-20 rounded-xl border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${selectedOpt === idx ? 'bg-[#F04E23] border-[#F04E23]' : 'bg-[#151515] border-white/10 hover:border-white/30'}`}>
                                            {selectedOpt === idx ? <Loader2 className="animate-spin text-white"/> : <RenderShape type={opt.type} className={selectedOpt === idx ? "text-white w-8 h-8" : "text-gray-400 w-8 h-8"} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- RENDER BUTTONS (Odd One Out) --- */}
                        {QUESTIONS[currentQ].type === 'visual_odd_one' && (
                            <div className="grid grid-cols-2 gap-4 w-full">
                                {QUESTIONS[currentQ].data?.map((type: string, idx: number) => (
                                    <button key={idx} onMouseEnter={() => playType()} onClick={() => submitMCQ(idx)} disabled={selectedOpt !== null} className={`h-32 rounded-2xl border transition-all flex items-center justify-center hover:scale-[1.02] active:scale-95 ${selectedOpt === idx ? 'bg-[#F04E23] border-[#F04E23]' : 'bg-[#151515] border-white/10 hover:border-white/30'}`}>
                                        {selectedOpt === idx ? <Loader2 className="animate-spin text-white"/> : <RenderShape type={type} className={selectedOpt === idx ? "text-white w-12 h-12" : "text-gray-400 w-12 h-12"} />}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* --- RENDER BUTTONS (MCQ) --- */}
                        {QUESTIONS[currentQ].type === 'mcq' && (
                            <div className="grid grid-cols-1 gap-3">
                                {QUESTIONS[currentQ].options?.map((opt, idx) => (
                                    <button key={idx} onMouseEnter={() => playType()} onClick={() => submitMCQ(idx)} disabled={selectedOpt !== null} className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 flex justify-between items-center group hover:scale-[1.01] active:scale-[0.99] ${selectedOpt === idx ? 'bg-[#F04E23] border-[#F04E23] text-white shadow-lg' : 'bg-[#151515] border-white/10 hover:border-white/30 text-gray-300'}`}>
                                        <span className="font-medium text-lg font-mono">{opt}</span>
                                        {selectedOpt === idx ? (<Loader2 size={20} className="animate-spin text-white/50" />) : (<div className="w-4 h-4 rounded-full border border-white/20 group-hover:border-white/60"></div>)}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* --- TEXT AREA (With Typing Sound) --- */}
                        {QUESTIONS[currentQ].type === 'text_area' && (
                            <form onSubmit={submitText} className="space-y-6">
                                <textarea autoFocus placeholder={QUESTIONS[currentQ].placeholder} value={textAnswer} onChange={handleTyping} className="w-full h-40 bg-[#151515] border border-white/10 rounded-2xl p-5 text-lg font-sans outline-none focus:border-[#F04E23] focus:ring-1 focus:ring-[#F04E23] transition-all placeholder:text-gray-700 resize-none text-white leading-relaxed" />
                                <div className="flex justify-end"><button type="submit" disabled={!textAnswer.trim()} className="h-14 px-8 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#F04E23] hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black flex items-center gap-2">Analyze <Brain size={16}/></button></div>
                            </form>
                        )}
                        
                        {/* --- NUMBER INPUT (With Typing Sound) --- */}
                        {QUESTIONS[currentQ].type === 'input_number' && (
                            <form onSubmit={submitText} className="relative">
                                <input type="number" autoFocus placeholder={QUESTIONS[currentQ].placeholder} value={textAnswer} onChange={handleTyping} className="w-full h-16 bg-[#0A0A0A] border border-white/10 rounded-xl px-5 text-2xl font-mono outline-none focus:border-[#F04E23] transition-all placeholder:text-gray-700" />
                                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-lg font-bold text-sm hover:bg-[#F04E23] hover:text-white transition-all">Submit</button>
                            </form>
                        )}

                    </div>
                </div>
            </motion.div>
          )}

          {/* ... (The rest of the component [Email, Result, Joined] uses standard buttons, attach onClick={() => { playClick(); ... }} to them if you want consistency) ... */}
          {/* Example for Collect Email: */}
          {view === 'collect_email' && (
             <motion.div key="collect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md bg-[#0F0F0F] border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
               {/* ... */}
               <form onSubmit={handleFinalSubmit} className="space-y-4">
                 <input type="email" required placeholder="name@email.com" value={email} onChange={handleTyping} disabled={status === 'loading'} className="w-full h-14 bg-[#0A0A0A] border border-white/10 rounded-xl px-5 text-base outline-none focus:border-[#F04E23] focus:ring-1 focus:ring-[#F04E23] transition-all placeholder:text-gray-600 text-center"/>
                 <button type="submit" disabled={status === 'loading' || !email} className="w-full h-14 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#F04E23] hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                   {status === 'loading' ? <Loader2 className="animate-spin" /> : <>Reveal Result <ArrowRight size={18}/></>}
                 </button>
               </form>
               {status === 'error' && <p className="text-red-500 text-xs mt-4 flex items-center justify-center gap-2"><AlertCircle size={14}/> {msg}</p>}
             </motion.div>
          )}

          {/* Result Pass/Fail/Joined screens remain similar, just ensure buttons trigger playClick */}
          
        </AnimatePresence>
      </main>
    </div>
  );
}