// Global Zustand store — syncs game state across Phaser + React HUD
"use client";
import { create } from "zustand";

interface GameState {
  // Connection
  connected: boolean;
  setConnected: (v: boolean) => void;

  // Game status
  status: "menu" | "playing" | "paused" | "victory" | "defeat";
  setStatus: (s: GameState["status"]) => void;

  // Progress
  world: number;
  phase: number;
  lives: number;
  stars: number;

  // Rewards
  squadBalance: number;
  addSquad: (amount: number) => void;

  // Phase result (after completing)
  phaseResult: { phaseId: number; stars: number; time: number; kills: number; soldiersAlive: number } | null;
  setPhaseResult: (r: GameState["phaseResult"]) => void;

  // Actions
  startGame: () => void;
  startPhase: (world: number, phase: number) => void;
  onSoldierKilled: () => void;
  onPhaseComplete: (stars: number, time: number, kills: number, alive: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),

  status: "menu",
  setStatus: (s) => set({ status: s }),

  world: 1,
  phase: 1,
  lives: 4,
  stars: 0,
  squadBalance: 0,
  addSquad: (amount) => set((s) => ({ squadBalance: s.squadBalance + amount })),

  phaseResult: null,
  setPhaseResult: (r) => set({ phaseResult: r }),

  startGame: () => set({ status: "playing", lives: 4, world: 1, phase: 1 }),
  startPhase: (world, phase) => set({ world, phase, status: "playing" }),

  onSoldierKilled: () => {
    const lives = get().lives - 1;
    if (lives <= 0) {
      set({ lives: 0, status: "defeat" });
    } else {
      set({ lives });
    }
  },

  onPhaseComplete: (stars, time, kills, alive) => {
    set({
      status: "victory",
      stars,
      phaseResult: {
        phaseId: get().phase,
        stars,
        time,
        kills,
        soldiersAlive: alive,
      },
    });
  },
}));