export const APFLUENCE_SIGNATURE_MARKER = 'data-apfluence-signature="true"';

export type EmailSignatureConfig = {
  title?: string;
  phone?: string;
  websiteText?: string;
  websiteUrl?: string;
  linkedinText?: string;
  linkedinUrl?: string;
  logoUrl?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildSignatureHtml(config: EmailSignatureConfig = {}) {
  const title = escapeHtml(config.title ?? "Business Consultant");
  const phone = escapeHtml(config.phone ?? "07976 985625");
  const websiteText = escapeHtml(config.websiteText ?? "www.example.com");
  const websiteUrl = escapeHtml(config.websiteUrl ?? "https://www.example.com");
  const logoUrl = escapeHtml(config.logoUrl ?? "{{campaign_logo_url}}");

  return `
<div ${APFLUENCE_SIGNATURE_MARKER} style="margin-top:28px;padding-top:16px;border-top:1px solid #E5E7EB;font-family:Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    <tr>
      <!-- Logo cell -->
      <td style="vertical-align:middle;padding-right:20px">
        <img
          src="${logoUrl}"
          alt="{{brand_name}} logo"
          style="display:block;width:72px;height:72px;object-fit:contain;border-radius:8px"
        />
      </td>

      <!-- Divider -->
      <td style="vertical-align:middle;padding-right:20px">
        <div style="width:1px;height:60px;background-color:#E5E7EB"></div>
      </td>

      <!-- Info cell -->
      <td style="vertical-align:middle">
        <div style="font-size:14px;font-weight:700;color:#111827;line-height:1.3">
          <span style="font-size:14px;font-weight:700;color:#111827">{{brand_name}}</span>
        </div>
        <div style="margin-top:2px">
          <span style="font-size:12px;color:#6B7280">${title}</span>
        </div>
        <div style="margin-top:8px">
          <span style="font-size:12px;color:#6B7280">Phone: </span>
          <span style="font-size:12px;color:#374151">${phone}</span>
        </div>
        <div style="margin-top:2px">
          <span style="font-size:12px;color:#6B7280">Website: </span>
          <a href="${websiteUrl}" style="font-size:12px;color:#6366F1;text-decoration:none">${websiteText}</a>
        </div>
      </td>
    </tr>
  </table>
</div>
`.trim();
}

export function buildDefaultSignatureHtml(config: EmailSignatureConfig = {}) {
  return buildSignatureHtml(config);
}

const SIGNATURE_BLOCK_REGEX =
  /<div\s+data-apfluence-signature="true"[\s\S]*?<\/table>\s*<\/div>/m;

export function upsertDefaultSignatureHtml(
  html?: string | null,
  config: EmailSignatureConfig = {},
) {
  const signatureHtml = buildDefaultSignatureHtml(config);
  if (!html) return signatureHtml;

  if (SIGNATURE_BLOCK_REGEX.test(html)) {
    return html.replace(SIGNATURE_BLOCK_REGEX, signatureHtml);
  }

  if (html.includes(APFLUENCE_SIGNATURE_MARKER)) {
    return `${html}\n${signatureHtml}`;
  }

  return `${html}\n${signatureHtml}`;
}
