'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X, Loader2, Brain, AlertCircle, TrendingUp, Zap, Swords, Award, Fingerprint } from 'lucide-react';
import { joinWaitlist } from '@/app/actions/waitlist';
import { Logo } from '@/app/components/shared';
import confetti from 'canvas-confetti';

// --- QUESTIONS ---
const QUESTIONS = [
  { q: "Which is heavier: A kilogram of steel or a kilogram of feathers?", options: ["Steel", "Feathers", "They are equal", "Depends on gravity"], a: 2 },
  { q: "Some months have 31 days, others have 30. How many have 28 days?", options: ["1", "2", "6", "12 (All of them)"], a: 3 },
  { q: "Complete the pattern: 3, 6, 9, 12, ...", options: ["13", "14", "15", "16"], a: 2 },
  { q: "If an electric train is moving North at 100mph and the wind is blowing West at 10mph, which way does the smoke blow?", options: ["South", "South-East", "West", "There is no smoke"], a: 3 },
  { q: "Your mother's brother's only brother-in-law is asleep on your couch. Who is asleep?", options: ["Your Uncle", "Your Father", "Your Brother", "Your Cousin"], a: 1 },
  { q: "Which word does not belong?", options: ["Guitar", "Violin", "Flute", "Cello"], a: 2 },
  { q: "If you are in a race and you overtake the person in second place, what place are you in?", options: ["First", "Second", "Third", "Last"], a: 1 },
  { q: "Which of these is a FACT, not an opinion?", options: ["Summer is the best season", "Water boils at 100°C at sea level", "Pizza tastes better than Pasta", "Blue is a calming color"], a: 1 },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", options: ["The letter M", "Time", "Oxygen", "Chance"], a: 0 },
  { q: "Is this statement true? 'This statement is false.'", options: ["Yes", "No", "It's a paradox", "Maybe"], a: 2 }
];

type ViewState = 'intro' | 'quiz' | 'result_pass' | 'result_fail' | 'joined';

const getRank = (score: number) => {
  if (score === 10) return { percent: "TOP 0.1%", label: "GENIUS", color: "text-[#F04E23]", border: "border-[#F04E23]" };
  if (score === 9)  return { percent: "TOP 1%", label: "ELITE STRATEGIST", color: "text-emerald-400", border: "border-emerald-400" };
  if (score === 8)  return { percent: "TOP 5%", label: "EXCEPTIONAL LOGIC", color: "text-blue-400", border: "border-blue-400" };
  if (score === 7)  return { percent: "TOP 10%", label: "SUPERIOR INTELLECT", color: "text-purple-400", border: "border-purple-400" };
  if (score === 6)  return { percent: "TOP 25%", label: "ABOVE AVERAGE", color: "text-yellow-400", border: "border-yellow-400" };
  return { percent: "BOTTOM 50%", label: "AVERAGE", color: "text-gray-400", border: "border-gray-400" };
};

export default function WaitlistPage() {
  const [view, setView] = useState<ViewState>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const rank = getRank(score);

  // --- QUIZ LOGIC ---
  const handleAnswer = (index: number) => {
    setSelectedOpt(index);
    setTimeout(() => {
      const isCorrect = index === QUESTIONS[currentQ].a;
      if (isCorrect) setScore(s => s + 1);
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOpt(null);
      } else {
        finishQuiz(score + (isCorrect ? 1 : 0));
      }
    }, 400); 
  };

  const finishQuiz = (finalScore: number) => {
    if (finalScore >= 6) {
      setView('result_pass');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ['#F04E23'] });
    } else {
      setView('result_fail');
    }
  };

  const restartQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setSelectedOpt(null);
    setView('quiz');
  };

  // --- SUPABASE JOIN LOGIC ---
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('score', score.toString());
    formData.append('rank_label', rank.label);

    const result = await joinWaitlist(formData);

    if (result.success) {
      setStatus('success');
      setView('joined');
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#F04E23', '#ffffff'] });
    } else {
      setStatus('error');
      setMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] selection:text-white flex flex-col relative overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505] pointer-events-none"></div>

      <main className="flex-grow flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-2xl mx-auto py-12">
        <AnimatePresence mode="wait">
          
          {/* 1. INTRO VIEW */}
          {view === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center flex flex-col items-center">
              <div className="mb-6 scale-125"><Logo size="lg" /></div>
              <div className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 uppercase tracking-widest backdrop-blur-md shadow-inner">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                2,408 Waiting in Arena
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl">PROVE THEM <br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F04E23] to-[#b03210]">WRONG.</span></h1>
              <p className="text-gray-400 text-lg mb-12 font-medium max-w-md">The UFC for Intellectuals. Win arguments, earn Elo, and silence the noise. <span className="text-white">Pass the logic test to enter.</span></p>
              <button onClick={() => setView('quiz')} className="h-14 px-10 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#F04E23] hover:text-white hover:scale-105 transition-all flex items-center gap-3 group shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <Brain size={20} /> Begin Assessment <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* 2. QUIZ VIEW */}
          {view === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full bg-[#0F0F0F] border border-white/10 p-8 rounded-3xl shadow-2xl relative">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-mono text-[#F04E23] uppercase tracking-widest">Logic Test {currentQ + 1}/10</span>
                <div className="h-1 w-32 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-[#F04E23] transition-all duration-500 ease-out" style={{ width: `${((currentQ + 1) / 10) * 100}%` }}></div></div>
              </div>
              <h2 className="text-2xl font-bold mb-8 leading-snug">{QUESTIONS[currentQ].q}</h2>
              <div className="space-y-3">
                {QUESTIONS[currentQ].options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={selectedOpt !== null} className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex justify-between items-center group ${selectedOpt === idx ? 'bg-[#F04E23] border-[#F04E23] text-white shadow-lg' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 text-gray-300'}`}>
                    <span className="font-medium text-lg">{opt}</span>
                    {selectedOpt === idx ? (<Loader2 size={20} className="animate-spin text-white/50" />) : (<div className="w-4 h-4 rounded-full border border-white/20 group-hover:border-white/60"></div>)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. RESULT: FAIL */}
          {view === 'result_fail' && (
            <motion.div key="fail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md bg-[#0F0F0F] p-8 rounded-3xl border border-white/10">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"><X size={40} className="text-red-500" /></div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Access Denied</h2>
              <p className="text-gray-400 mb-8">You scored {score}/10. The Arena requires a minimum score of 6/10.<br/>Your logic is too fragile for Verdict.</p>
              <button onClick={restartQuiz} className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm uppercase tracking-widest transition-all">Retake Exam</button>
            </motion.div>
          )}

          {/* 4. RESULT: PASS (THE LQ CARD + INPUT) */}
          {view === 'result_pass' && (
            <motion.div key="pass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
              
              {/* RANK BADGE */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                <TrendingUp size={16} className={rank.color} />
                <span className={`text-sm font-black tracking-widest ${rank.color}`}>{rank.percent}</span>
              </motion.div>
              
              <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-none ${rank.color}`}>{rank.label}</h2>
              
              {/* --- THE LQ BOOST CARD WITH INPUT --- */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }} 
                className="bg-[#111] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-[#F04E23]/30 transition-all text-center"
              >
                 {/* Decorative Icon */}
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={80} /></div>
                 
                 <div className="flex items-center justify-center gap-2 mb-4">
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Boost Your <span className="text-[#F04E23]">LQ</span></h3>
                    <div className="px-2 py-0.5 bg-white/10 text-[10px] font-bold rounded uppercase text-gray-300 border border-white/5">New Metric</div>
                 </div>
                 
                 <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                   Verdict is the only platform that tracks and improves your <strong>Logic Quotient</strong>. 
                   <br/>Unlock your potential below.
                 </p>

                 {/* INPUT FORM INTEGRATED HERE */}
                 <div className="relative group text-left">
                    <form onSubmit={handleJoin}>
                        <div className="relative">
                            <input 
                                type="email" 
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading'}
                                className="w-full h-14 bg-[#0A0A0A] border border-white/10 rounded-xl px-5 text-base outline-none focus:border-[#F04E23] focus:ring-1 focus:ring-[#F04E23] transition-all placeholder:text-gray-600 disabled:opacity-50"
                            />
                            <button 
                                type="submit"
                                disabled={status === 'loading' || !email}
                                className="absolute right-1 top-1 bottom-1 bg-white text-black px-5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#F04E23] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>Join <ArrowRight size={14} /></>
                                )}
                            </button>
                        </div>
                    </form>
                    {status === 'error' && (
                        <p className="text-red-500 text-xs mt-3 flex items-center justify-center gap-2">
                            <AlertCircle size={12}/> {msg}
                        </p>
                    )}
                 </div>
              </motion.div>

            </motion.div>
          )}

          {/* 5. JOINED (MATTE BLACK FOUNDER CARD) */}
          {view === 'joined' && (
            <motion.div key="joined" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-sm">
                <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#333] shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1]">
                    <div className="flex justify-between items-start z-10"><Logo size="sm" /> <span className="font-mono text-[10px] text-[#F04E23] tracking-widest border border-[#F04E23] px-2 py-1 rounded">FOUNDING MEMBER</span></div>
                    <div className="z-10 mt-6"><p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Assigned Rank</p><h3 className={`text-3xl font-black uppercase tracking-tighter ${rank.color}`}>{rank.label}</h3></div>
                    <div className="flex justify-between items-end z-10 mt-auto pt-6"><div><p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Founder ID</p><p className="text-lg font-mono text-white tracking-widest">#0002409</p></div><Fingerprint className="text-[#222]" size={48} /></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
                    <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-b from-[#F04E23]/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center mt-8 space-y-2">
                    <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><Check className="text-green-500"/> Rank Secured.</h3>
                    <p className="text-gray-500 text-sm">You are officially on the list. We will email you when the arena opens.</p>
                </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}