import { NextResponse } from "next/server";
import { getApiUserFromRequest } from "@/lib/auth/api-user";
import { payCampaignPayoutByBrand } from "@/lib/queries/wallets";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getApiUserFromRequest(req);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  try {
    const result = await payCampaignPayoutByBrand({
      authUserId: user.id,
      payoutId: id,
    });
    return NextResponse.json({ success: true, payout: result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to pay payout request" },
      { status: 400 },
    );
  }
}
