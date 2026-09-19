// ─── Core data models ─────────────────────────────────────────────────────────
// All egg quantities are stored as individual eggs internally.
// The UI converts tray selections to egg counts before saving.

export interface DailyEggRecord {
  id: string;
  date: string;       // YYYY-MM-DD (Rwanda local date)
  roomA: number;      // individual eggs
  roomB: number;
  roomC: number;
  eaten: number;
  broken: number;
  notes: string;
}

export interface Sale {
  id: string;
  date: string;       // YYYY-MM-DD
  unitType: 'tray' | 'single';
  quantity: number;   // number of trays OR number of single eggs
  price: number;      // price per tray OR per single egg
  total: number;      // quantity × price
  eggs: number;       // individual eggs equivalent
  notes: string;
}

export interface Expense {
  id: string;
  date: string;
  type: ExpenseType;
  amount: number;
  description: string;
}

export type ExpenseType = 'Feed' | 'Medicine' | 'Transport' | 'Equipment' | 'Other';

export interface Settings {
  farmName: string;
  currency: string;
  traySize: number;           // default 30
  singleEggPrice: number;     // default 170
  trayPrices: number[];       // [4600, 4700, 4800, 4900, 5000]
}

export interface AppState {
  dailyEggs: DailyEggRecord[];
  sales: Sale[];
  expenses: Expense[];
  settings: Settings;
}

export type DateFilter = 'today' | 'week' | 'month' | 'all' | 'custom';

export interface DateRange {
  from: string;
  to: string;
}

// Tray + singles selector value
export interface TrayValue {
  trays: number;
  singles: number;
}
