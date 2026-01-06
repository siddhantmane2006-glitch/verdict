'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X, Loader2, Brain, AlertCircle, TrendingUp, Zap, Fingerprint, Lock } from 'lucide-react';
import { joinWaitlist } from '@/app/actions/waitlist';
import { trackVisit, trackQuizResult } from '@/app/actions/analytics';
import { Logo } from '@/app/components/shared';
import confetti from 'canvas-confetti';

// --- GENIUS LEVEL LOGIC QUESTIONS (5 Total) ---
const QUESTIONS = [
  { 
    q: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?", 
    options: ["$0.10", "$0.05", "$0.01", "$0.50"], 
    a: 1 
  },
  { 
    q: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?", 
    options: ["100 minutes", "5 minutes", "1 hour", "20 minutes"], 
    a: 1 
  },
  { 
    q: "In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days to cover the entire lake, how long would it take to cover half the lake?", 
    options: ["24 days", "47 days", "40 days", "12 days"], 
    a: 1 
  },
  { 
    q: "You are running a race and you overtake the person in second place. What position are you in?", 
    options: ["First", "Second", "Third", "Last"], 
    a: 1 
  },
  { 
    q: "Mary's father has five daughters: 1. Nana, 2. Nene, 3. Nini, 4. Nono. What is the name of the fifth daughter?", 
    options: ["Nunu", "Nina", "Mary", "None of the above"], 
    a: 2 
  }
];

// Added 'collect_email' to the state types
type ViewState = 'intro' | 'quiz' | 'collect_email' | 'result_pass' | 'result_fail' | 'joined';

const getRank = (score: number) => {
  if (score === 5) return { percent: "TOP 0.1%", label: "GENIUS", color: "text-[#F04E23]" };
  if (score === 4) return { percent: "TOP 5%", label: "STRATEGIST", color: "text-emerald-400" };
  if (score === 3) return { percent: "TOP 25%", label: "ABOVE AVERAGE", color: "text-blue-400" };
  return { percent: "BOTTOM 50%", label: "NPC", color: "text-gray-400" };
};

export default function WaitlistPage() {
  const [view, setView] = useState<ViewState>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  
  const visitorIdRef = useRef<string>('');
  const rank = getRank(score);

  // --- ANALYTICS: GENERATE ID & TRACK VISIT ---
  useEffect(() => {
    let vId = '';
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
       vId = crypto.randomUUID();
    } else {
       vId = Math.random().toString(36).substring(2, 15);
    }
    visitorIdRef.current = vId;
    trackVisit(vId);
  }, []);

  // --- QUIZ LOGIC ---
  const handleAnswer = (index: number) => {
    setSelectedOpt(index);
    setTimeout(() => {
      const isCorrect = index === QUESTIONS[currentQ].a;
      
      const newScore = isCorrect ? score + 1 : score;
      if (isCorrect) setScore(newScore);

      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOpt(null);
      } else {
        // --- CHANGE: Instead of showing results, go to Email Gate ---
        setView('collect_email');
      }
    }, 400); 
  };

  // --- RESTART LOGIC ---
  const restartQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setSelectedOpt(null);
    setEmail(''); // Reset email if they want to try again from scratch
    setView('quiz');
  };

  // --- FINAL SUBMISSION (Triggered by Email Form) ---
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // 1. Submit to Database
    const formData = new FormData();
    formData.append('email', email);
    formData.append('score', score.toString());
    formData.append('rank_label', rank.label);
    if (visitorIdRef.current) {
        formData.append('visitor_id', visitorIdRef.current);
    }

    const result = await joinWaitlist(formData);

    if (result.success) {
      setStatus('success');
      
      // 2. Determine Pass/Fail
      const passed = score >= 3;

      // 3. Track Analytics (Now that we have the lead)
      if (visitorIdRef.current) {
         await trackQuizResult(visitorIdRef.current, score, passed);
      }

      // 4. Show the Verdict
      if (passed) {
        setView('result_pass');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ['#F04E23'] });
      } else {
        setView('result_fail');
      }

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
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl">
                <span className="whitespace-nowrap">PROVE THEM</span><br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F04E23] to-[#b03210]">WRONG.</span>
              </h1>
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
                <span className="text-xs font-mono text-[#F04E23] uppercase tracking-widest">Logic Test {currentQ + 1}/5</span>
                <div className="h-1 w-32 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-[#F04E23] transition-all duration-500 ease-out" style={{ width: `${((currentQ + 1) / 5) * 100}%` }}></div></div>
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

          {/* 3. NEW: EMAIL GATE (Between Quiz and Result) */}
          {view === 'collect_email' && (
             <motion.div key="collect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md bg-[#0F0F0F] border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
               
               <div className="w-16 h-16 bg-[#F04E23]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#F04E23]/20">
                 <Lock className="text-[#F04E23]" size={32} />
               </div>
               
               <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Assessment Complete</h2>
               <p className="text-gray-400 mb-8 font-medium">Enter your email to unlock your <span className="text-white font-bold">Logic Quotient</span> and see if you passed.</p>
               
               <form onSubmit={handleFinalSubmit} className="space-y-4">
                 <div className="relative text-left">
                   <input 
                     type="email" 
                     required
                     placeholder="name@company.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     disabled={status === 'loading'}
                     className="w-full h-14 bg-[#0A0A0A] border border-white/10 rounded-xl px-5 text-base outline-none focus:border-[#F04E23] focus:ring-1 focus:ring-[#F04E23] transition-all placeholder:text-gray-600"
                   />
                 </div>
                 <button 
                   type="submit"
                   disabled={status === 'loading' || !email}
                   className="w-full h-14 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#F04E23] hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {status === 'loading' ? <Loader2 className="animate-spin" /> : <>Reveal Results <ArrowRight size={18}/></>}
                 </button>
               </form>

               {status === 'error' && (
                 <p className="text-red-500 text-xs mt-4 flex items-center justify-center gap-2">
                   <AlertCircle size={14}/> {msg}
                 </p>
               )}
             </motion.div>
          )}

          {/* 4. RESULT: FAIL (Email already captured) */}
          {view === 'result_fail' && (
            <motion.div key="fail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md bg-[#0F0F0F] p-8 rounded-3xl border border-white/10">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20"><X size={40} className="text-red-500" /></div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Access Denied</h2>
              <p className="text-gray-400 mb-8">You scored {score}/5. The Arena requires a minimum score of 3/5.<br/>Your logic is too fragile for Verdict.</p>
              <button onClick={restartQuiz} className="w-full h-12 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm uppercase tracking-widest transition-all">Retake Exam</button>
              
               <div className="mt-4 pt-4 border-t border-white/5">
                 <p className="text-xs text-gray-500 mb-2">Already joined?</p>
                 <button onClick={() => setView('result_pass')} className="text-xs text-[#F04E23] hover:text-white underline decoration-dotted underline-offset-4 transition-colors">
                    View status
                 </button>
               </div>
            </motion.div>
          )}

        {/* 5. RESULT: PASS */}
          {view === 'result_pass' && (
            <motion.div key="pass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                <TrendingUp size={16} className={rank.color} />
                <span className={`text-sm font-black tracking-widest ${rank.color}`}>{rank.percent}</span>
              </motion.div>
              <h2 className={`text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none ${rank.color}`}>{rank.label}</h2>
              
               <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }} 
                className="bg-[#111] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-[#F04E23]/30 transition-all text-center"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={80} /></div>
                 
                 <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-4">Spot Secured</h3>
                 
                 <div className="text-gray-400 text-sm mb-8 leading-relaxed space-y-4 text-left bg-white/5 p-4 rounded-xl border border-white/5">
                    <p>
                       <span className="text-[#F04E23] font-bold">Status:</span> Verdict is currently in private development. The Arena is not yet open to the public.
                    </p>
                    <p>
                       You have been added to the <strong className="text-white">Priority Waitlist</strong>. We will notify <span className="text-white underline decoration-dotted underline-offset-4">{email}</span> immediately when we launch.
                    </p>
                 </div>

                 <button 
                    onClick={() => setView('joined')}
                    className="w-full h-14 bg-white text-black px-5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#F04E23] hover:text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                 >
                    Claim Founder Card <ArrowRight size={14} />
                 </button>
              </motion.div>
            </motion.div>
          )}

          {/* 6. JOINED (Member Card) */}
          {view === 'joined' && (
            <motion.div key="joined" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-sm">
                <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#333] shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1] mb-8">
                    <div className="flex justify-between items-start z-10"><Logo size="sm" /> <span className="font-mono text-[10px] text-[#F04E23] tracking-widest border border-[#F04E23] px-2 py-1 rounded">FOUNDING MEMBER</span></div>
                    <div className="z-10 mt-6"><p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Assigned Rank</p><h3 className={`text-3xl font-black uppercase tracking-tighter ${rank.color}`}>{rank.label}</h3></div>
                    <div className="flex justify-between items-end z-10 mt-auto pt-6"><div><p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Founder ID</p><p className="text-lg font-mono text-white tracking-widest">#0002409</p></div><Fingerprint className="text-[#222]" size={48} /></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
                    <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-b from-[#F04E23]/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>
                </div>

                <button 
                  onClick={() => {
                    const text = `I just secured my spot as a Founding Member of Verdict.\n\nRank: ${rank.label} (${score}/5)\n\nCan you pass the entrance exam?`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://getverdict.in`, '_blank');
                  }}
                  className="w-full py-3 bg-[#1DA1F2] hover:bg-[#1a91da] rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  Challenge Twitter
                </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}