import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Body = {
  company_name?: string | null;
  website?: string | null;
  logo_url?: string | null;
};

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!token) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

  const {
    data: { user },
    error: userErr,
  } = await supabaseAdmin.auth.getUser(token);

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authUserId = user.id;
  const email = user.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const companyName = body.company_name?.trim() || "";
  const website = body.website?.trim() || null;
  const logoUrl = body.logo_url?.trim() || null;

  // Existing linked brand => idempotent success
  const { data: already } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (already?.id) {
    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      user_metadata: { ...(user.user_metadata ?? {}), role: "brand" },
    });
    return NextResponse.json({
      success: true,
      role: "brand",
      brand_onboarding: "already_linked",
    });
  }

  // Existing brand row by email without link => claim
  const { data: byEmail } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("email", email)
    .is("auth_user_id", null)
    .limit(1)
    .maybeSingle();

  if (byEmail?.id) {
    const { error: claimErr } = await supabaseAdmin
      .from("brands")
      .update({
        auth_user_id: authUserId,
        company_name: companyName || undefined,
        website: website ?? undefined,
        logo_url: logoUrl ?? undefined,
      })
      .eq("id", byEmail.id)
      .is("auth_user_id", null);

    if (claimErr) {
      return NextResponse.json(
        { error: `Failed to claim brand profile: ${claimErr.message}` },
        { status: 500 },
      );
    }

    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      user_metadata: { ...(user.user_metadata ?? {}), role: "brand" },
    });
    return NextResponse.json({
      success: true,
      role: "brand",
      brand_onboarding: "claimed",
    });
  }

  if (!companyName) {
    return NextResponse.json(
      { error: "company_name is required to create brand profile" },
      { status: 400 },
    );
  }

  const { error: createErr } = await supabaseAdmin.from("brands").insert({
    auth_user_id: authUserId,
    email,
    company_name: companyName,
    website,
    logo_url: logoUrl,
  });

  if (createErr) {
    return NextResponse.json(
      { error: `Failed to create brand profile: ${createErr.message}` },
      { status: 500 },
    );
  }

  await supabaseAdmin.auth.admin.updateUserById(authUserId, {
    user_metadata: { ...(user.user_metadata ?? {}), role: "brand" },
  });

  return NextResponse.json({
    success: true,
    role: "brand",
    brand_onboarding: "created",
  });
}
