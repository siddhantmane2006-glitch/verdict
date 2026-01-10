const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: { origin: "*" }
});

// --- 🧠 PROCEDURAL PUZZLE GENERATORS ---

// 1. Math/Pattern Logic
const genMathPattern = (id) => {
    const start = Math.floor(Math.random() * 20) + 1;
    const step = Math.floor(Math.random() * 5) + 2;
    // 50% chance of Multiplication vs Addition
    if (Math.random() > 0.5 && start < 8) { 
        return {
            id, type: 'logic', prompt: 'COMPLETE PATTERN',
            visual: { type: 'text', content: `${start}, ${start*2}, ${start*4}, ?`, color: 'text-blue-400' },
            options: shuffle([{ label: `${start*8}`, val: 'correct' }, { label: `${start*6}`, val: 'wrong' }]),
            answer: 'correct'
        };
    }
    return {
        id, type: 'logic', prompt: 'NEXT NUMBER',
        visual: { type: 'text', content: `${start}, ${start+step}, ${start+(step*2)}, ?`, color: 'text-white' },
        options: shuffle([{ label: `${start+(step*3)}`, val: 'correct' }, { label: `${start+(step*3)+1}`, val: 'wrong' }]),
        answer: 'correct'
    };
};

// 2. Color/Stroop Test (Brain Conflict)
const genColorTrap = (id) => {
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    const cssColors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500'];
    
    const wordIdx = Math.floor(Math.random() * 4);
    const colorIdx = Math.floor(Math.random() * 4);
    
    // Command: Either read the text OR identify the color
    const cmd = Math.random() > 0.5 ? 'TEXT' : 'COLOR';
    const correctVal = cmd === 'TEXT' ? colors[wordIdx] : colors[colorIdx];
    
    // Generate a wrong answer that is definitely not the correct one
    let wrongVal = colors[(colorIdx + 1) % 4];
    if (wrongVal === correctVal) wrongVal = colors[(colorIdx + 2) % 4];

    return {
        id, type: 'logic', prompt: `TAP THE ${cmd}`,
        visual: { type: 'text', content: colors[wordIdx], color: cssColors[colorIdx], size: 'text-6xl' },
        options: shuffle([{ label: correctVal, val: 'correct' }, { label: wrongVal, val: 'wrong' }]),
        answer: 'correct'
    };
};

// 3. Scam Detection (Street Smart)
const genScamCheck = (id) => {
    const scams = [
        { msg: "URGENT: KYC Pending. Update at bit.ly/3x9...", type: "SCAM" },
        { msg: "Bank: ₹500.00 debited for Hotstar.", type: "REAL" },
        { msg: "Lotto: You won 1 Crore! Pay ₹500 tax.", type: "SCAM" },
        { msg: "Mom: I lost my phone. Msg this nr.", type: "SCAM" },
        { msg: "OTP: 4921 is your verification code.", type: "REAL" }
    ];
    const item = scams[Math.floor(Math.random() * scams.length)];
    return {
        id, type: 'social', prompt: 'REAL OR SCAM?',
        visual: { type: 'chat', sender: 'Unknown', msg: item.msg },
        options: [{ label: 'REAL', val: item.type === 'REAL' ? 'correct' : 'wrong' }, { label: 'SCAM', val: item.type === 'SCAM' ? 'correct' : 'wrong' }],
        answer: 'correct'
    };
};

// 4. Spatial Logic (Direction)
const genSpatial = (id) => {
    const dirs = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    const startIdx = Math.floor(Math.random() * 4);
    const endIdx = (startIdx + 2) % 4; // 180 degree turn
    return {
        id, type: 'logic', prompt: 'SPATIAL LOGIC',
        visual: { type: 'text', content: `Face ${dirs[startIdx]}. Turn 180°.`, color: 'text-yellow-400', size: 'text-3xl' },
        options: shuffle([{ label: dirs[endIdx], val: 'correct' }, { label: dirs[startIdx], val: 'wrong' }]),
        answer: 'correct'
    };
};

// 5. Logic Riddles
const genRiddle = (id) => {
    const data = [
        { q: "I speak without a mouth.", correct: "ECHO", wrong: "RADIO" },
        { q: "What falls but never breaks?", correct: "NIGHT", wrong: "GLASS" },
        { q: "I have keys but no locks.", correct: "PIANO", wrong: "DOOR" },
        { q: "Heavier: 1kg Steel vs 1kg Cotton", correct: "EQUAL", wrong: "STEEL" }
    ];
    const item = data[Math.floor(Math.random() * data.length)];
    return {
        id, type: 'crime', prompt: 'SOLVE RIDDLE',
        visual: { type: 'fact', content: item.q },
        options: shuffle([{ label: item.correct, val: 'correct' }, { label: item.wrong, val: 'wrong' }]),
        answer: 'correct'
    };
};

// --- MASTER DECK BUILDER ---
const generateDeck = () => {
    const deck = [];
    
    // 1. Observation (Fixed Visual for MVP sync)
    deck.push({ 
        id: 'obs_1', type: 'observation', prompt: 'MEMORIZE SCENE', 
        visual: { imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800', question: 'WAS THE LIGHT RED?' }, 
        options: [{ label: 'YES', val: 'wrong' }, { label: 'NO', val: 'correct' }], answer: 'correct' 
    });

    // 2. Procedural Loop (14 Questions)
    const generators = [genMathPattern, genColorTrap, genScamCheck, genSpatial, genRiddle];
    for(let i=0; i<14; i++) {
        const gen = generators[Math.floor(Math.random() * generators.length)];
        deck.push(gen(`q_${i}`));
    }
    return deck;
};

// Helper
function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

// --- SOCKET LOGIC ---
let queue = [];
const games = {}; 

io.on("connection", (socket) => {
  console.log(`Player Connected: ${socket.id}`);

  // 1. MATCHMAKING
  socket.on("find_match", () => {
    queue.push(socket.id);
    
    if (queue.length >= 2) {
      const p1 = queue.shift();
      const p2 = queue.shift();
      const roomId = `arena_${Date.now()}`;
      const deck = generateDeck(); // UNIQUE DECK GENERATED

      games[roomId] = {
        players: { [p1]: 'p1', [p2]: 'p2' }, 
        deck: deck,
        tugValue: 50, // 100 = P1 Wins, 0 = P2 Wins
        status: 'playing',
        timeLeft: 60,
        lastUpdate: Date.now()
      };

      io.to(p1).emit("match_found", { roomId, role: 'p1', deck });
      io.to(p2).emit("match_found", { roomId, role: 'p2', deck });

      io.sockets.sockets.get(p1)?.join(roomId);
      io.sockets.sockets.get(p2)?.join(roomId);

      startGameLoop(roomId);
    }
  });

  // 2. PLAYER HIT (Correct Answer)
  socket.on("submit_success", ({ roomId, timeTaken }) => {
    const game = games[roomId];
    if (!game || game.status !== 'playing') return;

    const role = game.players[socket.id];
    const direction = role === 'p1' ? 1 : -1;
    
    // Critical Hit Logic (<1.5s)
    const power = timeTaken < 1500 ? 10 : 5;
    
    game.tugValue += (power * direction);
    game.tugValue = Math.max(0, Math.min(100, game.tugValue));

    // Instant Sync
    io.to(roomId).emit("game_tick", { tugValue: game.tugValue, timeLeft: game.timeLeft });
    checkWin(game, roomId);
  });

  // 3. PLAYER SLIP (Wrong Answer)
  socket.on("submit_fail", ({ roomId }) => {
    const game = games[roomId];
    if (!game) return;
    
    const role = game.players[socket.id];
    const direction = role === 'p1' ? 1 : -1;
    
    // Penalty: You lose ground (Bar moves towards opponent)
    game.tugValue -= (10 * direction); 
    game.tugValue = Math.max(0, Math.min(100, game.tugValue));
    
    io.to(roomId).emit("game_tick", { tugValue: game.tugValue, timeLeft: game.timeLeft });
    checkWin(game, roomId);
  });
});

function checkWin(game, roomId) {
    if (game.tugValue >= 100) endGame(roomId, Object.keys(game.players).find(k => game.players[k] === 'p1'));
    if (game.tugValue <= 0) endGame(roomId, Object.keys(game.players).find(k => game.players[k] === 'p2'));
}

function startGameLoop(roomId) {
  const interval = setInterval(() => {
    const game = games[roomId];
    if (!game) { clearInterval(interval); return; }

    const now = Date.now();
    if (now - game.lastUpdate >= 1000) {
      game.timeLeft--;
      game.lastUpdate = now;
    }

    if (game.timeLeft <= 0) {
      const winner = game.tugValue > 50 
        ? Object.keys(game.players).find(k => game.players[k] === 'p1')
        : Object.keys(game.players).find(k => game.players[k] === 'p2');
      endGame(roomId, winner);
      clearInterval(interval);
      return;
    }
    // Broadcast Time
    io.to(roomId).emit("game_tick", { tugValue: game.tugValue, timeLeft: game.timeLeft });
  }, 100);
}

function endGame(roomId, winnerId) {
  io.to(roomId).emit("game_over", { winnerId });
  delete games[roomId];
}

console.log("Verdict Intelligence Server Live on 3001");