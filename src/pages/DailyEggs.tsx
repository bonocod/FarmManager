import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import DateSelector from '@/components/features/DateSelector';
import TraySelector from '@/components/features/TraySelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import {
  todayStr, formatDate, generateId,
  computeEggSummary, eggsToTraysAndSingles,
} from '@/lib/calculations';
import type { DailyEggRecord, TrayValue } from '@/types';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';

function toTrayValue(eggs: number, traySize: number): TrayValue {
  return eggsToTraysAndSingles(eggs, traySize);
}

function toEggs(tv: TrayValue, traySize: number): number {
  return tv.trays * traySize + tv.singles;
}

const EMPTY_FORM = {
  date: todayStr(),
  roomA: { trays: 0, singles: 0 } as TrayValue,
  roomB: { trays: 0, singles: 0 } as TrayValue,
  roomC: { trays: 0, singles: 0 } as TrayValue,
  eaten: { trays: 0, singles: 0 } as TrayValue,
  broken: { trays: 0, singles: 0 } as TrayValue,
  notes: '',
};

export default function DailyEggs() {
  const { state, dispatch } = useStore();
  const traySize = state.settings.traySize;

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // All records sorted by date desc
  const sortedRecords = useMemo(
    () => [...state.dailyEggs].sort((a, b) => b.date.localeCompare(a.date)),
    [state.dailyEggs]
  );

  // Overall egg summary
  const summary = useMemo(
    () => computeEggSummary(state.dailyEggs, state.sales, 'all'),
    [state]
  );

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, date: todayStr() });
    setErrors({});
    setShowForm(true);
  }

  function openEdit(r: DailyEggRecord) {
    setEditId(r.id);
    setForm({
      date: r.date,
      roomA: toTrayValue(r.roomA, traySize),
      roomB: toTrayValue(r.roomB, traySize),
      roomC: toTrayValue(r.roomC, traySize),
      eaten: toTrayValue(r.eaten, traySize),
      broken: toTrayValue(r.broken, traySize),
      notes: r.notes,
    });
    setErrors({});
    setShowForm(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Date is required';
    // Check for duplicate date (not when editing same record)
    const existing = state.dailyEggs.find(r => r.date === form.date && r.id !== editId);
    if (existing) e.date = 'A record for this date already exists. Edit it instead.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const record: DailyEggRecord = {
      id: editId ?? generateId('de'),
      date: form.date,
      roomA: toEggs(form.roomA, traySize),
      roomB: toEggs(form.roomB, traySize),
      roomC: toEggs(form.roomC, traySize),
      eaten: toEggs(form.eaten, traySize),
      broken: toEggs(form.broken, traySize),
      notes: form.notes,
    };
    if (editId) {
      dispatch({ type: 'UPDATE_DAILY_EGG', payload: record });
      toast.success('Record updated');
    } else {
      dispatch({ type: 'ADD_DAILY_EGG', payload: record });
      toast.success('Daily eggs recorded');
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_DAILY_EGG', id });
    setDeleteConfirm(null);
    toast.success('Record deleted');
  }

  const totalCollectedInForm =
    toEggs(form.roomA, traySize) +
    toEggs(form.roomB, traySize) +
    toEggs(form.roomC, traySize);

  const netInForm = totalCollectedInForm - toEggs(form.eaten, traySize) - toEggs(form.broken, traySize);

  return (
    <Layout
      title="Daily Eggs"
      action={
        !showForm
          ? <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white gap-1" onClick={openAdd}>
              <Plus size={15} /> Add Record
            </Button>
          : undefined
      }
    >
      {/* Current egg balance */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Available Eggs</p>
          <p className="text-2xl font-bold text-amber-800">{summary.available}</p>
          <p className="text-xs text-amber-600 mt-0.5">After sales & consumption</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-green-800">{summary.collected}</p>
          <p className="text-xs text-green-600 mt-0.5">All time</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">{editId ? 'Edit Record' : 'Record Daily Eggs'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
          </div>

          <div className="space-y-4">
            <DateSelector
              label="Date"
              value={form.date}
              onChange={v => setForm(f => ({ ...f, date: v }))}
              max={todayStr()}
            />
            {errors.date && <p className="text-xs text-red-500 -mt-2">{errors.date}</p>}

            <div className="pt-1 border-t border-border">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Eggs Collected</p>
              <div className="space-y-3">
                <TraySelector label="Room A" value={form.roomA} onChange={v => setForm(f => ({ ...f, roomA: v }))} />
                <TraySelector label="Room B" value={form.roomB} onChange={v => setForm(f => ({ ...f, roomB: v }))} />
                <TraySelector label="Room C" value={form.roomC} onChange={v => setForm(f => ({ ...f, roomC: v }))} />
              </div>
            </div>

            <div className="pt-1 border-t border-border">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Consumed / Lost</p>
              <div className="space-y-3">
                <TraySelector label="Eaten at Home" value={form.eaten} onChange={v => setForm(f => ({ ...f, eaten: v }))} maxTrays={2} />
                <TraySelector label="Broken" value={form.broken} onChange={v => setForm(f => ({ ...f, broken: v }))} maxTrays={2} />
              </div>
            </div>

            {totalCollectedInForm > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2.5 text-sm text-green-800">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-green-600">Room A</p>
                    <p className="font-bold">{toEggs(form.roomA, traySize)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Room B</p>
                    <p className="font-bold">{toEggs(form.roomB, traySize)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Room C</p>
                    <p className="font-bold">{toEggs(form.roomC, traySize)}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-green-200 flex justify-between">
                  <span className="text-xs">Total collected: <strong>{totalCollectedInForm}</strong></span>
                  <span className="text-xs">Net (excl. sales): <strong>{Math.max(0, netInForm)}</strong></span>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm">Notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="mt-1"
                rows={2}
                placeholder="Any notes for today..."
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

      {/* Records list */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Production Records</h2>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {sortedRecords.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No records yet. Add your first daily egg record.</p>
        ) : (
          <ul className="divide-y divide-border">
            {sortedRecords.map(r => {
              const total = r.roomA + r.roomB + r.roomC;
              return (
                <li key={r.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{formatDate(r.date)}</p>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">{total} eggs</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>A: {r.roomA}</span>
                        <span>B: {r.roomB}</span>
                        <span>C: {r.roomC}</span>
                        {r.eaten > 0 && <span className="text-blue-600">Eaten: {r.eaten}</span>}
                        {r.broken > 0 && <span className="text-red-500">Broken: {r.broken}</span>}
                      </div>
                      {r.notes && <p className="text-xs text-gray-400 italic mt-0.5">{r.notes}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(r.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Delete confirm inline */}
                  {deleteConfirm === r.id && (
                    <div className="mt-2 flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-red-700 flex-1">Delete this record?</p>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-md"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-gray-500 px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}
