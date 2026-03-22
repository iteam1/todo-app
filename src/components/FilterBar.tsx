'use client';

import type { FilterOption } from '@/types/todo';

interface FilterBarProps {
  activeFilter: FilterOption;
  onChange: (filter: FilterOption) => void;
}

const FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export function FilterBar({ activeFilter, onChange }: FilterBarProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-gray-200">
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          role="tab"
          aria-selected={activeFilter === value}
          onClick={() => onChange(value)}
          className={`px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none ${
            activeFilter === value
              ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
