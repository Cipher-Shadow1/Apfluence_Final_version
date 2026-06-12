import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Body = {
  username?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

function emailIlikePattern(email: string): string {
  return email.trim().replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function splitName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
  fullName: string;
} {
  const safe = (fullName ?? "").trim();
  if (!safe) {
    return { firstName: "Creator", lastName: "Creator", fullName: "Creator" };
  }
  const parts = safe.split(/\s+/);
  const firstName = parts[0] || "Creator";
  const lastName = parts.slice(1).join(" ").trim() || firstName;
  return { firstName, lastName, fullName: safe };
}

async function uniqueInfluencerUsername(base: string): Promise<string> {
  const root = base.slice(0, 96);
  for (let n = 0; n < 30; n++) {
    const candidate = (n === 0 ? root : `${root}_${n}`).slice(0, 100);
    const { count, error } = await supabaseAdmin
      .from("influencers")
      .select("id", { count: "exact", head: true })
      .eq("username", candidate);
    if (error) {
      break;
    }
    if (count === 0) return candidate;
  }
  return `@u_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`.slice(0, 100);
}

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

  const email = user.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const authUserId = user.id;
  const body = (await req.json().catch(() => ({}))) as Body;
  const requestedUsername = (body.username ?? "").trim();
  const requestedName = (body.name ?? "").trim();
  const requestedFirstName = (body.first_name ?? "").trim();
  const requestedLastName = (body.last_name ?? "").trim();

  // ── Already linked: idempotent fast path ─────────────────────────────────────
  //
  // If this user already has an influencers row, just return early — BUT first
  // check whether there are campaign_influencers rows that were sent to this
  // email address but still point to an OLD orphaned influencer_id (the scraped
  // row that was never claimed because the user signed up before this fix).
  // If found, reroute those rows to point to the real influencer_id so the
  // dashboard immediately shows the correct active campaigns.
  const { data: alreadyLinked } = await supabaseAdmin
    .from("influencers")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (alreadyLinked?.id) {
    // Retroactive fix: reroute any orphaned campaign_influencers rows
    // that were originally sent to this email but point to a different influencer.
    const { data: orphanedCiRows } = await supabaseAdmin
      .from("campaign_influencers")
      .select("id, influencer_id")
      .ilike("invited_email", emailIlikePattern(email))
      .neq("influencer_id", alreadyLinked.id);

    if (orphanedCiRows && orphanedCiRows.length > 0) {
      // Only reroute rows whose influencer_id is still unclaimed (auth_user_id = null)
      const orphanedInfluencerIds = [...new Set(orphanedCiRows.map((r) => r.influencer_id as string))];

      const { data: unclaimedOrphans } = await supabaseAdmin
        .from("influencers")
        .select("id")
        .in("id", orphanedInfluencerIds)
        .is("auth_user_id", null);

      if (unclaimedOrphans && unclaimedOrphans.length > 0) {
        const unclaimedIds = unclaimedOrphans.map((r) => r.id as string);
        const ciIdsToFix = orphanedCiRows
          .filter((r) => unclaimedIds.includes(r.influencer_id as string))
          .map((r) => r.id as string);

        if (ciIdsToFix.length > 0) {
          await supabaseAdmin
            .from("campaign_influencers")
            .update({ influencer_id: alreadyLinked.id })
            .in("id", ciIdsToFix);
        }
      }
    }

    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      user_metadata: { ...(user.user_metadata ?? {}), role: "influencer" },
    });
    return NextResponse.json({
      success: true,
      role: "influencer",
      influencer_onboarding: "already_linked",
    });
  }

  // ── Claim path 1: match by influencers.email (scraped rows that have email) ──
  const { data: scraped } = await supabaseAdmin
    .from("influencers")
    .select("id")
    .not("email", "is", null)
    .ilike("email", emailIlikePattern(email))
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (scraped?.id) {
    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from("influencers")
      .update({
        auth_user_id: authUserId,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scraped.id)
      .select("id")
      .maybeSingle();

    if (claimErr) {
      return NextResponse.json(
        { error: `Failed to claim influencer profile: ${claimErr.message}` },
        { status: 500 },
      );
    }

    if (claimed?.id) {
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        user_metadata: { ...(user.user_metadata ?? {}), role: "influencer" },
      });
      return NextResponse.json({
        success: true,
        role: "influencer",
        influencer_onboarding: "claimed",
      });
    }
  }

  // ── Claim path 2: match via campaign_influencers.invited_email ───────────────
  {
    const { data: ciRows } = await supabaseAdmin
      .from("campaign_influencers")
      .select("influencer_id")
      .ilike("invited_email", emailIlikePattern(email))
      .limit(20);

    if (ciRows && ciRows.length > 0) {
      const uniqueInfluencerIds = [...new Set(ciRows.map((r) => r.influencer_id as string))];

      const { data: claimableInf } = await supabaseAdmin
        .from("influencers")
        .select("id")
        .in("id", uniqueInfluencerIds)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (claimableInf?.id) {
        const { data: claimed, error: claimErr } = await supabaseAdmin
          .from("influencers")
          .update({
            auth_user_id: authUserId,
            email,
            updated_at: new Date().toISOString(),
          })
          .eq("id", claimableInf.id)
          .select("id")
          .maybeSingle();

        if (claimErr) {
          return NextResponse.json(
            { error: `Failed to claim influencer profile via invite: ${claimErr.message}` },
            { status: 500 },
          );
        }

        if (claimed?.id) {
          await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            user_metadata: { ...(user.user_metadata ?? {}), role: "influencer" },
          });
          return NextResponse.json({
            success: true,
            role: "influencer",
            influencer_onboarding: "claimed_via_invite",
          });
        }
      }
    }
  }

  const displayName = (user.user_metadata?.full_name as string | undefined) ?? null;
  const fallbackName = requestedName || displayName;
  const { firstName: parsedFirst, lastName: parsedLast, fullName: parsedFull } = splitName(fallbackName);
  const firstName = requestedFirstName || parsedFirst;
  const lastName = requestedLastName || parsedLast;
  const fullName = requestedName || parsedFull;
  const local = email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "creator";
  const usernameSeed = requestedUsername.replace(/[^a-zA-Z0-9_]/g, "") || local;
  const baseHandle = `@${usernameSeed}`.slice(0, 80);
  const username = await uniqueInfluencerUsername(baseHandle);

  const { error: insertErr } = await supabaseAdmin.from("influencers").insert({
    auth_user_id: authUserId,
    name: fullName,
    first_name: firstName,
    last_name: lastName,
    username,
    email,
  });

  if (insertErr) {
    return NextResponse.json(
      { error: `Failed to create influencer profile: ${insertErr.message}` },
      { status: 500 },
    );
  }

  await supabaseAdmin.auth.admin.updateUserById(authUserId, {
    user_metadata: { ...(user.user_metadata ?? {}), role: "influencer" },
  });

  return NextResponse.json({
    success: true,
    role: "influencer",
    influencer_onboarding: "created",
  });
}
