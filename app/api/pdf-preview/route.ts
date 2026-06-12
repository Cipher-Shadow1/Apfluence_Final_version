import { NextRequest, NextResponse } from "next/server";

const PUBLIC_STORAGE_PATH = "/storage/v1/object/public/";

/** Fix paths like `file%2520(2).pdf` (double-encoded) so upstream fetch resolves the real object. */
function normalizeSupabasePublicUrl(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }

  if (u.protocol !== "https:") return null;

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (projectUrl) {
    try {
      const allowedHost = new URL(projectUrl).hostname;
      if (u.hostname !== allowedHost) return null;
    } catch {
      return null;
    }
  } else if (!/\.supabase\.co$/i.test(u.hostname)) {
    return null;
  }

  if (!u.pathname.includes(PUBLIC_STORAGE_PATH)) return null;

  let path = u.pathname;
  for (let i = 0; i < 4 && path.includes("%"); i++) {
    try {
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
    } catch {
      break;
    }
  }
  u.pathname = path;

  const lower = path.toLowerCase();
  const looksPdf =
    lower.endsWith(".pdf") ||
    lower.includes(".pdf/") ||
    /\/[^/]+\.pdf$/i.test(path);
  if (!looksPdf) return null;

  return u;
}

/**
 * Streams a Supabase Storage public PDF through this origin so browsers can
 * embed it in an iframe (inline disposition, no foreign X-Frame-Options).
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw?.trim()) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const target = normalizeSupabasePublicUrl(raw);
  if (!target) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const upstream = await fetch(target.href, {
    headers: { Accept: "application/pdf,*/*" },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to load document" },
      { status: upstream.status >= 400 ? upstream.status : 502 },
    );
  }

  let contentType =
    upstream.headers.get("content-type")?.split(";")[0]?.trim() ??
    "application/pdf";
  if (contentType === "application/octet-stream") {
    contentType = "application/pdf";
  }

  // Buffer full body: streaming fetch→Response can yield blank PDF iframes in
  // Chrome; arrayBuffer keeps Content-Length correct for the embedded viewer.
  const bytes = await upstream.arrayBuffer();
  if (bytes.byteLength === 0) {
    return NextResponse.json({ error: "Empty document" }, { status: 502 });
  }

  const head = new Uint8Array(bytes.slice(0, 5));
  const isPdfMagic =
    head.length >= 5 &&
    head[0] === 0x25 &&
    head[1] === 0x50 &&
    head[2] === 0x44 &&
    head[3] === 0x46 &&
    head[4] === 0x25;
  const outType =
    isPdfMagic || contentType === "application/pdf" || contentType === "application/octet-stream"
      ? "application/pdf"
      : contentType;

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": outType,
      "Content-Disposition": 'inline; filename="document.pdf"',
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, max-age=120",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
