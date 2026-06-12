import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/img-proxy?url=<encoded-url>
 *
 * Proxies external CDN images (Instagram fbcdn, TikTok, YouTube, etc.)
 * server-side so hotlink/referer protection doesn't block them.
 * The server fetches the image without a Referer header and streams it back.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(imageUrl);
    // Basic sanity — must be http(s)
    new URL(decoded);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  // Only proxy known CDN hostnames to prevent open-proxy abuse
  const allowed = [
    "fbcdn.net",
    "instagram.com",
    "cdninstagram.com",
    "tiktokcdn.com",
    "tiktokcdn-us.com",
    "tiktokv.com",
    "ytimg.com",
    "googleusercontent.com",
    "ggpht.com",
    "twimg.com",
    "pbs.twimg.com",
    "cdnfacebook.com",
    "facebook.com",
  ];

  const hostname = new URL(decoded).hostname;
  const isAllowed = allowed.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  const isSupabasePublicImage =
    /\.supabase\.co$/i.test(hostname) &&
    decoded.includes("/storage/v1/object/public/");
  if (!isAllowed && !isSupabasePublicImage) {
    return new NextResponse("Hostname not allowed", { status: 403 });
  }

  const referer =
    isSupabasePublicImage
      ? undefined
      : hostname.includes("fbcdn") || hostname.includes("instagram")
        ? "https://www.instagram.com/"
        : hostname.includes("tiktok")
          ? "https://www.tiktok.com/"
          : hostname.includes("ytimg") || hostname.includes("ggpht")
            ? "https://www.youtube.com/"
            : "https://www.google.com/";

  const origin =
    isSupabasePublicImage
      ? undefined
      : hostname.includes("fbcdn") || hostname.includes("instagram")
        ? "https://www.instagram.com"
        : hostname.includes("tiktok")
          ? "https://www.tiktok.com"
          : "https://www.google.com";

  try {
    const upstream = await fetch(decoded, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        ...(referer ? { Referer: referer } : {}),
        ...(origin ? { Origin: origin } : {}),
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      redirect: "follow",
    });

    if (!upstream.ok) {
      return new NextResponse("Upstream fetch failed", {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache aggressively — CDN images don't change
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[img-proxy] fetch error", err);
    return new NextResponse("Proxy error", { status: 502 });
  }
}
