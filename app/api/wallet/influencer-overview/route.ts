import { NextResponse } from "next/server";
import { getApiUserFromRequest } from "@/lib/auth/api-user";
import { getInfluencerWalletOverview } from "@/lib/queries/wallets";

export async function GET(req: Request) {
  const { user, error } = await getApiUserFromRequest(req);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  try {
    const overview = await getInfluencerWalletOverview(user.id);
    return NextResponse.json(overview);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to load influencer wallet" },
      { status: 400 },
    );
  }
}
