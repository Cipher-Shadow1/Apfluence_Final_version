import { NextResponse } from "next/server";
import { getApiUserFromRequest, isAdminUser } from "@/lib/auth/api-user";
import { distributeCampaignFundsByAdmin } from "@/lib/queries/wallets";

type Body = {
  admin_note?: string | null;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getApiUserFromRequest(req);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  if (!(await isAdminUser(user.id, user.user_metadata ?? null))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Body;

  try {
    const result = await distributeCampaignFundsByAdmin({
      campaignId: id,
      adminId: user.id,
      adminNote: body.admin_note ?? null,
    });
    return NextResponse.json({ success: true, distribution: result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to distribute campaign payment" },
      { status: 400 },
    );
  }
}
