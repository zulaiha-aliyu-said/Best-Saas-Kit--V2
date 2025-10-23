export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="h-10 bg-gray-200 rounded-lg w-80 mb-2 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-96 animate-pulse" />
            </div>
            <div className="h-12 bg-gray-200 rounded-xl w-48 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Competitor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded-full w-40 mb-3 animate-pulse" />
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}













