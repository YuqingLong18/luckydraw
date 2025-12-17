import { create } from 'zustand';
import { randomIntCrypto } from '../utils/random';

export type Phase = 'IDLE' | 'RUNNING' | 'WINNER_VIEW';

export interface Winner {
  name: string;
  timestamp: number;
  round: number;
}

export interface Settings {
  persist: boolean;
  sound: boolean;
  reducedMotion: boolean;
  dedupe: boolean;
}

export interface AppState {
  allNames: string[];
  remainingNames: string[];
  winners: Winner[];
  round: number;
  settings: Settings;
  // isRunning: boolean; // Replaced by phase
  phase: Phase;
  currentWinner: string | null;

  importNames: (names: string[]) => void;
  reset: () => void;

  startDraw: () => void;
  completeDraw: () => void;
  dismissWinner: () => void;

  updateSettings: (settings: Partial<Settings>) => void;
  // toggleRun: (isRunning: boolean) => void;
}

// Helper for Fisher-Yates shuffle
const shuffle = (array: string[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = randomIntCrypto(i + 1);
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const useStore = create<AppState>((set, get) => ({
  allNames: [],
  remainingNames: [],
  winners: [],
  round: 1,
  settings: {
    persist: false,
    sound: false,
    reducedMotion: false,
    dedupe: true,
  },
  phase: 'IDLE',
  currentWinner: null,

  importNames: (names: string[]) => {
    let cleanedNames = names
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (get().settings.dedupe) {
      cleanedNames = Array.from(new Set(cleanedNames));
    }

    set({
      allNames: cleanedNames,
      remainingNames: shuffle(cleanedNames),
      winners: [],
      round: 1,
      phase: 'IDLE',
      currentWinner: null,
    });
  },

  reset: () => {
    const { allNames } = get();
    set({
      remainingNames: shuffle(allNames),
      winners: [],
      round: 1,
      phase: 'IDLE',
      currentWinner: null,
    });
  },

  startDraw: () => {
    const { phase, remainingNames } = get();
    if (phase !== 'IDLE' || remainingNames.length === 0) return;
    set({ phase: 'RUNNING', currentWinner: null });
  },

  completeDraw: () => {
    const { phase, remainingNames } = get();
    if (phase !== 'RUNNING') return;

    // Pick winner
    const winnerName = remainingNames[remainingNames.length - 1]; // Last one

    set({
      phase: 'WINNER_VIEW',
      currentWinner: winnerName,
    });
  },

  dismissWinner: () => {
    const { phase, currentWinner, remainingNames, round, winners } = get();
    if (phase !== 'WINNER_VIEW' || !currentWinner) return;

    // Now we finalize the win
    const winner: Winner = {
      name: currentWinner,
      timestamp: Date.now(),
      round,
    };

    // Remove from remaining (it was the last one)
    let newRemaining = remainingNames;
    if (remainingNames[remainingNames.length - 1] === currentWinner) {
      newRemaining = remainingNames.slice(0, -1);
    } else {
      newRemaining = remainingNames.filter(n => n !== currentWinner);
    }

    set({
      phase: 'IDLE',
      currentWinner: null,
      winners: [...winners, winner],
      remainingNames: newRemaining,
      round: round + 1,
    });
  },

  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
}));
