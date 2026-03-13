import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type DisplayCurrency = 'USD' | 'EUR';

export interface UiState {
  readonly sidebarCollapsed: boolean;
  readonly displayCurrency: DisplayCurrency;
  readonly toggleSidebar: () => void;
  readonly setDisplayCurrency: (currency: DisplayCurrency) => void;
}

const STORAGE_KEY = 'solana-tracker-ui';

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        sidebarCollapsed: false,
        displayCurrency: 'USD',

        toggleSidebar: () => {
          set(
            (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
            undefined,
            'toggleSidebar',
          );
        },

        setDisplayCurrency: (currency: DisplayCurrency) => {
          set({ displayCurrency: currency }, undefined, 'setDisplayCurrency');
        },
      }),
      { name: STORAGE_KEY },
    ),
    { name: 'ui-store' },
  ),
);
