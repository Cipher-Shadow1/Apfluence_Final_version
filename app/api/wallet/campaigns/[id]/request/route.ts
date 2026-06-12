import { NextResponse } from "next/server";
import { getApiUserFromRequest } from "@/lib/auth/api-user";
import { requestCampaignInfluencerPayment } from "@/lib/queries/wallets";

type Body = {
  campaign_influencer_id?: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getApiUserFromRequest(req);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const { id: campaignId } = await params;
  const body = (await req.json().catch(() => ({}))) as Body;
  const campaignInfluencerId = body.campaign_influencer_id?.trim() ?? "";

  if (!campaignInfluencerId) {
    return NextResponse.json(
      { error: "campaign_influencer_id is required" },
      { status: 400 },
    );
  }

  try {
    const payout = await requestCampaignInfluencerPayment({
      authUserId: user.id,
      campaignId,
      campaignInfluencerId,
    });

    return NextResponse.json({ success: true, payout });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to request payment" },
      { status: 400 },
    );
  }
}
