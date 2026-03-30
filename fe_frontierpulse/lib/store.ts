import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  // ── Existing UI state ──
  selectedSystemId: number | null;
  selectedPlayerAddress: string | null;
  activeView: "overview" | "systems" | "players" | "alerts";
  setSelectedSystem: (id: number | null) => void;
  setSelectedPlayer: (address: string | null) => void;
  setActiveView: (view: UIStore["activeView"]) => void;

  // ── Watchlist / personalization ──
  walletAddress: string | null;
  watchedSystemIds: number[];
  personalSystemIds: number[]; // auto-detected from wallet activity
  setWalletAddress: (addr: string | null) => void;
  setPersonalSystems: (ids: number[]) => void;
  toggleWatchSystem: (id: number) => void;
  clearWatchlist: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // ── Existing ──
      selectedSystemId: null,
      selectedPlayerAddress: null,
      activeView: "overview",
      setSelectedSystem: (id) => set({ selectedSystemId: id, selectedPlayerAddress: null }),
      setSelectedPlayer: (address) => set({ selectedPlayerAddress: address }),
      setActiveView: (view) => set({ activeView: view }),

      // ── Watchlist ──
      walletAddress: null,
      watchedSystemIds: [],
      personalSystemIds: [],
      setWalletAddress: (addr) => set({ walletAddress: addr }),
      setPersonalSystems: (ids) => set({ personalSystemIds: ids }),
      toggleWatchSystem: (id) =>
        set((state) => ({
          watchedSystemIds: state.watchedSystemIds.includes(id)
            ? state.watchedSystemIds.filter((sid) => sid !== id)
            : [...state.watchedSystemIds, id],
        })),
      clearWatchlist: () => set({ watchedSystemIds: [], personalSystemIds: [], walletAddress: null }),
    }),
    {
      name: "frontier-pulse",
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        watchedSystemIds: state.watchedSystemIds,
        personalSystemIds: state.personalSystemIds,
      }),
    }
  )
);
