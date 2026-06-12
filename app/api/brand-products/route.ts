import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

type BrandProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  value: number;
  created_at: string;
  updated_at: string;
};

async function getBrandIdForAuthUser(authUserId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = user.user_metadata?.role as string | undefined;
  if (role !== "brand") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const brandId = await getBrandIdForAuthUser(userId);
  if (!brandId) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin
    .from("brand_products")
    .select("id, name, description, image_url, value, created_at, updated_at")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/brand-products error:", error);
    return NextResponse.json({ error: "Failed to load catalog" }, { status: 500 });
  }

  return NextResponse.json({ products: (data ?? []) as BrandProductRow[] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = user.user_metadata?.role as string | undefined;
  if (role !== "brand") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const brandId = await getBrandIdForAuthUser(userId);
  if (!brandId) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const name = (body?.name as string | undefined)?.trim();
  const description = (body?.description as string | undefined)?.trim() || null;
  const image_url = (body?.image_url as string | undefined)?.trim() || null;
  const value = body?.value as number | undefined;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return NextResponse.json({ error: "value must be a positive number" }, { status: 400 });
  }

  const { data: inserted, error } = await supabaseAdmin
    .from("brand_products")
    .insert({
      brand_id: brandId,
      name,
      description,
      image_url,
      value,
    })
    .select("id, name, description, image_url, value, created_at, updated_at")
    .maybeSingle();

  if (error) {
    // Duplicate (unique index) → return the most recent matching row
    if (error.code === "23505") {
      const { data: existing } = await supabaseAdmin
        .from("brand_products")
        .select("id, name, description, image_url, value, created_at, updated_at")
        .eq("brand_id", brandId)
        .eq("name", name)
        .eq("value", value)
        .eq("image_url", image_url)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return NextResponse.json({ product: existing ?? null, deduped: true });
    }

    console.error("POST /api/brand-products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }

  return NextResponse.json({ product: inserted ?? null });
}

