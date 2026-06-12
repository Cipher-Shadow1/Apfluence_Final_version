import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { updateSession } from "@/lib/supabase/middleware";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Helper: extract the space from the URL path
// /sign-in/brand → 'brand'
// /sign-in/influencer → 'influencer'
// /sign-up/brand/verify → 'brand'
function getSpaceFromPath(pathname: string): "brand" | "influencer" | null {
  if (pathname.includes("/brand")) return "brand";
  if (pathname.includes("/influencer")) return "influencer";
  return null;
}

async function resolveRole(authUserId: string, metadataRole?: string): Promise<"brand" | "influencer" | undefined> {
  if (metadataRole === "brand" || metadataRole === "influencer") {
    return metadataRole;
  }

  const { data: brand } = await supabaseAdmin
    .from("brands")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (brand?.id) return "brand";

  const { data: influencer } = await supabaseAdmin
    .from("influencers")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (influencer?.id) return "influencer";

  return undefined;
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  let response = NextResponse.next();

  response = await updateSession(req, response);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set({ name, value });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  let userRole: "brand" | "influencer" | undefined;

  if (userId) {
    const metadataRole = user?.user_metadata?.role as string | undefined;
    userRole = await resolveRole(userId, metadataRole);
  }

  // ── Auth pages: apply role-aware redirect logic ──────────────────
  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isAuthPage && userId) {
    const pageSpace = getSpaceFromPath(pathname);

    // Only redirect if the user's role matches the page's space
    // If role !== space → let them through (cross-role access)
    if (userRole && pageSpace && userRole === pageSpace) {
      const dashboardUrl = new URL(`/${userRole}`, req.url);
      response = NextResponse.redirect(dashboardUrl);
      return await updateSession(req, response);
    }

    // Cross-role: brand visiting influencer pages or vice versa
    // → let the request continue to the page
  }

  // ── Protected brand routes ────────────────────────────────────────
  if (pathname.startsWith("/brand")) {
    if (!userId || userRole !== "brand") {
      response = NextResponse.redirect(new URL("/sign-in/brand", req.url));
      return await updateSession(req, response);
    }
  }

  // ── Protected influencer routes ───────────────────────────────────
  if (pathname.startsWith("/influencer")) {
    if (!userId || userRole !== "influencer") {
      response = NextResponse.redirect(new URL("/sign-in/influencer", req.url));
      return await updateSession(req, response);
    }
  }

  
  return await updateSession(req, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2|ttf)$).*)",
  ],
};
