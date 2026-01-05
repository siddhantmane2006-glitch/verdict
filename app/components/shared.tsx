'use client';

import React from 'react';

export interface LogoProps {
  // FIXED: Added 'sm' to the allowed sizes
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  
  // Logic to handle the 3 sizes for your specific design
  const textSize = {
    sm: 'text-base', // Smaller for the Founders Card
    md: 'text-xl',   // Your default
    lg: 'text-2xl'   // Large
  }[size];

  return (
    <div className={`flex items-center gap-2 group cursor-pointer select-none ${className}`}>
      <div className="relative px-2">
        {/* Added transition-all for smoother hover */}
        <div className="absolute inset-0 bg-[#F04E23] transform -skew-x-12 -rotate-2 rounded-sm transition-all duration-300 group-hover:rotate-0 group-hover:skew-x-0 group-hover:scale-105"></div>
        <span className={`relative font-sans font-bold ${textSize} tracking-tight text-white z-10`}>
          Verdict.
        </span>
      </div>
    </div>
  );
};

export const AppFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F9F9F7] md:bg-[#e1e1e1] font-sans text-[#1A1A1A] p-0 md:p-4 overflow-hidden">
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@700&display=swap');
      @keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
      @keyframes radar { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
      @keyframes slideInRight { 0% { transform: translateX(10px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
      .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
      .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      .animate-radar { animation: radar 2s infinite ease-out; }
      .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    
    <div className="w-full h-[100dvh] md:h-[85vh] md:w-[90vw] md:max-w-[1400px] md:max-h-[900px] bg-[#F9F9F7] md:rounded-[24px] md:border-[8px] md:border-white md:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col">
      {children}
    </div>
  </div>
);