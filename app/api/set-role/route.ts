import { NextResponse } from "next/server";
export async function POST(req: Request) {
  void req;
  return NextResponse.json(
    {
      error:
        "Deprecated endpoint. Use /api/auth/influencer-onboard or /api/auth/brand-onboard.",
    },
    { status: 410 },
  );
}
