import { formatDate } from '@/lib/calculations';
import { CalendarDays } from 'lucide-react';

interface DateSelectorProps {
  value: string;         // YYYY-MM-DD
  onChange: (v: string) => void;
  label?: string;
  max?: string;
}

export default function DateSelector({ value, onChange, label = 'Date', max }: DateSelectorProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <input
          type="date"
          value={value}
          max={max}
          onChange={e => onChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <CalendarDays size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {value && (
        <p className="text-xs text-gray-500 mt-1">{formatDate(value)}</p>
      )}
    </div>
  );
}
