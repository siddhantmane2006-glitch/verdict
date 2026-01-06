import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppFrame } from '@/app/components/shared';
import Image from 'next/image';
import { ArrowUp, Share2, MessageSquare } from 'lucide-react';

// 1. MOCK DATABASE (Later, fetch this from Supabase)
const TRENDING_TOPICS: Record<string, any> = {
  'elon-vs-apple': {
    title: "Elon Musk bans Apple Devices at Tesla?",
    summary: "Musk threatens to ban Apple devices if OpenAI is integrated at the OS level. Is this a security necessity or a petty rivalry?",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000",
    proponent: "Security Necessity",
    opponent: "Petty Rivalry",
    views: "1.2M"
  },
  'bitcoin-tax': {
    title: "Govt proposes 30% Flat Tax on Crypto",
    summary: "A new bill suggests a heavy tax on all digital assets. Is this fair regulation or innovation theft?",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=1000",
    proponent: "Fair Regulation",
    opponent: "Innovation Theft",
    views: "850K"
  }
};

type Props = {
  params: { slug: string };
};

// 2. DYNAMIC SEO (Crucial for Ranking)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = TRENDING_TOPICS[params.slug];
  if (!topic) return { title: 'Topic Not Found' };

  return {
    title: `Debate: ${topic.title} | Verdict`,
    description: `Join the arena. Argue for "${topic.proponent}" or "${topic.opponent}". Win Elo ranking.`,
    openGraph: {
      images: [topic.image], // Shows the news image when shared on Twitter/WhatsApp
    },
  };
}

// 3. THE PAGE UI
export default function DebatePage({ params }: Props) {
  const topic = TRENDING_TOPICS[params.slug];
  
  if (!topic) return notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F04E23] selection:text-white pb-20">
      
      {/* NEWS IMAGE HEADER */}
      <div className="relative w-full h-[50vh]">
        <Image 
          src={topic.image} 
          alt={topic.title} 
          fill 
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent"></div>
        
        {/* HEADLINE OVERLAY */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#F04E23] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded">Trending</span>
            <span className="text-gray-400 text-xs font-mono">{topic.views} Views</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight uppercase italic tracking-tighter mb-4 shadow-black drop-shadow-lg">
            {topic.title}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed">
            {topic.summary}
          </p>
        </div>
      </div>

      {/* THE ARENA: PICK A SIDE */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* SIDE A */}
        <button className="h-32 bg-[#1A1A1A] border border-white/10 hover:border-green-500 hover:bg-green-900/20 rounded-2xl p-6 text-left transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-green-500 font-mono text-xs font-bold uppercase tracking-widest block mb-1">Fight For</span>
            <h3 className="text-2xl font-black uppercase italic text-white group-hover:scale-105 transition-transform">{topic.proponent}</h3>
          </div>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity -rotate-45">
            <ArrowUp className="text-green-500" size={32} />
          </div>
        </button>

        {/* SIDE B */}
        <button className="h-32 bg-[#1A1A1A] border border-white/10 hover:border-red-500 hover:bg-red-900/20 rounded-2xl p-6 text-right transition-all group relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-end">
            <span className="text-red-500 font-mono text-xs font-bold uppercase tracking-widest block mb-1">Fight Against</span>
            <h3 className="text-2xl font-black uppercase italic text-white group-hover:scale-105 transition-transform">{topic.opponent}</h3>
          </div>
          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity rotate-45">
            <ArrowUp className="text-red-500" size={32} />
          </div>
        </button>

      </div>

      {/* LIVE FEED (SEO CONTENT) */}
      <div className="max-w-2xl mx-auto px-6 mt-16">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold uppercase tracking-tight">Live Arguments</h3>
            <div className="flex gap-4 text-gray-400">
                <span className="flex items-center gap-1 text-xs"><MessageSquare size={14} /> 428 Comments</span>
                <span className="flex items-center gap-1 text-xs"><Share2 size={14} /> Share</span>
            </div>
        </div>
        
        {/* Placeholder for comments (Crawlers love text here) */}
        <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex justify-between mb-2">
                    <span className="text-[#F04E23] text-xs font-bold uppercase">Top Rated Logic</span>
                    <span className="text-gray-500 text-xs">2m ago</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                    "This isn't about security. If you look at the kernel access required by the integration..."
                </p>
            </div>
        </div>
      </div>

    </div>
  );
}