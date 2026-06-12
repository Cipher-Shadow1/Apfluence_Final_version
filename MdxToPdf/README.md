# MdxToPdf

A standalone, dependency-free tool that converts Markdown (`.md` or `.mdx`) files into perfectly formatted, A4-sized PDF reports.

Instead of relying on clunky HTML-to-PDF rendering engines that require system-level installations (like `weasyprint` needing GTK/Pango), this tool uses **Playwright Chromium** to render the document precisely as it would appear in a top-tier modern browser, then prints it natively to PDF.

## Features
- **Perfect Typography:** Uses `Inter` for body text and `JetBrains Mono` for code blocks.
- **Smart Page Breaks:** Calculates the height of parsed blocks and automatically injects CSS page breaks so headings are never orphaned at the bottom of pages, and tables don't awkwardly split.
- **Header & Footer:** Includes professional styling, page numbers (`Page X / Y`), and a "CONFIDENTIAL" watermark.
- **Zero OS Dependencies:** All required engines are self-contained via Playwright.

## Setup

Navigate to this folder and install the Python requirements, along with the Playwright Chromium binary:

```bash
cd MdxToPdf
pip install -r requirements.txt
playwright install chromium
```

## Usage

Simply pass the input `.md` file, and optionally the output `.pdf` path:

```bash
python main.py ../system_overview.md
```

If no output path is provided, it will generate a PDF side-by-side with your original markdown file, just ending in `.pdf`.

```bash
# Specifying a custom output path:
python main.py ../README.md ../docs/Documentation.pdf
```
