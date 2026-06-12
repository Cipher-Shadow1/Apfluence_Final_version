export default function CampaignDetailLoading() {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* Top nav skeleton */}
      <div className="border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
        <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
        <div className="w-48 h-5 rounded-full bg-gray-100 animate-pulse" />
        <div className="flex gap-2 ml-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-24 h-8 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="ml-auto flex gap-6">
          <div className="w-20 h-10 rounded-lg bg-gray-100 animate-pulse" />
          <div className="w-20 h-10 rounded-lg bg-gray-100 animate-pulse" />
        </div>
      </div>

      {/* Pipeline skeleton */}
      <div className="border-b border-gray-100 px-6 py-6">
        <div className="flex items-center gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-20 h-4 rounded-full bg-gray-100 animate-pulse" />
              <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse" />
              <div className="w-full h-1 rounded-full bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
        <div className="w-52 h-9 rounded-xl bg-gray-100 animate-pulse" />
        <div className="ml-auto flex gap-3">
          <div className="w-32 h-9 rounded-xl bg-indigo-100 animate-pulse" />
          <div className="w-28 h-9 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </div>

      {/* Table rows skeleton */}
      <div className="flex-1 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-gray-50"
          >
            <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
            <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="w-32 h-4 rounded-full bg-gray-100 animate-pulse" />
              <div className="w-20 h-3 rounded-full bg-gray-50 animate-pulse" />
            </div>
            <div className="w-28 h-4 rounded-full bg-gray-100 animate-pulse" />
            <div className="w-36 h-8 rounded-lg bg-gray-100 animate-pulse" />
            <div className="w-16 h-4 rounded-full bg-gray-100 animate-pulse" />
            <div className="w-16 h-4 rounded-full bg-gray-50 animate-pulse" />
          </div>
        ))}
      </div>

    </div>
  )
}
