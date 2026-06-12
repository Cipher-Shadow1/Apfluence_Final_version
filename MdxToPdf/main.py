"""
md_to_pdf.py
============
Standalone tool to convert Markdown to perfectly formatted A4 PDFs using Playwright Chromium.
"""

from __future__ import annotations
import sys
import tempfile
import argparse
from pathlib import Path

# ──────────────────────────────────────────────────────────────────────────────
# 0. Dependency check
# ──────────────────────────────────────────────────────────────────────────────
try:
    import markdown as md_lib
    from markdown.extensions.tables import TableExtension
    from markdown.extensions.fenced_code import FencedCodeExtension
except ImportError:
    sys.exit("❌  Missing dependency: run  pip install markdown")

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("❌  Missing dependency: run  pip install playwright  &&  playwright install chromium")

# ──────────────────────────────────────────────────────────────────────────────
# 1. Imports & Argparse setup
# ──────────────────────────────────────────────────────────────────────────────
def get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert Markdown to perfectly formatted A4 PDF using Playwright.")
    parser.add_argument("input_file", type=str, help="Path to the input .md or .mdx file")
    parser.add_argument("output_file", type=str, nargs="?", help="Optional path to output .pdf file. Defaults to side-by-side with input.")
    return parser.parse_args()


# ──────────────────────────────────────────────────────────────────────────────
# 2. CSS stylesheet
# ──────────────────────────────────────────────────────────────────────────────
CSS_STYLES = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 10.5pt;
    line-height: 1.65;
    color: #111827;
    background: white;
}

/* ── Headings ─────────────────────────────────────────────── */
h1 {
    font-size: 22pt;
    font-weight: 800;
    color: #1e1b4b;
    letter-spacing: -0.03em;
    margin-bottom: 6mm;
    padding-bottom: 3mm;
    border-bottom: 2px solid #6366f1;
    break-before: page;              /* Always start h1 on a new page */
    break-after: avoid;              /* Never break right after heading */
    page-break-before: always;
    page-break-after: avoid;
}

/* Don't break the VERY FIRST h1 */
body > h1:first-of-type {
    break-before: auto;
    page-break-before: auto;
}

h2 {
    font-size: 15pt;
    font-weight: 700;
    color: #312e81;
    margin-top: 8mm;
    margin-bottom: 3mm;
    padding-bottom: 1.5mm;
    border-bottom: 1px solid #e0e7ff;
    break-after: avoid;
    page-break-after: avoid;
}

h3 {
    font-size: 12pt;
    font-weight: 600;
    color: #1a1aff;
    margin-top: 5mm;
    margin-bottom: 2mm;
    break-after: avoid;
    page-break-after: avoid;
}

h4 {
    font-size: 10.5pt;
    font-weight: 600;
    color: #4b5563;
    margin-top: 3mm;
    margin-bottom: 1.5mm;
    break-after: avoid;
    page-break-after: avoid;
}

/* ── Paragraphs & Lists ───────────────────────────────────── */
p {
    margin-bottom: 3mm;
    orphans: 3;
    widows: 3;
}

ul, ol {
    padding-left: 5mm;
    margin-bottom: 3mm;
}

li {
    margin-bottom: 1mm;
    line-height: 1.55;
    break-inside: avoid;
    page-break-inside: avoid;
}

li p { margin-bottom: 0; }

/* ── Code ─────────────────────────────────────────────────── */
code {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 8.8pt;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 3px;
    padding: 0 1.5mm;
    color: #6d28d9;
}

pre {
    background: #1e1b4b;
    border-radius: 4px;
    padding: 4mm 5mm;
    margin: 3mm 0;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
}

pre code {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 8.2pt;
    line-height: 1.7;
    color: #e0e7ff;
    background: transparent;
    border: none;
    padding: 0;
    border-radius: 0;
    white-space: pre-wrap;
    word-break: break-all;
}

/* ── Tables ────────────────────────────────────────────────── */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 3mm 0;
    font-size: 9pt;
    break-inside: avoid;
    page-break-inside: avoid;
}

thead tr {
    background: #1a1aff;
    color: white;
}

thead th {
    padding: 2mm 3mm;
    text-align: left;
    font-weight: 600;
    font-size: 8.5pt;
    letter-spacing: 0.01em;
}

tbody tr:nth-child(even) {
    background: #f5f3ff;
}

tbody tr:hover {
    background: #ede9fe;
}

td {
    padding: 1.8mm 3mm;
    border-bottom: 0.5px solid #e5e7eb;
    vertical-align: top;
    line-height: 1.5;
}

/* ── Blockquotes ───────────────────────────────────────────── */
blockquote {
    border-left: 3px solid #f59e0b;
    background: #fffbeb;
    margin: 3mm 0;
    padding: 2.5mm 4mm;
    border-radius: 0 3px 3px 0;
    break-inside: avoid;
    page-break-inside: avoid;
}

blockquote p {
    font-size: 9.5pt;
    color: #92400e;
    margin-bottom: 1mm;
}

blockquote p:last-child { margin-bottom: 0; }

/* ── Horizontal rule ─────────────────────────────────────── */
hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 5mm 0;
}

/* ── Strong / em ─────────────────────────────────────────── */
strong { font-weight: 700; color: #1e1b4b; }
em     { font-style: italic; color: #4b5563; }

/* ── Images ──────────────────────────────────────────────── */
img {
    max-width: 100%;        /* Never overflow the page width */
    width: auto;
    height: auto;           /* Preserve aspect ratio */
    display: block;
    margin: 4mm auto;       /* Center horizontally with vertical spacing */
    break-inside: avoid;
    page-break-inside: avoid;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.10);
}

/* Tighter images inside blockquotes or list items */
li img, blockquote img {
    margin: 2mm auto;
}
"""

# ──────────────────────────────────────────────────────────────────────────────
# 3. HTML Builder
# ──────────────────────────────────────────────────────────────────────────────
def convert_to_html(markdown_text: str, title: str, base_dir: Path) -> str:
    """Uses Python-Markdown to convert text, then wraps it in a styled HTML doc."""
    converter = md_lib.Markdown(
        extensions=[
            TableExtension(),
            FencedCodeExtension(),
            "md_in_html",
        ]
    )
    body_html = converter.convert(markdown_text)

    # Resolve Next.js style absolute paths (/image.png) to the public directory
    public_dir = base_dir / "public"
    if public_dir.exists():
        public_uri = public_dir.as_uri()
        body_html = body_html.replace('src="/', f'src="{public_uri}/')

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <base href="{base_dir.as_uri()}/" />
  <style>
{CSS_STYLES}
  </style>
</head>
<body>
{body_html}
</body>
</html>"""


# ──────────────────────────────────────────────────────────────────────────────
# 4. Main Execution
# ──────────────────────────────────────────────────────────────────────────────
def main() -> None:
    args = get_args()
    input_path = Path(args.input_file).resolve()
    
    if not input_path.exists():
        sys.exit(f"❌ Input file not found: {input_path}")
        
    if args.output_file:
        output_path = Path(args.output_file).resolve()
    else:
        output_path = input_path.with_suffix(".pdf")
        
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"[1/3] Reading {input_path.name}...")
    text = input_path.read_text(encoding="utf-8")

    print("[2/3] Converting Markdown -> HTML...")
    title = input_path.stem.replace("_", " ").title()
    full_html = convert_to_html(text, title=title, base_dir=input_path.parent)

    # Write a temporary HTML file — Playwright uses file:// URLs
    with tempfile.NamedTemporaryFile(
        mode="w", encoding="utf-8", suffix=".html", delete=False
    ) as tmp:
        tmp.write(full_html)
        tmp_path = Path(tmp.name)

    print("[3/3] Rendering natively in Playwright Chromium...")
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page()

            # Load the HTML file
            page.goto(tmp_path.as_uri(), wait_until="networkidle")

            # Playwright pdf() natively handles all layout natively!
            page.pdf(
                path=str(output_path),
                format="A4",
                margin={
                    "top":    "22mm",
                    "bottom": "22mm",
                    "left":   "22mm",
                    "right":  "22mm",
                },
                print_background=True,
                display_header_footer=True,
                header_template=(
                    '<div style="font-size:8px;font-family:Inter,sans-serif;'
                    'color:#9ca3af;width:100%;text-align:right;padding-right:22mm;">'
                    'CONFIDENTIAL</div>'
                ),
                footer_template=(
                    '<div style="font-size:8px;font-family:Inter,sans-serif;'
                    f'color:#9ca3af;width:100%;text-align:center;">'
                    f'{title} &nbsp;·&nbsp; '
                    '<span class="pageNumber"></span> / <span class="totalPages"></span>'
                    '</div>'
                ),
            )
            browser.close()
    finally:
        tmp_path.unlink(missing_ok=True)  # clean up temp file

    size_kb = output_path.stat().st_size // 1024
    try:
        rel_out = output_path.relative_to(Path.cwd())
    except ValueError:
        rel_out = output_path
        
    print(f"\\n[OK]  PDF written -> {rel_out} ({size_kb} KB)")
    print(f"      Format: A4 | Margins: 22mm")
    print(f"      Engine: Native Chromium Layout Engine")


if __name__ == "__main__":
    main()
