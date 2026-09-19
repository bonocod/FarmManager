import type { TrayValue } from '@/types';
import { useStore } from '@/lib/store';

interface TraySelectorProps {
  label: string;
  value: TrayValue;
  onChange: (v: TrayValue) => void;
  maxTrays?: number;
  maxSingles?: number;
}

export default function TraySelector({
  label,
  value,
  onChange,
  maxTrays = 20,
  maxSingles,
}: TraySelectorProps) {
  const { state } = useStore();
  const { traySize } = state.settings;
  const effectiveMaxSingles = maxSingles !== undefined ? maxSingles : traySize - 1;

  const trayOptions = Array.from({ length: maxTrays + 1 }, (_, i) => i);
  const singleOptions = Array.from({ length: effectiveMaxSingles + 1 }, (_, i) => i);

  const totalEggs = value.trays * traySize + value.singles;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <select
            value={value.trays}
            onChange={e => onChange({ ...value, trays: Number(e.target.value) })}
            className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {trayOptions.map(n => (
              <option key={n} value={n}>{n} tray{n !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <span className="text-gray-400 text-sm font-medium">+</span>
        <div className="flex-1">
          <select
            value={value.singles}
            onChange={e => onChange({ ...value, singles: Number(e.target.value) })}
            className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {singleOptions.map(n => (
              <option key={n} value={n}>{n} egg{n !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>
      {totalEggs > 0 && (
        <p className="text-xs text-green-700 mt-1 font-medium">
          = {totalEggs} egg{totalEggs !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
