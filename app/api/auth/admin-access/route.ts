import { NextResponse } from "next/server";
import { getApiUserFromRequest, isAdminUser } from "@/lib/auth/api-user";

export async function POST(req: Request) {
  const { user, error } = await getApiUserFromRequest(req);
  if (!user) return NextResponse.json({ error }, { status: 401 });

  const allowed = await isAdminUser(user.id, user.user_metadata ?? null);
  if (!allowed) {
    return NextResponse.json(
      { error: "This account is not allowed to access admin." },
      { status: 403 },
    );
  }

  return NextResponse.json({ success: true });
}
