import { create } from 'zustand';
import { randomIntCrypto } from '../utils/random';
import type { Language } from '../utils/i18n';

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
  language: Language;
  settings: Settings;
  // isRunning: boolean; // Replaced by phase
  phase: Phase;
  currentWinner: string | null;
  plannedWinner: string | null;
  plannedWinnerIndex: number | null;
  drawStartedAt: number | null;

  importNames: (names: string[]) => void;
  reset: () => void;

  startDraw: () => void;
  completeDraw: () => void;
  dismissWinner: () => void;

  setLanguage: (language: Language) => void;
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
  language: 'zh',
  settings: {
    persist: false,
    sound: false,
    reducedMotion: false,
    dedupe: true,
  },
  phase: 'IDLE',
  currentWinner: null,
  plannedWinner: null,
  plannedWinnerIndex: null,
  drawStartedAt: null,

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
      plannedWinner: null,
      plannedWinnerIndex: null,
      drawStartedAt: null,
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
      plannedWinner: null,
      plannedWinnerIndex: null,
      drawStartedAt: null,
    });
  },

  startDraw: () => {
    const { phase, remainingNames } = get();
    if (phase !== 'IDLE' || remainingNames.length === 0) return;
    const idx = randomIntCrypto(remainingNames.length);
    const winnerName = remainingNames[idx] ?? null;
    set({
      phase: 'RUNNING',
      currentWinner: null,
      plannedWinner: winnerName,
      plannedWinnerIndex: winnerName ? idx : null,
      drawStartedAt: Date.now(),
    });
  },

  completeDraw: () => {
    const { phase, remainingNames, plannedWinner } = get();
    if (phase !== 'RUNNING') return;

    // Winner is preselected at startDraw (still derived from remainingNames shuffle).
    const winnerName = plannedWinner ?? remainingNames[remainingNames.length - 1] ?? null;
    if (!winnerName) return;

    set({
      phase: 'WINNER_VIEW',
      currentWinner: winnerName,
    });
  },

  dismissWinner: () => {
    const { phase, currentWinner, remainingNames, plannedWinnerIndex, round, winners } = get();
    if (phase !== 'WINNER_VIEW' || !currentWinner) return;

    // Now we finalize the win
    const winner: Winner = {
      name: currentWinner,
      timestamp: Date.now(),
      round,
    };

    // Remove from remaining (remove exactly one occurrence).
    let newRemaining = remainingNames;
    if (plannedWinnerIndex !== null && remainingNames[plannedWinnerIndex] === currentWinner) {
      newRemaining = remainingNames.slice(0, plannedWinnerIndex).concat(remainingNames.slice(plannedWinnerIndex + 1));
    } else {
      const fallbackIndex = remainingNames.indexOf(currentWinner);
      if (fallbackIndex !== -1) {
        newRemaining = remainingNames.slice(0, fallbackIndex).concat(remainingNames.slice(fallbackIndex + 1));
      }
    }

    set({
      phase: 'IDLE',
      currentWinner: null,
      plannedWinner: null,
      plannedWinnerIndex: null,
      drawStartedAt: null,
      winners: [...winners, winner],
      remainingNames: newRemaining,
      round: round + 1,
    });
  },

  setLanguage: (language) => set({ language }),
  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
}));
