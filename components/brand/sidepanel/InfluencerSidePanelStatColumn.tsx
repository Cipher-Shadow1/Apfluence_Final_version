export function InfluencerSidePanelStatColumn({
  value,
  label,
}: {
  value: string;
  label: React.ReactNode;
}) {
  return (
    <div className="min-w-[110px]">
      <p className="text-sm font-semibold text-zinc-900">{value}</p>
      <p className="mt-0.5 text-[11px] text-zinc-500">{label}</p>
    </div>
  );
}
