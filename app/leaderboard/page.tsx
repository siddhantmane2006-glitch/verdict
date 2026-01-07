'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, ChevronLeft, Search, Zap, 
  Crown, TrendingUp, Shield, Globe, Users 
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA ---
const LEADERBOARD_DATA = [
  { id: 1, name: "KillerMike", rank: 1, elo: 2850, streak: 12, tier: 'Grandmaster' },
  { id: 2, name: "Sarah99", rank: 2, elo: 2790, streak: 4, tier: 'Master' },
  { id: 3, name: "LogicBro", rank: 3, elo: 2745, streak: 8, tier: 'Master' },
  { id: 4, name: "AlexDev", rank: 4, elo: 2680, streak: 2, tier: 'Diamond I' },
  { id: 5, name: "ShadowX", rank: 5, elo: 2650, streak: 0, tier: 'Diamond I' },
  { id: 6, name: "Viper", rank: 6, elo: 2610, streak: 5, tier: 'Diamond II' },
  { id: 7, name: "Founder", rank: 7, elo: 2450, streak: 5, tier: 'Diamond II', isMe: true }, // YOU
  { id: 8, name: "NoobSlayer", rank: 8, elo: 2390, streak: 1, tier: 'Diamond III' },
  { id: 9, name: "Guest_99", rank: 9, elo: 2300, streak: 0, tier: 'Platinum I' },
  { id: 10, name: "TestUser", rank: 10, elo: 2280, streak: 2, tier: 'Platinum II' },
];

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<'global' | 'friends'>('global');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] selection:text-white flex flex-col relative overflow-hidden">
      
      {/* GLOBAL BG */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex flex-col gap-4">
        
        {/* Top Row: Nav + Title */}
        <div className="flex items-center justify-between">
            <Link href="/" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <ChevronLeft size={20} className="text-gray-400" />
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tighter">Ranking</h1>
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                <Search size={18} className="text-gray-400" />
            </div>
        </div>

        {/* Filter Toggle */}
        <div className="grid grid-cols-2 bg-[#111] p-1 rounded-xl border border-white/10">
            <button 
                onClick={() => setFilter('global')}
                className={`h-10 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${filter === 'global' ? 'bg-[#F04E23] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                <Globe size={14} /> Global
            </button>
            <button 
                onClick={() => setFilter('friends')}
                className={`h-10 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${filter === 'friends' ? 'bg-[#F04E23] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
                <Users size={14} /> Friends
            </button>
        </div>
      </header>

      {/* --- SCROLLABLE LIST --- */}
      <main className="flex-grow px-4 pt-6 pb-32 overflow-y-auto">
        
        {/* TOP 3 PODIUM */}
        <div className="grid grid-cols-3 gap-3 mb-8 items-end">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <div className="w-16 h-16 bg-[#111] rounded-2xl border border-white/10 flex items-center justify-center mb-3">
                        <span className="text-2xl font-black text-gray-400">2</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gray-700 text-[10px] font-bold px-1.5 rounded border border-[#050505]">#2</div>
                </div>
                <p className="text-xs font-bold text-gray-400 truncate w-full text-center">Sarah99</p>
                <p className="text-[10px] font-mono text-gray-600">2790</p>
            </div>

            {/* 1st Place (Center, Big) */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <Crown size={24} className="text-[#F04E23] fill-[#F04E23] animate-bounce" />
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-b from-[#F04E23] to-[#992e12] rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(240,78,35,0.3)] border border-[#F04E23]">
                        <span className="text-3xl font-black text-white">1</span>
                    </div>
                </div>
                <p className="text-sm font-black text-white truncate w-full text-center">KillerMike</p>
                <p className="text-[10px] font-mono text-[#F04E23]">2850 ELO</p>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <div className="w-16 h-16 bg-[#111] rounded-2xl border border-white/10 flex items-center justify-center mb-3">
                        <span className="text-2xl font-black text-[#8B4513]">3</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#8B4513] text-[10px] font-bold px-1.5 rounded border border-[#050505]">#3</div>
                </div>
                <p className="text-xs font-bold text-gray-400 truncate w-full text-center">LogicBro</p>
                <p className="text-[10px] font-mono text-gray-600">2745</p>
            </div>
        </div>

        {/* LIST 4-10 */}
        <div className="flex flex-col gap-3">
            {LEADERBOARD_DATA.slice(3).map((user, index) => (
                <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${user.isMe ? 'bg-white/10 border-[#F04E23]/50' : 'bg-[#0F0F0F] border-white/5'}`}
                >
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-mono text-gray-500 w-6 text-center">{user.rank}</span>
                        <div className="flex flex-col">
                            <span className={`text-sm font-bold ${user.isMe ? 'text-white' : 'text-gray-300'}`}>
                                {user.name} {user.isMe && <span className="text-[10px] bg-[#F04E23] px-1 rounded ml-2">YOU</span>}
                            </span>
                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wide flex items-center gap-1">
                                {user.tier}
                                {user.streak > 2 && <span className="text-[#F04E23] flex items-center gap-0.5 ml-2"><Zap size={8} fill="currentColor"/> {user.streak}</span>}
                            </span>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <span className="text-sm font-mono font-bold text-white">{user.elo}</span>
                        {/* Fake trend indicator */}
                        <div className="text-[9px] text-green-500 flex items-center justify-end gap-0.5">
                            <TrendingUp size={10} /> +{Math.floor(Math.random() * 20)}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </main>

      {/* --- STICKY USER STATS (BOTTOM) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#050505] border-t border-white/10 p-4 pb-8 z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between bg-[#1a1a1a] rounded-2xl p-4 border border-[#F04E23]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
              
              {/* Glow Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F04E23]"></div>

              <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-10 h-10 bg-[#F04E23]/20 rounded-lg">
                      <span className="text-sm font-black text-[#F04E23]">7</span>
                  </div>
                  <div>
                      <p className="text-xs text-gray-400 font-mono uppercase">Your Rank</p>
                      <p className="text-base font-bold text-white">Diamond II</p>
                  </div>
              </div>

              <div className="text-right">
                  <p className="text-xl font-mono font-black text-white">2450</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Elo Rating</p>
              </div>
          </div>
      </div>

    </div>
  );
}