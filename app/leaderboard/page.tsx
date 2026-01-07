'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Search, Zap, Crown, 
  TrendingUp, Target, Hexagon, BrainCircuit, Shield
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA (Updated with "Smart" Ranks) ---
const LEADERBOARD_DATA = [
  { id: 1, name: "KillerMike", rank: 1, elo: 2850, streak: 12, tier: 'TRANSCENDENT' },
  { id: 2, name: "Sarah99", rank: 2, elo: 2790, streak: 4, tier: 'AXIOM III' },
  { id: 3, name: "LogicBro", rank: 3, elo: 2745, streak: 8, tier: 'AXIOM II' },
  { id: 4, name: "AlexDev", rank: 4, elo: 2680, streak: 2, tier: 'AXIOM I' },
  { id: 5, name: "ShadowX", rank: 5, elo: 2650, streak: 0, tier: 'LOGIC IV' },
  { id: 6, name: "Viper", rank: 6, elo: 2610, streak: 5, tier: 'LOGIC III' },
  { id: 7, name: "Founder", rank: 7, elo: 2450, streak: 5, tier: 'LOGIC II', isMe: true }, // YOU
  { id: 8, name: "NoobSlayer", rank: 8, elo: 2390, streak: 1, tier: 'LOGIC I' },
  { id: 9, name: "Guest_99", rank: 9, elo: 2300, streak: 0, tier: 'CONCEPT V' },
  { id: 10, name: "TestUser", rank: 10, elo: 2280, streak: 2, tier: 'CONCEPT IV' },
  { id: 11, name: "PlayerOne", rank: 11, elo: 2100, streak: 0, tier: 'CONCEPT III' },
  { id: 12, name: "RandomGuy", rank: 12, elo: 2050, streak: 1, tier: 'CONCEPT II' },
];

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<'global' | 'friends'>('global');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] flex flex-col relative overflow-hidden">
      
      {/* Background Noise */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between mb-6">
            <Link href="/" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group">
                <ChevronLeft size={20} className="text-gray-400 group-hover:text-white" />
            </Link>
            
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-[#F04E23] uppercase tracking-widest">Global Consensus</span>
                <h1 className="text-lg font-black uppercase tracking-tighter">Hierarchy</h1>
            </div>

            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-400">
                <Search size={18} />
            </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex p-1 bg-[#111] rounded-xl border border-white/5 relative">
            <motion.div 
                className="absolute top-1 bottom-1 w-[50%] bg-[#222] rounded-lg shadow-sm"
                animate={{ left: filter === 'global' ? '4px' : '50%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button onClick={() => setFilter('global')} className={`flex-1 relative z-10 text-xs font-bold uppercase tracking-widest py-2 transition-colors ${filter === 'global' ? 'text-white' : 'text-gray-500'}`}>Global</button>
            <button onClick={() => setFilter('friends')} className={`flex-1 relative z-10 text-xs font-bold uppercase tracking-widest py-2 transition-colors ${filter === 'friends' ? 'text-white' : 'text-gray-500'}`}>Network</button>
        </div>
      </header>

      {/* --- SCROLL CONTENT --- */}
      <main className="flex-grow px-4 pt-6 pb-36 overflow-y-auto">
        
        {/* THE PODIUM (Top 3) */}
        <div className="flex justify-center items-end gap-3 mb-10 mt-4">
            
            {/* 2nd Place */}
            <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-gray-500 font-mono">#2</div>
                <div className="w-20 h-20 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center relative">
                    <span className="text-2xl font-black text-gray-300">SM</span>
                    <div className="absolute -bottom-3 px-2 py-0.5 bg-gray-800 rounded border border-white/10 text-[9px] font-mono">2790</div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Sarah99</span>
            </div>

            {/* 1st Place (Hero) */}
            <div className="flex flex-col items-center gap-2 relative z-10 -mb-4">
                <Crown size={24} className="text-[#F04E23] fill-[#F04E23] animate-bounce" />
                <div className="w-24 h-24 bg-gradient-to-b from-[#F04E23] to-[#992e12] rounded-3xl flex items-center justify-center relative shadow-[0_0_40px_rgba(240,78,35,0.4)] border border-[#F04E23]">
                    <span className="text-3xl font-black text-white">KM</span>
                    <div className="absolute -bottom-3 px-3 py-1 bg-white text-black rounded border border-white text-[10px] font-black">2850</div>
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest mt-2">KillerMike</span>
                <span className="text-[9px] font-mono text-[#F04E23] uppercase tracking-widest">Transcendent</span>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-gray-500 font-mono">#3</div>
                <div className="w-20 h-20 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center relative">
                    <span className="text-2xl font-black text-[#a16207]">LB</span>
                    <div className="absolute -bottom-3 px-2 py-0.5 bg-gray-800 rounded border border-white/10 text-[9px] font-mono">2745</div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">LogicBro</span>
            </div>
        </div>

        {/* THE LIST (4+) */}
        <div className="flex flex-col gap-2">
            {LEADERBOARD_DATA.slice(3).map((user, index) => (
                <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                        user.isMe 
                        ? 'bg-[#F04E23]/10 border-[#F04E23]/50 shadow-[0_0_20px_rgba(240,78,35,0.1)]' 
                        : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <span className={`text-sm font-mono w-6 text-center ${user.isMe ? 'text-[#F04E23] font-bold' : 'text-gray-600'}`}>
                            {user.rank}
                        </span>
                        
                        <div className="flex flex-col">
                            <span className={`text-sm font-bold ${user.isMe ? 'text-white' : 'text-gray-300'}`}>
                                {user.name}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{user.tier}</span>
                                {user.streak > 2 && (
                                    <span className="flex items-center gap-0.5 text-[9px] text-[#F04E23] font-bold">
                                        <Zap size={8} fill="currentColor"/> {user.streak}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* The "Target" icon for people close to your rank */}
                        {!user.isMe && user.rank === 6 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/20 border border-red-900/50 rounded text-[9px] text-red-500 font-mono uppercase tracking-widest">
                                <Target size={10} /> Target
                            </div>
                        )}
                        
                        <div className="text-right">
                            <span className="block text-sm font-mono font-bold text-white">{user.elo}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </main>

      {/* --- STICKY USER HUD (Bottom) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-[#050505] to-transparent pt-12 pb-6 px-6 z-50">
          <div className="max-w-2xl mx-auto bg-[#151515] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-2xl relative overflow-hidden group">
              {/* Animated Glow Bar */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#F04E23] shadow-[0_0_10px_#F04E23]"></div>
              
              <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-10 h-10 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-xs font-black text-white">#7</span>
                  </div>
                  <div>
                      <p className="text-[10px] text-[#F04E23] font-mono uppercase tracking-widest mb-0.5">Operative</p>
                      <p className="text-sm font-bold text-white">FOUNDER</p>
                  </div>
              </div>

              <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                      <p className="text-[9px] text-gray-500 uppercase">Tier</p>
                      <p className="text-xs font-bold text-gray-300">LOGIC II</p>
                  </div>
                  <div className="text-right">
                      <p className="text-[9px] text-gray-500 uppercase">Rating</p>
                      <p className="text-lg font-mono font-black text-white tracking-tight">2450</p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
}