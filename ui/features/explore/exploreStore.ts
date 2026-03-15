import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ExploreState {
  readonly inputValue: string;
  readonly exploredAddress: string | null;
  readonly setInputValue: (value: string) => void;
  readonly explore: (address: string) => void;
  readonly clearExplore: () => void;
}

export const useExploreStore = create<ExploreState>()(
  devtools(
    (set) => ({
      inputValue: '',
      exploredAddress: null,

      setInputValue: (value: string) => {
        set({ inputValue: value }, undefined, 'setInputValue');
      },

      explore: (address: string) => {
        set({ exploredAddress: address }, undefined, 'explore');
      },

      clearExplore: () => {
        set({ inputValue: '', exploredAddress: null }, undefined, 'clearExplore');
      },
    }),
    { name: 'explore-store' },
  ),
);
