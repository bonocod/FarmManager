import type { AppState, DateFilter, DateRange, DailyEggRecord, Sale, Expense } from '@/types';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in Rwanda local time (UTC+2) */
export function todayStr(): string {
  const now = new Date();
  // Rwanda is UTC+2
  const rw = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return rw.toISOString().split('T')[0];
}

/** Format YYYY-MM-DD → DD/MM/YYYY */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/** Parse DD/MM/YYYY → YYYY-MM-DD */
export function parseDateDisplay(display: string): string {
  const [d, m, y] = display.split('/');
  return `${y}-${m}-${d}`;
}

/** Check if a date string is within the filter range */
export function isInFilter(
  dateStr: string,
  filter: DateFilter,
  range?: DateRange
): boolean {
  const today = todayStr();
  if (filter === 'today') return dateStr === today;

  const d = new Date(dateStr + 'T00:00:00');
  const t = new Date(today + 'T00:00:00');

  if (filter === 'week') {
    const start = new Date(t);
    start.setDate(t.getDate() - 6);
    return d >= start && d <= t;
  }
  if (filter === 'month') {
    return dateStr.startsWith(today.slice(0, 7));
  }
  if (filter === 'custom' && range) {
    return dateStr >= range.from && dateStr <= range.to;
  }
  return true; // 'all'
}

// ─── Tray / egg helpers ───────────────────────────────────────────────────────

export function traysToEggs(trays: number, traySize: number): number {
  return trays * traySize;
}

export function eggsToTraysAndSingles(eggs: number, traySize: number): { trays: number; singles: number } {
  const trays = Math.floor(eggs / traySize);
  const singles = eggs % traySize;
  return { trays, singles };
}

// ─── Egg balance ──────────────────────────────────────────────────────────────

export interface EggSummary {
  collected: number;
  roomA: number;
  roomB: number;
  roomC: number;
  eaten: number;
  broken: number;
  sold: number;
  available: number;
}

export function computeEggSummary(
  dailyEggs: DailyEggRecord[],
  sales: Sale[],
  filter: DateFilter,
  range?: DateRange
): EggSummary {
  const filteredEggs = dailyEggs.filter(r => isInFilter(r.date, filter, range));
  const filteredSales = sales.filter(s => isInFilter(s.date, filter, range));

  const roomA = filteredEggs.reduce((a, r) => a + r.roomA, 0);
  const roomB = filteredEggs.reduce((a, r) => a + r.roomB, 0);
  const roomC = filteredEggs.reduce((a, r) => a + r.roomC, 0);
  const collected = roomA + roomB + roomC;
  const eaten = filteredEggs.reduce((a, r) => a + r.eaten, 0);
  const broken = filteredEggs.reduce((a, r) => a + r.broken, 0);
  const sold = filteredSales.reduce((a, s) => a + s.eggs, 0);
  const available = Math.max(0, collected - eaten - broken - sold);

  return { collected, roomA, roomB, roomC, eaten, broken, sold, available };
}

/** Total available eggs across ALL time — used to validate new sales */
export function totalAvailableEggs(state: AppState): number {
  return computeEggSummary(state.dailyEggs, state.sales, 'all').available;
}

// ─── Financial ────────────────────────────────────────────────────────────────

export function computeFinancials(
  sales: Sale[],
  expenses: Expense[],
  filter: DateFilter,
  range?: DateRange
): { revenue: number; expenses: number; profit: number } {
  const rev = sales
    .filter(s => isInFilter(s.date, filter, range))
    .reduce((a, s) => a + s.total, 0);
  const exp = expenses
    .filter(e => isInFilter(e.date, filter, range))
    .reduce((a, e) => a + e.amount, 0);
  return { revenue: rev, expenses: exp, profit: rev - exp };
}

export function formatCurrency(amount: number, currency = 'RWF'): string {
  return `${currency} ${amount.toLocaleString('en-RW')}`;
}

// ─── ID generator ─────────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
