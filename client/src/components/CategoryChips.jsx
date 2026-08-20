import React, { useRef } from 'react';

const categories = [
  'All', 'Music', 'Gaming', 'Live', 'News', 'Sports', 'Movies',
  'Education', 'Technology', 'Coding', 'AI', 'Fitness', 'Cricket',
  'Comedy', 'Science', 'Travel', 'Food'
];

export default function CategoryChips({ active, onChange }) {
  const scrollRef = useRef(null);

  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3 sticky top-14 bg-white dark:bg-zinc-950 z-30 border-b border-zinc-100 dark:border-zinc-900">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
            ${active === cat
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
