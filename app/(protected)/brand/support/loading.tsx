export default function SupportLoading() {
  return (
    <div
      className="flex min-h-full w-full flex-col items-center justify-center bg-linear-to-br from-pink-50 to-rose-50 px-6 py-16"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <div className="mb-8 h-28 w-28 animate-pulse rounded-3xl bg-white/60 shadow-lg ring-1 ring-black/5" />
        <div className="mb-3 h-12 w-44 animate-pulse rounded-lg bg-white/50" />
        <div className="mb-4 h-6 w-72 animate-pulse rounded-md bg-white/40" />
        <div className="mb-8 h-20 w-full max-w-sm animate-pulse rounded-xl bg-white/35" />
        <div className="h-1.5 w-full animate-pulse rounded-full bg-white/45" />
      </div>
    </div>
  );
}
