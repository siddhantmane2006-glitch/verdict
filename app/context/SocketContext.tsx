'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  opponent: any;
  setOpponent: (opp: any) => void;
  roomId: string;
  setRoomId: (id: string) => void;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    // Connect to your Node Server
    const newSocket = io('http://localhost:3001'); 
    setSocket(newSocket);

    return () => { newSocket.disconnect(); };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, opponent, setOpponent, roomId, setRoomId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);