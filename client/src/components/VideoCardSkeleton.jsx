export default function VideoCardSkeleton({ horizontal = false }) {
  if (horizontal) {
    return (
      <div className="flex gap-3 p-2">
        <div className="skeleton w-40 h-24 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="skeleton aspect-video rounded-xl w-full" />
      <div className="flex gap-3 mt-3">
        <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}
