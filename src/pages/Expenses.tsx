import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import DateSelector from '@/components/features/DateSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { todayStr, formatDate, formatCurrency, generateId, isInFilter } from '@/lib/calculations';
import type { Expense, ExpenseType, DateFilter } from '@/types';
import { Plus, Pencil, Trash2, X, Check, Receipt } from 'lucide-react';

const EXPENSE_TYPES: ExpenseType[] = ['Feed', 'Medicine', 'Transport', 'Equipment', 'Other'];

const TYPE_COLORS: Record<ExpenseType, string> = {
  Feed: 'bg-amber-100 text-amber-800',
  Medicine: 'bg-blue-100 text-blue-800',
  Transport: 'bg-purple-100 text-purple-800',
  Equipment: 'bg-gray-100 text-gray-700',
  Other: 'bg-green-100 text-green-800',
};

const FILTERS: { label: string; value: DateFilter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
];

const EMPTY_FORM = {
  date: todayStr(),
  type: 'Feed' as ExpenseType,
  amount: '',
  description: '',
};

export default function Expenses() {
  const { state, dispatch } = useStore();
  const { settings } = state;

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<DateFilter>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredExpenses = useMemo(
    () => [...state.expenses].filter(e => isInFilter(e.date, filter)).sort((a, b) => b.date.localeCompare(a.date)),
    [state.expenses, filter]
  );

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((a, e) => a + e.amount, 0),
    [filteredExpenses]
  );

  const categoryTotals = useMemo(() => {
    const map: Partial<Record<ExpenseType, number>> = {};
    filteredExpenses.forEach(e => { map[e.type] = (map[e.type] ?? 0) + e.amount; });
    return map;
  }, [filteredExpenses]);

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, date: todayStr() });
    setErrors({});
    setShowForm(true);
  }

  function openEdit(e: Expense) {
    setEditId(e.id);
    setForm({ date: e.date, type: e.type, amount: String(e.amount), description: e.description });
    setErrors({});
    setShowForm(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Date is required';
    const amt = Number(form.amount);
    if (isNaN(amt) || amt <= 0) e.amount = 'Amount must be greater than 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const expense: Expense = {
      id: editId ?? generateId('exp'),
      date: form.date,
      type: form.type,
      amount: Number(form.amount),
      description: form.description.trim(),
    };
    if (editId) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
      toast.success('Expense updated');
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: expense });
      toast.success('Expense recorded');
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_EXPENSE', id });
    setDeleteConfirm(null);
    toast.success('Expense deleted');
  }

  return (
    <Layout
      title="Expenses"
      action={
        !showForm
          ? <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white gap-1" onClick={openAdd}>
              <Plus size={15} /> Add
            </Button>
          : undefined
      }
    >
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

      {/* Total */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Total Expenses</p>
          <p className="text-2xl font-bold text-red-800 mt-0.5">{formatCurrency(totalAmount, settings.currency)}</p>
          <p className="text-xs text-red-500 mt-0.5">{FILTERS.find(f => f.value === filter)?.label} · {filteredExpenses.length} record{filteredExpenses.length !== 1 ? 's' : ''}</p>
        </div>
        <Receipt size={28} className="text-red-200" />
      </div>

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.entries(categoryTotals) as [ExpenseType, number][]).map(([cat, amt]) => (
            <span key={cat} className={`px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[cat]}`}>
              {cat}: {formatCurrency(amt, settings.currency)}
            </span>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">{editId ? 'Edit Expense' : 'Record Expense'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
          </div>

          <div className="space-y-4">
            <DateSelector label="Date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} max={todayStr()} />
            {errors.date && <p className="text-xs text-red-500 -mt-2">{errors.date}</p>}

            <div>
              <Label className="text-sm">Expense Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as ExpenseType }))}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Amount ({settings.currency})</Label>
              <Input
                type="number"
                min="1"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="mt-1.5"
                placeholder="0"
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <Label className="text-sm">Description (optional)</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1.5"
                rows={2}
                placeholder="What was this for?"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button className="flex-1 bg-green-700 hover:bg-green-800 text-white gap-1" onClick={handleSubmit}>
              <Check size={15} /> Save
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Expense Records</h2>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt size={28} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No expenses for this period.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredExpenses.map(e => (
              <li key={e.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${TYPE_COLORS[e.type]}`}>{e.type}</span>
                      <span className="text-xs text-gray-400">{formatDate(e.date)}</span>
                    </div>
                    {e.description && (
                      <p className="text-sm text-gray-700 mt-1 truncate">{e.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-red-600">{formatCurrency(e.amount, settings.currency)}</span>
                    <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteConfirm(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
                {deleteConfirm === e.id && (
                  <div className="mt-2 flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-700 flex-1">Delete this expense?</p>
                    <button onClick={() => handleDelete(e.id)} className="text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-md">Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-500 px-2 py-1">Cancel</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
