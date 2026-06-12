import { NextResponse } from "next/server";
import { getApiUserFromRequest } from "@/lib/auth/api-user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createWithdrawalRequest } from "@/lib/queries/wallets";

type Body = {
  amount?: number;
  ccp_number?: string;
  ccp_key?: string | null;
  full_name?: string;
};

export async function POST(req: Request) {
  const { user, error } = await getApiUserFromRequest(req);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  const amount = Number(body.amount ?? 0);
  const ccpNumber = body.ccp_number?.trim() ?? "";
  const ccpKey = body.ccp_key?.trim() || null;
  const fullName = body.full_name?.trim() ?? "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (!ccpNumber || !fullName) {
    return NextResponse.json(
      { error: "ccp_number and full_name are required" },
      { status: 400 },
    );
  }

  const { data: influencer, error: influencerError } = await supabaseAdmin
    .from("influencers")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (influencerError || !influencer?.id) {
    return NextResponse.json(
      { error: "Influencer profile not found" },
      { status: 404 },
    );
  }

  try {
    const request = await createWithdrawalRequest({
      influencerId: influencer.id,
      amount,
      ccpNumber,
      ccpKey,
      fullName,
    });

    return NextResponse.json({ success: true, withdrawal_request: request });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to create withdrawal request" },
      { status: 400 },
    );
  }
}
