export function formatMoneyFromMajor(amount: number, currency: string): string {
  const ccy = (currency || "USD").toUpperCase();
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: ccy,
    }).format(safe);
  } catch {
    // Fallback for invalid/unknown currency codes
    return `${safe.toLocaleString("en-US")} ${ccy}`;
  }
}

export function formatMoneyFromCents(cents: number, currency: string): string {
  return formatMoneyFromMajor(cents / 100, currency);
}

