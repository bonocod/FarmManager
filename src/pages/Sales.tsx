import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import DateSelector from '@/components/features/DateSelector';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/lib/store';
import {
  todayStr, formatDate, formatCurrency, generateId, totalAvailableEggs,
} from '@/lib/calculations';
import type { Sale } from '@/types';
import { Plus, Pencil, Trash2, X, Check, ShoppingCart } from 'lucide-react';

type UnitType = 'tray' | 'single';

interface SaleForm {
  date: string;
  unitType: UnitType;
  quantity: string;
  price: string;
  notes: string;
}

const EMPTY_FORM: SaleForm = {
  date: todayStr(),
  unitType: 'tray',
  quantity: '',
  price: '',
  notes: '',
};

export default function Sales() {
  const { state, dispatch } = useStore();
  const { settings } = state;

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SaleForm>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewDate, setViewDate] = useState(todayStr());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Tray quantity options 1–30
  const trayOptions = Array.from({ length: 30 }, (_, i) => i + 1);
  // Single egg options 1–(traySize-1) for convenience, + allow more
  const singleOptions = Array.from({ length: 60 }, (_, i) => i + 1);

  // Sales for the selected viewing date
  const dateSales = useMemo(
    () => state.sales.filter(s => s.date === viewDate).sort((a, b) => a.id.localeCompare(b.id)),
    [state.sales, viewDate]
  );

  const dateSalesTotal = useMemo(
    () => dateSales.reduce((a, s) => a + s.total, 0),
    [dateSales]
  );

  const dateSalesEggs = useMemo(
    () => dateSales.reduce((a, s) => a + s.eggs, 0),
    [dateSales]
  );

  // Computed total & eggs for current form
  const formTotal = useMemo(() => {
    const q = Number(form.quantity);
    const p = Number(form.price);
    if (!q || !p) return 0;
    return q * p;
  }, [form.quantity, form.price]);

  const formEggs = useMemo(() => {
    const q = Number(form.quantity);
    return form.unitType === 'tray' ? q * settings.traySize : q;
  }, [form.quantity, form.unitType, settings.traySize]);

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, date: viewDate, unitType: 'tray', price: String(settings.trayPrices[2]) });
    setErrors({});
    setShowForm(true);
  }

  function openEdit(s: Sale) {
    setEditId(s.id);
    setForm({
      date: s.date,
      unitType: s.unitType,
      quantity: String(s.quantity),
      price: String(s.price),
      notes: s.notes,
    });
    setErrors({});
    setShowForm(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Date is required';
    const q = Number(form.quantity);
    const p = form.unitType === 'single' ? settings.singleEggPrice : Number(form.price);
    if (!q || q <= 0) e.quantity = 'Select a quantity';
    if (form.unitType === 'tray' && (!p || p <= 0)) e.price = 'Select a price';

    // Egg availability check
    if (q > 0) {
      const newEggs = form.unitType === 'tray' ? q * settings.traySize : q;
      // Available excluding the sale being edited
      const currentState = editId
        ? { ...state, sales: state.sales.filter(s => s.id !== editId) }
        : state;
      const avail = totalAvailableEggs(currentState);
      if (newEggs > avail) {
        e.quantity = `Only ${avail} eggs available (you need ${newEggs})`;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const q = Number(form.quantity);
    const p = form.unitType === 'single' ? settings.singleEggPrice : Number(form.price);
    const sale: Sale = {
      id: editId ?? generateId('sale'),
      date: form.date,
      unitType: form.unitType,
      quantity: q,
      price: p,
      total: q * p,
      eggs: form.unitType === 'tray' ? q * settings.traySize : q,
      notes: form.notes,
    };
    if (editId) {
      dispatch({ type: 'UPDATE_SALE', payload: sale });
      toast.success('Sale updated');
    } else {
      dispatch({ type: 'ADD_SALE', payload: sale });
      toast.success('Sale recorded');
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_SALE', id });
    setDeleteConfirm(null);
    toast.success('Sale deleted');
  }

  return (
    <Layout
      title="Egg Sales"
      action={
        !showForm
          ? <Button size="sm" className="bg-green-700 hover:bg-green-800 text-white gap-1" onClick={openAdd}>
              <Plus size={15} /> Add Sale
            </Button>
          : undefined
      }
    >
      {/* Date selector for viewing */}
      <div className="bg-white border border-border rounded-xl p-4 mb-4">
        <DateSelector label="View Sales For" value={viewDate} onChange={setViewDate} max={todayStr()} />
      </div>

      {/* Day summary */}
      {dateSales.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Day Revenue</p>
            <p className="text-xl font-bold text-green-800 mt-1">{formatCurrency(dateSalesTotal, settings.currency)}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Eggs Sold</p>
            <p className="text-xl font-bold text-amber-800 mt-1">{dateSalesEggs}</p>
            <p className="text-xs text-amber-600 mt-0.5">{dateSales.length} sale{dateSales.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Sale Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">{editId ? 'Edit Sale' : 'Record Sale'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
          </div>

          <div className="space-y-4">
            <DateSelector label="Date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} max={todayStr()} />
            {errors.date && <p className="text-xs text-red-500 -mt-2">{errors.date}</p>}

            {/* Unit type toggle */}
            <div>
              <Label className="text-sm">Sale Type</Label>
              <div className="flex gap-2 mt-1.5">
                {(['tray', 'single'] as UnitType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      const newPrice = t === 'single'
                        ? String(settings.singleEggPrice)
                        : String(settings.trayPrices[2]);
                      setForm(f => ({ ...f, unitType: t, price: newPrice, quantity: '' }));
                    }}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      form.unitType === t
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-white text-gray-600 border-border'
                    }`}
                  >
                    {t === 'tray' ? '🥚 Trays' : '🔵 Single Eggs'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label className="text-sm">
                {form.unitType === 'tray' ? 'Number of Trays' : 'Number of Eggs'}
              </Label>
              <select
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">— select —</option>
                {(form.unitType === 'tray' ? trayOptions : singleOptions).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
            </div>

            {/* Price */}
            <div>
              <Label className="text-sm">
                {form.unitType === 'tray' ? 'Price per Tray' : 'Price per Egg'}
              </Label>
              {form.unitType === 'tray' ? (
                <select
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">— select —</option>
                  {settings.trayPrices.map(p => (
                    <option key={p} value={p}>{formatCurrency(p, settings.currency)}</option>
                  ))}
                </select>
              ) : (
                <div className="mt-1.5 h-10 rounded-lg border border-border bg-gray-50 flex items-center px-3 text-sm text-gray-600">
                  {formatCurrency(settings.singleEggPrice, settings.currency)} per egg (fixed)
                </div>
              )}
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            {/* Live total preview */}
            {form.quantity && (Number(form.price) > 0 || form.unitType === 'single') && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700">
                    {form.unitType === 'tray'
                      ? `${form.quantity} tray${Number(form.quantity) !== 1 ? 's' : ''} × ${formatCurrency(Number(form.price), settings.currency)}`
                      : `${form.quantity} egg${Number(form.quantity) !== 1 ? 's' : ''} × ${formatCurrency(settings.singleEggPrice, settings.currency)}`
                    }
                  </span>
                  <span className="font-bold text-green-800">{formatCurrency(formTotal, settings.currency)}</span>
                </div>
                <p className="text-xs text-green-600 mt-0.5">= {formEggs} individual egg{formEggs !== 1 ? 's' : ''}</p>
              </div>
            )}

            <div>
              <Label className="text-sm">Notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="mt-1"
                rows={2}
                placeholder="e.g. Regular customer, market sale..."
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button className="flex-1 bg-green-700 hover:bg-green-800 text-white gap-1" onClick={handleSubmit}>
              <Check size={15} /> Save Sale
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Sales for selected date */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Sales — {formatDate(viewDate)}
      </h2>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {dateSales.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart size={28} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No sales for {formatDate(viewDate)}</p>
            <button onClick={openAdd} className="text-xs text-green-700 font-medium mt-1">+ Add a sale</button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {dateSales.map((s, idx) => (
              <li key={s.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {s.unitType === 'tray'
                          ? `${s.quantity} tray${s.quantity !== 1 ? 's' : ''}`
                          : `${s.quantity} egg${s.quantity !== 1 ? 's' : ''}`
                        }
                        <span className="text-gray-400 font-normal"> × {formatCurrency(s.price, settings.currency)}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{s.eggs} individual egg{s.eggs !== 1 ? 's' : ''}{s.notes ? ` · ${s.notes}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-green-700">{formatCurrency(s.total, settings.currency)}</span>
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
                {deleteConfirm === s.id && (
                  <div className="mt-2 flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-700 flex-1">Delete this sale?</p>
                    <button onClick={() => handleDelete(s.id)} className="text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-md">Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-500 px-2 py-1">Cancel</button>
                  </div>
                )}
              </li>
            ))}
            {/* Day total */}
            <li className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Day Total ({dateSalesEggs} eggs)</span>
              <span className="text-base font-bold text-green-700">{formatCurrency(dateSalesTotal, settings.currency)}</span>
            </li>
          </ul>
        )}
      </div>

      {/* All recent sales */}
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-5">All Sales (Recent)</h2>
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {state.sales.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sales recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {[...state.sales]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map(s => (
                <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDate(s.date)} ·{' '}
                      {s.unitType === 'tray'
                        ? `${s.quantity} tray${s.quantity !== 1 ? 's' : ''}`
                        : `${s.quantity} egg${s.quantity !== 1 ? 's' : ''}`}
                    </p>
                    <p className="text-xs text-gray-400">{formatCurrency(s.price, settings.currency)} each · {s.eggs} eggs</p>
                  </div>
                  <span className="text-sm font-bold text-green-700">{formatCurrency(s.total, settings.currency)}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
