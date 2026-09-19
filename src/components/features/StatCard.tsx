interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple';
}

const COLOR_MAP: Record<string, string> = {
  green:  'bg-green-50  border-green-100  text-green-800',
  amber:  'bg-amber-50  border-amber-100  text-amber-800',
  red:    'bg-red-50    border-red-100    text-red-800',
  blue:   'bg-blue-50   border-blue-100   text-blue-800',
  gray:   'bg-gray-50   border-gray-100   text-gray-800',
  purple: 'bg-purple-50 border-purple-100 text-purple-800',
};

const VALUE_COLOR_MAP: Record<string, string> = {
  green:  'text-green-700',
  amber:  'text-amber-700',
  red:    'text-red-700',
  blue:   'text-blue-700',
  gray:   'text-gray-700',
  purple: 'text-purple-700',
};

export default function StatCard({ label, value, sub, icon, color = 'gray' }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${COLOR_MAP[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
        {icon && <span className="text-lg leading-none">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold leading-tight ${VALUE_COLOR_MAP[color]}`}>{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}
