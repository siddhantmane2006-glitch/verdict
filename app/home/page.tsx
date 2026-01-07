'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Trophy, Skull, Crosshair, Settings, Lock, Gavel // Changed Swords to Gavel
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA ---
const USER = {
  name: "Founder",
  rank: "Diamond II",
  elo: 2450,
  streak: 5,
  credits: 1200
};

// "The Dungeon" - Players you have defeated
const DUNGEON_CAPTIVES = [
  { id: 1, name: "KillerMike", time: "2h ago", status: "Captured" },
  { id: 2, name: "LogicBro", time: "5h ago", status: "Captured" },
  { id: 3, name: "Sarah99", time: "1d ago", status: "Bailed Out" }, 
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] selection:text-white flex flex-col relative overflow-hidden">
      
      {/* GLOBAL BG TEXTURE */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none"></div>

      {/* --- TOP NAV --- */}
      <header className="flex justify-between items-center p-6 relative z-20">
        {/* Left: User Profile */}
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F04E23] to-black p-[1px]">
                <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                    <span className="font-black text-xs">FD</span>
                </div>
            </div>
            <div className="leading-none">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Operator</p>
                <p className="text-sm font-bold text-white">{USER.name}</p>
            </div>
        </div>

        {/* Right: Resources */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <Zap size={12} className="text-[#F04E23] fill-[#F04E23]" />
                <span className="text-xs font-mono font-bold">{USER.credits}</span>
            </div>
            <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <Settings size={18} className="text-gray-400" />
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow flex flex-col items-center relative z-10 px-6 pt-8 pb-24">
        
        {/* 1. RANK CARD */}
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md bg-[#0F0F0F] border border-white/10 p-6 rounded-3xl relative overflow-hidden mb-12 group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={100} />
            </div>
            
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border border-white/10 px-2 py-1 rounded">Season 1</span>
                <span className="text-[#F04E23] text-xs font-black tracking-widest flex items-center gap-1">
                    <Zap size={12} /> {USER.streak} WIN STREAK
                </span>
            </div>
            
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-1">
                {USER.rank}
            </h1>
            <p className="text-gray-400 text-sm font-mono mb-6">Elo Rating: {USER.elo}</p>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className="w-[75%] h-full bg-[#F04E23] shadow-[0_0_10px_#F04E23]"></div>
            </div>
            <p className="text-[10px] text-gray-500 text-right">75 / 100 to Rank Up</p>
        </motion.div>

        {/* 2. THE BIG PLAY BUTTON (HERO) */}
        <div className="relative w-full max-w-md flex justify-center mb-16">
            {/* Pulsing Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#F04E23]/20 rounded-full animate-[ping_3s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#F04E23]/40 rounded-full animate-[ping_3s_linear_infinite_1.5s]"></div>
            
            <Link href="/arena" className="relative group">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-40 h-40 bg-gradient-to-b from-[#1a1a1a] to-black border border-white/10 rounded-full flex flex-col items-center justify-center relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] group-hover:border-[#F04E23]/50 transition-colors"
                >
                    <div className="absolute inset-0 rounded-full bg-[#F04E23] opacity-0 group-hover:opacity-10 blur-xl transition-opacity"></div>
                    {/* ICON CHANGED HERE */}
                    <Gavel size={32} className="text-white mb-2 group-hover:text-[#F04E23] transition-colors" />
                    <span className="text-sm font-black uppercase tracking-widest text-white">ENTER</span>
                    <span className="text-[10px] font-mono text-gray-500 mt-1">50 CR</span>
                </motion.button>
            </Link>
        </div>

        {/* 3. THE DUNGEON (YOUR VICTIMS) */}
        <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                    <Lock size={14} className="text-gray-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-300">The Dungeon</h3>
                </div>
                <span className="text-[10px] text-gray-600 font-mono">3 CAPTIVES</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {/* Captured Card */}
                {DUNGEON_CAPTIVES.map((captive) => (
                    <div key={captive.id} className="min-w-[100px] h-32 bg-[#0F0F0F] border border-white/10 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                        {/* Status Stamp */}
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${captive.status === 'Captured' ? 'bg-[#F04E23] animate-pulse' : 'bg-gray-700'}`}></div>
                        
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-3 grayscale group-hover:grayscale-0 transition-all">
                            <Skull size={18} className="text-gray-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-300">{captive.name}</p>
                        <p className="text-[9px] text-gray-600 font-mono mt-1">{captive.time}</p>

                        {/* Overlay for interaction */}
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-mono text-[#F04E23] uppercase tracking-widest border border-[#F04E23] px-1 py-0.5">View</span>
                        </div>
                    </div>
                ))}

                {/* Empty Slot Placeholder */}
                <div className="min-w-[100px] h-32 bg-[#050505] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center opacity-50">
                    <Crosshair size={18} className="text-gray-600 mb-2" />
                    <p className="text-[9px] text-gray-600 font-mono text-center px-2">HUNT MORE</p>
                </div>
            </div>
        </div>

      </main>

      {/* --- BOTTOM NAV (Minimal) --- */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center gap-12 z-50 pointer-events-none">
          {/* Using pointer-events-auto on buttons to allow clicking through the gradient */}
          <button className="pointer-events-auto flex flex-col items-center gap-1 opacity-100 group">
              <div className="w-1 h-1 bg-[#F04E23] rounded-full mb-1 opacity-100 shadow-[0_0_5px_#F04E23]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Arena</span>
          </button>
          
          <button className="pointer-events-auto flex flex-col items-center gap-1 opacity-40 group hover:opacity-100 transition-opacity">
              <div className="w-1 h-1 bg-transparent rounded-full mb-1"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Social</span>
          </button>

          <button className="pointer-events-auto flex flex-col items-center gap-1 opacity-40 group hover:opacity-100 transition-opacity">
              <div className="w-1 h-1 bg-transparent rounded-full mb-1"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Shop</span>
          </button>
      </nav>

    </div>
  );
}