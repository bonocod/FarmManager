import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';
import type { Settings } from '@/types';
import { Check, RotateCcw, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const [form, setForm] = useState<Settings>({ ...state.settings });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [trayPricesStr, setTrayPricesStr] = useState(state.settings.trayPrices.join(', '));
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setForm({ ...state.settings });
    setTrayPricesStr(state.settings.trayPrices.join(', '));
  }, [state.settings]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.farmName.trim()) e.farmName = 'Farm name is required';
    if (!form.currency.trim()) e.currency = 'Currency is required';
    const ts = Number(form.traySize);
    if (isNaN(ts) || ts < 1) e.traySize = 'Tray size must be at least 1';
    const sep = Number(form.singleEggPrice);
    if (isNaN(sep) || sep < 0) e.singleEggPrice = 'Price must be 0 or more';
    // tray prices
    const prices = trayPricesStr.split(',').map(p => Number(p.trim())).filter(p => !isNaN(p) && p > 0);
    if (prices.length === 0) e.trayPrices = 'Add at least one tray price';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const prices = trayPricesStr.split(',').map(p => Number(p.trim())).filter(p => !isNaN(p) && p > 0);
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { ...form, trayPrices: prices },
    });
    toast.success('Settings saved');
  }

  return (
    <Layout title="Settings">
      {/* Farm settings */}
      <div className="bg-white rounded-xl border border-border p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Farm Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Farm Name</Label>
            <Input
              value={form.farmName}
              onChange={e => setForm(f => ({ ...f, farmName: e.target.value }))}
              className="mt-1.5"
              placeholder="My Poultry Farm"
            />
            {errors.farmName && <p className="text-xs text-red-500 mt-1">{errors.farmName}</p>}
          </div>
          <div>
            <Label>Currency</Label>
            <Input
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="mt-1.5"
              placeholder="RWF"
            />
            {errors.currency && <p className="text-xs text-red-500 mt-1">{errors.currency}</p>}
          </div>
        </div>
      </div>

      {/* Egg settings */}
      <div className="bg-white rounded-xl border border-border p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Egg Configuration</h2>
        <div className="space-y-4">
          <div>
            <Label>Tray Size (eggs per tray)</Label>
            <Input
              type="number"
              min="1"
              value={form.traySize}
              onChange={e => setForm(f => ({ ...f, traySize: Number(e.target.value) }))}
              className="mt-1.5"
            />
            <p className="text-xs text-gray-400 mt-1">Default: 30 eggs per tray</p>
            {errors.traySize && <p className="text-xs text-red-500 mt-1">{errors.traySize}</p>}
          </div>
          <div>
            <Label>Single Egg Price ({form.currency})</Label>
            <Input
              type="number"
              min="0"
              value={form.singleEggPrice}
              onChange={e => setForm(f => ({ ...f, singleEggPrice: Number(e.target.value) }))}
              className="mt-1.5"
            />
            <p className="text-xs text-gray-400 mt-1">Fixed price per individual egg</p>
            {errors.singleEggPrice && <p className="text-xs text-red-500 mt-1">{errors.singleEggPrice}</p>}
          </div>
          <div>
            <Label>Tray Price Options ({form.currency})</Label>
            <Input
              value={trayPricesStr}
              onChange={e => setTrayPricesStr(e.target.value)}
              className="mt-1.5"
              placeholder="4600, 4700, 4800, 4900, 5000"
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated list of allowed tray prices</p>
            {errors.trayPrices && <p className="text-xs text-red-500 mt-1">{errors.trayPrices}</p>}
            {/* Preview */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {trayPricesStr.split(',').map(p => Number(p.trim())).filter(p => !isNaN(p) && p > 0).map(p => (
                <span key={p} className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-full font-medium">
                  {formatCurrency(p, form.currency)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button className="w-full mt-5 bg-green-700 hover:bg-green-800 text-white gap-2" onClick={handleSave}>
          <Check size={15} /> Save Settings
        </Button>
      </div>

      {/* Data management */}
      <div className="bg-white rounded-xl border border-border p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Data Management</h2>
        <p className="text-xs text-gray-400 mb-4">All data is stored locally in your browser.</p>

        {/* Reset to demo */}
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-lg border border-amber-300 text-amber-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-amber-50 mb-2"
          >
            <RotateCcw size={14} /> Reset to Demo Data
          </button>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
            <p className="text-xs text-amber-800 mb-2">This will replace all your data with demo data. Continue?</p>
            <div className="flex gap-2">
              <button onClick={() => { dispatch({ type: 'RESET_TO_DEMO' }); setShowResetConfirm(false); toast.success('Reset to demo data'); }} className="flex-1 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-md">Yes, Reset</button>
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md">Cancel</button>
            </div>
          </div>
        )}

        {/* Clear all */}
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50"
          >
            <Trash2 size={14} /> Clear All Data
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-800 mb-2">This will permanently delete all records. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => { dispatch({ type: 'CLEAR_ALL' }); setShowClearConfirm(false); toast.success('All data cleared'); }} className="flex-1 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md">Yes, Delete All</button>
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-md">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">About</h2>
        <p className="text-xs text-gray-500">🐓 Farm Egg Manager V1</p>
        <p className="text-xs text-gray-400 mt-1">Data is saved in your browser. No internet required.</p>
      </div>
    </Layout>
  );
}
