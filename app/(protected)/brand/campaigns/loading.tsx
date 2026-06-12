export default function CampaignsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white border-b border-gray-100 px-6 py-4 -mx-6 -mt-6 mb-6
                      flex items-center justify-between">
        <div className="w-40 h-7 rounded-full bg-gray-100 animate-pulse" />
        <div className="w-36 h-10 rounded-xl bg-gray-100 animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5
                                   flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse" />
            <div className="space-y-2">
              <div className="w-12 h-6 rounded-full bg-gray-100 animate-pulse" />
              <div className="w-24 h-3 rounded-full bg-gray-50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4
                                     border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="w-48 h-4 rounded-full bg-gray-100 animate-pulse" />
                <div className="w-24 h-3 rounded-full bg-gray-50 animate-pulse" />
              </div>
              <div className="w-16 h-6 rounded-full bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="w-80 bg-white rounded-2xl border border-gray-100 p-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-3
                                     border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="w-32 h-3 rounded-full bg-gray-100 animate-pulse" />
                <div className="w-24 h-2.5 rounded-full bg-gray-50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
