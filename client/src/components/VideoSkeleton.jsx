import React from 'react';

export function VideoCardSkeleton({ horizontal = false }) {
  if (horizontal) {
    return (
      <div className="flex gap-3 p-2 animate-pulse">
        <div className="shrink-0 w-40 aspect-video rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mt-2" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-video rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => <VideoCardSkeleton key={i} />)}
    </div>
  );
}
