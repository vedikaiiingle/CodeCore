import React from 'react';

const FILTERS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Voted', value: 'voted' },
  { label: 'Most Viewed', value: 'viewed' },
  { label: 'Unanswered', value: 'unanswered' }
];

const FilterDropdown = ({ selected, onChange }) => (
  <div className="flex gap-3 flex-wrap">
    {FILTERS.map(f => (
      <button
        key={f.value}
        onClick={() => onChange(f.value)}
        className={`px-5 py-2 rounded-full font-medium shadow-sm border transition-all duration-150
          bg-white text-gray-700 border-gray-200 hover:bg-gray-100
          ${selected === f.value ? 'border-blue-500 text-blue-700 font-bold ring-2 ring-blue-100' : ''}
        `}
        style={{ minWidth: 120 }}
      >
        {f.label}
      </button>
    ))}
  </div>
);

export default FilterDropdown; 