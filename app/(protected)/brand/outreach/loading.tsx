export default function OutreachLoading() {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* Header skeleton */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center
                      justify-between">
        <div className="space-y-2">
          <div className="w-24 h-6 rounded-full bg-gray-100 animate-pulse" />
          <div className="w-48 h-3 rounded-full bg-gray-50 animate-pulse" />
        </div>
      </div>

      {/* Subject skeleton */}
      <div className="border-b border-gray-100 px-6 py-0">
        <div className="flex items-center gap-4 h-14">
          <div className="w-16 h-4 rounded-full bg-gray-100 animate-pulse" />
          <div className="flex-1 h-4 rounded-full bg-gray-50 animate-pulse" />
        </div>
      </div>

      {/* Banner skeleton */}
      <div className="mx-6 mt-4">
        <div className="h-16 rounded-xl bg-indigo-50 animate-pulse" />
      </div>

      {/* Editor + panel skeleton */}
      <div className="flex flex-1 gap-4 px-6 mt-4">
        <div className="flex-1 rounded-xl border border-gray-100 animate-pulse
                        bg-gray-50" />
        <div className="w-72 rounded-xl border border-gray-100 animate-pulse
                        bg-gray-50" />
      </div>

      {/* Footer skeleton */}
      <div className="border-t border-gray-100 px-6 py-4 flex
                      items-center justify-between mt-4">
        <div className="w-32 h-5 rounded-full bg-gray-100 animate-pulse" />
        <div className="flex gap-3">
          <div className="w-24 h-10 rounded-xl bg-gray-100 animate-pulse" />
          <div className="w-28 h-10 rounded-xl bg-indigo-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
