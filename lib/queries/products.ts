export type BrandProduct = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  value: number; // cents
  created_at: string;
  updated_at: string;
};

export async function getBrandProducts(): Promise<BrandProduct[]> {
  const res = await fetch("/api/brand-products", { method: "GET" });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as
    | { products?: BrandProduct[] }
    | null;
  return json?.products ?? [];
}

export async function createBrandProduct(input: {
  name: string;
  description?: string | null;
  image_url?: string | null;
  value: number; // cents
}): Promise<BrandProduct | null> {
  const res = await fetch("/api/brand-products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as
    | { product?: BrandProduct | null }
    | null;
  return json?.product ?? null;
}

