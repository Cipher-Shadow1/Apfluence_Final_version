import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type DraftPayload = {
  submissionType: "media" | "youtube" | "blog";
  mediaUrls?: string[];
  youtubeUrl?: string;
  blogUrl?: string;
  note?: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const { data: ci, error } = await supabaseAdmin
    .from("campaign_influencers")
    .select(`
      id,
      token,
      status,
      influencer_id,
      campaign_id,
      draft_submissions,
      latest_draft_submitted_at,
      campaigns (
        id,
        name,
        brands ( id, company_name, logo_url )
      ),
      influencers (
        id,
        name,
        first_name,
        last_name,
        username,
        avatar_url
      )
    `)
    .eq("token", token)
    .single();

  if (error || !ci) {
    return NextResponse.json(
      { error: "Invalid or expired draft link" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ...ci,
    draft_submissions: Array.isArray(ci.draft_submissions) ? ci.draft_submissions : [],
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  let body: DraftPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: ci, error } = await supabaseAdmin
    .from("campaign_influencers")
    .select(`
      id,
      campaign_id,
      influencer_id,
      status,
      draft_submissions,
      campaigns ( brand_id, name ),
      influencers ( name )
    `)
    .eq("token", token)
    .single();

  if (error || !ci) {
    return NextResponse.json({ error: "Invalid draft token" }, { status: 404 });
  }

  // Allow upload after brand moves creator to "shipped" (draft requested) or when resubmitting in "drafted".
  if (!["shipped", "drafted"].includes(ci.status ?? "")) {
    return NextResponse.json(
      { error: "Draft submission is not available for this campaign stage." },
      { status: 400 },
    );
  }

  if (!["media", "youtube", "blog"].includes(body.submissionType)) {
    return NextResponse.json({ error: "Invalid draft type." }, { status: 400 });
  }

  if (body.submissionType === "media" && !(body.mediaUrls && body.mediaUrls.length > 0)) {
    return NextResponse.json({ error: "Please upload at least one media file." }, { status: 400 });
  }
  if (body.submissionType === "youtube" && !body.youtubeUrl?.trim()) {
    return NextResponse.json({ error: "YouTube URL is required." }, { status: 400 });
  }
  if (body.submissionType === "blog" && !body.blogUrl?.trim()) {
    return NextResponse.json({ error: "Blog URL is required." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const existing = Array.isArray(ci.draft_submissions) ? ci.draft_submissions : [];
  const newDraft = {
    id: crypto.randomUUID(),
    type: body.submissionType,
    media_urls: body.mediaUrls ?? [],
    youtube_url: body.youtubeUrl ?? null,
    blog_url: body.blogUrl ?? null,
    note: body.note ?? null,
    created_at: now,
  };
  const updatedDrafts = [...existing, newDraft];

  const { error: updateError } = await supabaseAdmin
    .from("campaign_influencers")
    .update({
      draft_submissions: updatedDrafts,
      latest_draft_submitted_at: now,
      status: "drafted",
    })
    .eq("token", token);

  if (updateError) {
    console.error("draft submit error:", updateError);
    return NextResponse.json({ error: "Failed to submit draft." }, { status: 500 });
  }

  const brandId = (ci.campaigns as any)?.brand_id;
  if (brandId) {
    await supabaseAdmin.from("campaign_activity").insert({
      brand_id: brandId,
      campaign_id: ci.campaign_id,
      type: "draft_submitted",
      title: "Influencer submitted a draft",
      description: `${(ci.influencers as any)?.name ?? "An influencer"} submitted draft content`,
      meta: {
        influencer_id: ci.influencer_id,
        draft_type: body.submissionType,
        media_count: body.mediaUrls?.length ?? 0,
      },
    });
  }

  return NextResponse.json({ success: true, draft: newDraft });
}
