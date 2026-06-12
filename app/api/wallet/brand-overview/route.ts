import { NextResponse } from "next/server";
import { getApiUserFromRequest } from "@/lib/auth/api-user";
import { getBrandWalletOverview } from "@/lib/queries/wallets";

export async function GET(req: Request) {
  const { user, error } = await getApiUserFromRequest(req);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  try {
    const overview = await getBrandWalletOverview(user.id);
    return NextResponse.json({ success: true, ...overview });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to load brand wallet overview" },
      { status: 400 },
    );
  }
}
