// components/Arena.tsx
import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001'; // Your Backend URL

export default function Arena() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, SEARCHING, PLAYING, END
  const [gameState, setGameState] = useState<any>(null);
  const [myRole, setMyRole] = useState<'top' | 'bottom'>('bottom');
  const [result, setResult] = useState<string | null>(null);

  // Initialize Socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('match_found', (data) => {
      setMyRole(data.role);
      setStatus('PLAYING');
    });

    newSocket.on('game_tick', (state) => {
      setGameState(state);
    });

    newSocket.on('game_over', ({ winner }) => {
      setStatus('END');
      setResult(winner === newSocket.id ? 'VICTORY' : 'DEFEAT');
    });

    return () => { newSocket.close(); };
  }, []);

  const findMatch = () => {
    setStatus('SEARCHING');
    socket?.emit('find_match', {});
  };

  const handleSwipe = (answer: boolean) => {
    if (status !== 'PLAYING') return;
    
    // In a real app, 'answer' comes from your Logic Puzzle Component
    // For testing: True = Correct, False = Wrong
    const isCorrect = Math.random() > 0.3; // Simulate 70% accuracy
    
    // Visual Haptic Feedback here
    if(navigator.vibrate) navigator.vibrate(isCorrect ? 10 : 100);

    socket?.emit('submit_swipe', { 
      roomId: gameState?.id || '', //Ideally pass room ID stored in state
      isCorrect 
    });
  };

  // --- RENDER HELPERS ---
  const getBarHeight = () => {
    if (!gameState) return 50;
    // If I am 'bottom', position 100 is BAD for me (Enemy Wins). 
    // Wait, physics logic: Top wins at 100, Bottom wins at 0.
    // So if I am Bottom, bar at 0 means I pushed it all the way down (I win).
    return gameState.barPosition; 
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-mono">
      
      {/* HEADER HUD */}
      <div className="absolute top-0 w-full p-4 flex justify-between z-10">
        <div className="text-red-500 font-bold">ENEMY</div>
        <div className="text-xl font-bold">{gameState?.timeLeft || 60}s</div>
      </div>

      {/* THE ARENA (Tug of War Bar) */}
      <div className="relative flex-1 flex flex-col justify-end">
        {/* The "Enemy" Zone (Top) */}
        <div className="w-full transition-all duration-75 bg-red-900/20" 
             style={{ height: `${100 - getBarHeight()}%` }}>
        </div>

        {/* THE BAR (The Rope) */}
        <div className="w-full h-2 bg-neon-blue shadow-[0_0_20px_#00f] z-20 transition-all duration-100 ease-linear"></div>

        {/* The "Player" Zone (Bottom) */}
        <div className="w-full transition-all duration-75 bg-blue-900/20" 
             style={{ height: `${getBarHeight()}%` }}>
        </div>
      </div>

      {/* CONTROLS (Overlay) */}
      <div className="absolute bottom-10 w-full flex flex-col items-center gap-4 z-30">
        
        {status === 'IDLE' && (
          <button onClick={findMatch} 
            className="px-8 py-4 bg-white text-black font-bold text-xl uppercase tracking-widest skew-x-[-10deg] hover:bg-neon-red hover:text-white transition">
            Find Match
          </button>
        )}

        {status === 'SEARCHING' && (
          <div className="animate-pulse text-neon-blue">SEARCHING FOR OPPONENT...</div>
        )}

        {status === 'PLAYING' && (
          <div className="flex gap-4 w-full px-4">
             {/* Temporary Buttons to Simulate Swipes */}
            <button onClick={() => handleSwipe(false)} className="flex-1 h-32 bg-gray-800 border-2 border-red-500 rounded-xl active:bg-red-500">
              FALSE (Left)
            </button>
            <button onClick={() => handleSwipe(true)} className="flex-1 h-32 bg-gray-800 border-2 border-green-500 rounded-xl active:bg-green-500">
              TRUE (Right)
            </button>
          </div>
        )}

        {status === 'END' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
            <h1 className={`text-6xl font-black ${result === 'VICTORY' ? 'text-green-500' : 'text-red-500'}`}>
              {result}
            </h1>
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 border border-white">
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}