const SkeletonLoader = () => {
  return (
    <div className="py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-2">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 animate-pulse"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shadow-sm border rounded-lg p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
