import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Resolve the authenticated user for API routes.
 *
 * - If an `Authorization: Bearer <token>` header is present, we validate it using
 *   the service role client (server-side only).
 * - Otherwise, we fall back to the Next.js cookie-based Supabase session.
 */
export async function getApiUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token =
    authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

  if (!token) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // No-op in contexts where cookies are immutable.
            }
          },
        },
      },
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return { user: null, error: "Missing access token" };
    return { user, error: null };
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return { user: null, error: "Unauthorized" };
  return { user, error: null };
}

export async function isAdminUser(
  userId: string,
  userMeta: Record<string, any> | null,
) {
  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from("admins")
    .select("id")
    .eq("auth_user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!adminError && adminRow?.id) return true;

  const allowed = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  if (allowed.includes(userId)) return true;
  if (userMeta?.role === "admin") return true;
  if (userMeta?.is_admin === true) return true;
  return false;
}

