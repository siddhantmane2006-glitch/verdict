// backend/gameEngine.js

const GAME_CONFIG = {
  WIN_THRESHOLD: 100,
  LOSE_THRESHOLD: 0,
  START_POSITION: 50,
  MAX_MOMENTUM: 2.5,
  DECAY_RATE: 0.1, // How fast the bar slows down
  PUSH_POWER: 4,   // Base power of a correct swipe
  STREAK_BONUS: 0.5 // Extra power per streak count
};

class GameSession {
  constructor(id, player1Id, player2Id) {
    this.id = id;
    this.players = {
      [player1Id]: { id: player1Id, streak: 0, role: 'bottom' }, // You (Blue)
      [player2Id]: { id: player2Id, streak: 0, role: 'top' }     // Enemy (Red)
    };
    
    this.state = {
      barPosition: GAME_CONFIG.START_POSITION, // 50/50
      momentum: 0, // Positive = Up (P2 winning), Negative = Down (P1 winning)
      timeLeft: 60,
      status: 'PLAYING',
      winner: null
    };

    this.lastUpdate = Date.now();
  }

  // Called when a user Swipes
  handleSwipe(playerId, isCorrect) {
    const player = this.players[playerId];
    const direction = player.role === 'top' ? 1 : -1; // Top pushes UP, Bottom pushes DOWN

    if (isCorrect) {
      player.streak += 1;
      // Calculate Force: Base + (Streak Bonus)
      const force = GAME_CONFIG.PUSH_POWER + (player.streak * GAME_CONFIG.STREAK_BONUS);
      this.state.momentum += (force * direction);
    } else {
      player.streak = 0; // Reset streak
      // Penalty: Push bar towards user (Ouch!)
      this.state.momentum -= (GAME_CONFIG.PUSH_POWER * direction);
    }
    
    // Cap momentum so it doesn't fly off screen instantly
    this.state.momentum = Math.max(Math.min(this.state.momentum, GAME_CONFIG.MAX_MOMENTUM), -GAME_CONFIG.MAX_MOMENTUM);
  }

  // The Physics Loop (Runs 10 times a second)
  tick() {
    if (this.state.status !== 'PLAYING') return this.state;

    // 1. Apply Momentum to Position
    this.state.barPosition += this.state.momentum;

    // 2. Apply Friction (Decay) - Bar tries to stop moving
    if (this.state.momentum > 0) this.state.momentum -= GAME_CONFIG.DECAY_RATE;
    if (this.state.momentum < 0) this.state.momentum += GAME_CONFIG.DECAY_RATE;

    // Clean up near-zero numbers
    if (Math.abs(this.state.momentum) < GAME_CONFIG.DECAY_RATE) this.state.momentum = 0;

    // 3. Check Win Condition (Knockout)
    if (this.state.barPosition >= GAME_CONFIG.WIN_THRESHOLD) this.endGame(Object.values(this.players).find(p => p.role === 'top').id);
    if (this.state.barPosition <= GAME_CONFIG.LOSE_THRESHOLD) this.endGame(Object.values(this.players).find(p => p.role === 'bottom').id);

    // 4. Check Timer
    const now = Date.now();
    if (now - this.lastUpdate >= 1000) {
      this.state.timeLeft--;
      this.lastUpdate = now;
      if (this.state.timeLeft <= 0) this.timeOut();
    }

    // Clamp values for safety
    this.state.barPosition = Math.min(100, Math.max(0, this.state.barPosition));

    return this.state;
  }

  timeOut() {
    // Whoever has more ground wins
    if (this.state.barPosition > 50) this.endGame(Object.values(this.players).find(p => p.role === 'top').id);
    else this.endGame(Object.values(this.players).find(p => p.role === 'bottom').id);
  }

  endGame(winnerId) {
    this.state.status = 'FINISHED';
    this.state.winner = winnerId;
  }
}

module.exports = { GameSession };