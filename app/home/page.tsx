'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Trophy, Skull, Crosshair, Gavel, 
  BrainCircuit, Hexagon, Terminal, Activity, Lock
} from 'lucide-react';
import Link from 'next/link';

// --- DATA ---
const USER = {
  name: "FOUNDER",
  rank: "TRANSCENDENT", 
  rankSubtitle: "BIOLOGY SURPASSED",
  elo: 2850,
  streak: 12,
  credits: 1200,
  winRate: "94.2%"
};

const DUNGEON_CAPTIVES = [
  { id: 1, name: "KillerMike", status: "Captured", time: "2h" },
  { id: 2, name: "LogicBro", status: "Captured", time: "5h" },
  { id: 3, name: "Sarah99", status: "Bailed", time: "1d" }, 
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-[#F04E23] flex flex-col relative overflow-x-hidden">
      
      {/* --- AMBIENT BACKGROUND (Fixed Z-Index) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#F04E23]/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
          {/* Grid Line Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }}></div>
      </div>

      {/* --- HEADER --- */}
      <header className="relative z-30 flex justify-center p-6 border-b border-white/5 bg-[#020202]/80 backdrop-blur-md">
        <div className="max-w-7xl w-full flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center">
                    <Terminal size={16} className="text-gray-400" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] font-mono text-[#F04E23] tracking-widest uppercase">Operator ID</span>
                    <span className="text-sm md:text-base font-black tracking-tight">{USER.name}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-mono text-gray-500 uppercase">Server Time</p>
                    <p className="text-xs font-bold text-gray-300">23:42 UTC</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] md:text-[10px] font-mono text-gray-500 uppercase">Resources</p>
                    <div className="flex items-center justify-end gap-1 text-white">
                        <Zap size={14} className="text-[#F04E23] fill-[#F04E23]" />
                        <span className="font-bold text-sm md:text-lg">{USER.credits}</span>
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (Scrollable on small screens, Centered on large) --- */}
      <main className="relative z-10 flex-grow flex flex-col justify-center px-6 py-12 md:py-20 lg:py-0 w-full max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* LEFT COLUMN: IDENTITY */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-1">
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F04E23] animate-pulse"></div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-300">Neural Link Active</span>
                </motion.div>

                {/* Responsive Font Size - clamps size to fit windows */}
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl sm:text-7xl xl:text-9xl font-black italic tracking-tighter text-white leading-[0.9] mb-4"
                >
                    {USER.rank}
                </motion.h1>
                
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col lg:flex-row items-center gap-4 mb-12"
                >
                    <p className="text-xs md:text-sm font-mono text-[#F04E23] uppercase tracking-[0.4em]">
                        /// {USER.rankSubtitle} ///
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                    {[
                        { label: "Rating", val: USER.elo, icon: Trophy },
                        { label: "Win Rate", val: USER.winRate, icon: Activity },
                        { label: "Streak", val: USER.streak, icon: Zap },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + (i * 0.1) }}
                            className="bg-[#0A0A0A] border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center hover:border-[#F04E23]/30 transition-all hover:-translate-y-1"
                        >
                            <stat.icon size={16} className="text-gray-600 mb-2 group-hover:text-white transition-colors" />
                            <span className="text-xl md:text-2xl font-black text-white">{stat.val}</span>
                            <span className="text-[8px] md:text-[10px] font-mono text-gray-500 uppercase tracking-wider">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* RIGHT COLUMN: ACTION */}
            <div className="flex flex-col gap-8 w-full max-w-lg mx-auto lg:mx-0 order-2">
                
                {/* HERO ACTION BUTTON */}
                <Link href="/arena" className="w-full group relative block">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F04E23] to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                    <button className="relative w-full h-32 bg-white text-black rounded-2xl flex items-center justify-between px-8 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-2xl">
                        <div className="flex flex-col items-start">
                            <span className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">Initialize Duel</span>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded uppercase">Ranked Mode</span>
                                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Entry: 50 CR</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white rotate-[-15deg] group-hover:rotate-0 transition-transform duration-300">
                            <Gavel size={28} />
                        </div>
                    </button>
                </Link>

                {/* THE DUNGEON LIST */}
                <div className="w-full bg-[#080808] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Skull size={14} className="text-[#F04E23]" />
                            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Captured Minds</span>
                        </div>
                        <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">3 / 100</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {DUNGEON_CAPTIVES.map((captive) => (
                            <div key={captive.id} className="w-full bg-[#0A0A0A] border border-white/5 p-3 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-white/20 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-[#F04E23]/10 group-hover:border-[#F04E23]/30 transition-colors">
                                    <Lock size={14} className="text-gray-600 group-hover:text-[#F04E23] transition-colors" />
                                </div>
                                <div className="flex flex-col flex-grow">
                                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{captive.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-mono uppercase px-1.5 rounded ${captive.status === 'Captured' ? 'bg-[#F04E23]/20 text-[#F04E23]' : 'bg-gray-800 text-gray-500'}`}>
                                            {captive.status}
                                        </span>
                                        <span className="text-[8px] font-mono text-gray-600">{captive.time} ago</span>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                    <Crosshair size={16} className="text-gray-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </main>

      {/* --- FLOATING NAV (Desktop) & FIXED NAV (Mobile) --- */}
      <nav className="fixed bottom-0 left-0 right-0 lg:bottom-8 lg:w-auto lg:left-1/2 lg:-translate-x-1/2 z-50">
          <div className="h-16 lg:h-16 w-full lg:w-auto px-0 lg:px-12 border-t lg:border border-white/10 flex items-center justify-around lg:gap-16 bg-[#050505]/90 backdrop-blur-xl lg:rounded-full lg:shadow-2xl">
              
              {/* Home Item */}
              <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 text-[#F04E23] cursor-pointer group flex-1 lg:flex-none justify-center">
                  <Hexagon size={24} strokeWidth={2.5} className="group-hover:drop-shadow-[0_0_8px_rgba(240,78,35,0.6)] transition-all"/>
                  <span className="hidden lg:block text-xs font-bold uppercase tracking-wider">Home</span>
                  <div className="w-1 h-1 bg-current rounded-full lg:hidden mt-1"></div>
              </div>

              {/* Arena Item */}
              <Link href="/arena" className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 text-gray-500 hover:text-white transition-colors cursor-pointer flex-1 lg:flex-none justify-center group">
                  <Crosshair size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:block text-xs font-bold uppercase tracking-wider">Arena</span>
              </Link>

              {/* Rank Item */}
              <Link href="/leaderboard" className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 text-gray-500 hover:text-white transition-colors cursor-pointer flex-1 lg:flex-none justify-center group">
                  <BrainCircuit size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden lg:block text-xs font-bold uppercase tracking-wider">Rank</span>
              </Link>
          </div>
      </nav>

    </div>
  );
}