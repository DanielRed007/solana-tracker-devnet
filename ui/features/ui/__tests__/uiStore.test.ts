import { beforeEach, describe, expect, it } from 'vitest';

import { useUiStore } from '@/features/ui/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    useUiStore.setState({
      sidebarCollapsed: false,
      displayCurrency: 'USD',
    });
  });

  it('initialises with sidebar expanded and USD currency', () => {
    const state = useUiStore.getState();
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.displayCurrency).toBe('USD');
  });

  it('toggleSidebar flips the collapsed state', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);

    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(false);
  });

  it('setDisplayCurrency updates the currency', () => {
    useUiStore.getState().setDisplayCurrency('EUR');
    expect(useUiStore.getState().displayCurrency).toBe('EUR');

    useUiStore.getState().setDisplayCurrency('USD');
    expect(useUiStore.getState().displayCurrency).toBe('USD');
  });
});
