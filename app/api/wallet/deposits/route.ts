import { NextResponse } from "next/server";
import { getApiUserFromRequest } from "@/lib/auth/api-user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createPendingDeposit } from "@/lib/queries/wallets";

type Body = {
  amount?: number;
  receipt_url?: string;
  payment_ref?: string | null;
};

export async function POST(req: Request) {
  const { user, error } = await getApiUserFromRequest(req);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  const amount = Number(body.amount ?? 0);
  const receiptUrl = body.receipt_url?.trim() ?? "";
  const paymentRef = body.payment_ref?.trim() || null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (!receiptUrl) {
    return NextResponse.json({ error: "receipt_url is required" }, { status: 400 });
  }

  const { data: brand, error: brandError } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (brandError || !brand?.id) {
    return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
  }

  try {
    const tx = await createPendingDeposit({
      brandId: brand.id,
      amount,
      receiptUrl,
      paymentRef,
    });
    return NextResponse.json({ success: true, transaction: tx });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to create pending deposit" },
      { status: 400 },
    );
  }
}
