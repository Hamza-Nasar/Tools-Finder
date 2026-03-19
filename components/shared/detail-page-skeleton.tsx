export function DetailPageSkeleton() {
  return (
    <div className="page-frame py-12">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="surface-card p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="skeleton-shimmer h-16 w-16 rounded-[1.3rem]" />
              <div className="space-y-3">
                <div className="skeleton-shimmer h-4 w-24" />
                <div className="skeleton-shimmer h-10 w-64" />
                <div className="skeleton-shimmer h-5 w-80" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton-shimmer h-20 w-28 rounded-[1.25rem]" />
              ))}
            </div>
          </div>
          <div className="mt-10 space-y-4">
            <div className="skeleton-shimmer h-6 w-32" />
            <div className="skeleton-shimmer h-5 w-full" />
            <div className="skeleton-shimmer h-5 w-full" />
            <div className="skeleton-shimmer h-5 w-5/6" />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="skeleton-shimmer aspect-[16/10] rounded-[1.5rem]" />
            <div className="skeleton-shimmer aspect-[16/10] rounded-[1.5rem]" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="surface-card p-6">
            <div className="skeleton-shimmer h-6 w-40" />
            <div className="mt-6 space-y-3">
              <div className="skeleton-shimmer h-5 w-full" />
              <div className="skeleton-shimmer h-5 w-full" />
              <div className="skeleton-shimmer h-5 w-full" />
              <div className="skeleton-shimmer h-12 w-full" />
            </div>
          </div>
          <div className="surface-card p-6">
            <div className="skeleton-shimmer h-6 w-36" />
            <div className="mt-6 space-y-3">
              <div className="skeleton-shimmer h-20 w-full rounded-[1.25rem]" />
              <div className="skeleton-shimmer h-20 w-full rounded-[1.25rem]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
