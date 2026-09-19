import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, DailyEggRecord, Sale, Expense, Settings } from '@/types';
import { loadState, saveState, clearState } from '@/lib/storage';
import { DEMO_DATA } from '@/constants/sampleData';

// ─── Action types ─────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_DAILY_EGG'; payload: DailyEggRecord }
  | { type: 'UPDATE_DAILY_EGG'; payload: DailyEggRecord }
  | { type: 'DELETE_DAILY_EGG'; id: string }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_SALE'; payload: Sale }
  | { type: 'DELETE_SALE'; id: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; id: string }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'RESET_TO_DEMO' }
  | { type: 'CLEAR_ALL' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_DAILY_EGG':
      return { ...state, dailyEggs: [...state.dailyEggs, action.payload] };
    case 'UPDATE_DAILY_EGG':
      return { ...state, dailyEggs: state.dailyEggs.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'DELETE_DAILY_EGG':
      return { ...state, dailyEggs: state.dailyEggs.filter(r => r.id !== action.id) };

    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'UPDATE_SALE':
      return { ...state, sales: state.sales.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SALE':
      return { ...state, sales: state.sales.filter(s => s.id !== action.id) };

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.id) };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };

    case 'RESET_TO_DEMO':
      return { ...DEMO_DATA };

    case 'CLEAR_ALL':
      return {
        dailyEggs: [],
        sales: [],
        expenses: [],
        settings: { ...state.settings },
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const initial = loadState() ?? { ...DEMO_DATA };
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
