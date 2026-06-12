export function formatDzdCompactOrFullFromCents(cents: number): string {
  const major = Math.round((Number(cents) || 0) / 100);
  const abs = Math.abs(major);
  const sign = major < 0 ? "-" : "";

  // Only compact clean round values to preserve accuracy.
  if (abs >= 1_000_000 && abs % 1_000_000 === 0) {
    return `${sign}${abs / 1_000_000}M`;
  }
  if (abs >= 100_000 && abs < 1_000_000 && abs % 1_000 === 0) {
    return `${sign}${abs / 1_000}k`;
  }
  return `${sign}${abs.toLocaleString("en-US")}`;
}

export function formatDzdCardLabelFromCents(cents: number): string {
  return `DZD ${formatDzdCompactOrFullFromCents(cents)}`;
}

