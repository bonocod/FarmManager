import type { AppState } from '@/types';

const STORAGE_KEY = 'farm_eggs_v1';

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
