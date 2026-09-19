import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/features/StatCard';
import DateSelector from '@/components/features/DateSelector';
import { useStore } from '@/lib/store';
import {
  computeEggSummary, computeFinancials,
  formatCurrency, formatDate, todayStr, isInFilter,
} from '@/lib/calculations';
import type { DateFilter, DateRange } from '@/types';

const FILTERS: { label: string; value: DateFilter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
  { label: 'Custom', value: 'custom' },
];

export default function Review() {
  const { state } = useStore();
  const [filter, setFilter] = useState<DateFilter>('month');
  const [range, setRange] = useState<DateRange>({ from: todayStr(), to: todayStr() });

  const eggs = useMemo(
    () => computeEggSummary(state.dailyEggs, state.sales, filter, range),
    [state, filter, range]
  );
  const fin = useMemo(
    () => computeFinancials(state.sales, state.expenses, filter, range),
    [state, filter, range]
  );

  const { currency } = state.settings;

  return (
    <Layout title={state.settings.farmName} subtitle="Farm Review">
      {/* Period filter */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f.value
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-gray-600 border-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {filter === 'custom' && (
        <div className="grid grid-cols-2 gap-3 mb-4 bg-white rounded-xl border border-border p-3">
          <DateSelector label="From" value={range.from} onChange={v => setRange(r => ({ ...r, from: v }))} />
          <DateSelector label="To" value={range.to} onChange={v => setRange(r => ({ ...r, to: v }))} />
        </div>
      )}

      {/* Production summary */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Production</h2>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <StatCard label="Collected" value={eggs.collected} icon="🥚" color="amber" />
        <StatCard label="Available" value={eggs.available} icon="📦" color="green" />
        <StatCard label="Eaten" value={eggs.eaten} icon="🍳" color="blue" />
        <StatCard label="Broken" value={eggs.broken} icon="💔" color="red" />
        <div className="col-span-2">
          <StatCard label="Sold" value={eggs.sold} icon="🛒" color="purple" sub={`from ${state.sales.filter(s => isInFilter(s.date, filter, range)).length} sale(s)`} />
        </div>
      </div>

      {/* Room breakdown */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By Room</h2>
      <div className="bg-white rounded-xl border border-border divide-y divide-border mb-4">
        {[
          { label: 'Room A', value: eggs.roomA },
          { label: 'Room B', value: eggs.roomB },
          { label: 'Room C', value: eggs.roomC },
        ].map(({ label, value }) => {
          const pct = eggs.collected > 0 ? Math.round((value / eggs.collected) * 100) : 0;
          return (
            <div key={label} className="px-4 py-3 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{value} eggs</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial summary */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Finances</h2>
      <div className="grid grid-cols-1 gap-2.5 mb-4">
        <StatCard label="Sales Revenue" value={formatCurrency(fin.revenue, currency)} icon="💰" color="green" />
        <StatCard label="Total Expenses" value={formatCurrency(fin.expenses, currency)} icon="📋" color="red" />
        <StatCard
          label="Profit"
          value={formatCurrency(fin.profit, currency)}
          icon={fin.profit >= 0 ? '📈' : '📉'}
          color={fin.profit >= 0 ? 'blue' : 'red'}
          sub="Revenue minus Expenses"
        />
      </div>

      {/* Recent activity */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Sales</h2>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {state.sales.filter(s => isInFilter(s.date, filter, range)).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sales for this period.</p>
        ) : (
          <ul className="divide-y divide-border">
            {[...state.sales]
              .filter(s => isInFilter(s.date, filter, range))
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)
              .map(s => (
                <li key={s.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {s.unitType === 'tray' ? `${s.quantity} tray${s.quantity !== 1 ? 's' : ''}` : `${s.quantity} eggs`}
                      <span className="text-gray-400"> × {formatCurrency(s.price, currency)}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.date)}</p>
                  </div>
                  <span className="text-sm font-bold text-green-700">{formatCurrency(s.total, currency)}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
