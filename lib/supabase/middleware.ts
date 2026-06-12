import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest, response: NextResponse) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Update request cookies for downstream components
            request.cookies.set({ name, value });
            // Update response cookies to apply changes to the client
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Refresh auth token if needed
  await supabase.auth.getUser();

  return response;
};
