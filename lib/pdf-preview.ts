/** Use with iframe `src` so Supabase (and other allowed) PDFs embed inline instead of forcing download. */
export function pdfPreviewEmbedSrc(originalUrl: string): string {
  const u = originalUrl?.trim();
  if (!u) return "";
  // `#view=FitH` helps Chrome’s built-in PDF viewer fill the frame (fragment is client-only).
  return `/api/pdf-preview?url=${encodeURIComponent(u)}#view=FitH`;
}
