"use client";

import { useMemo, useState } from "react";
import { Eye, X, ExternalLink } from "lucide-react";

function isPdf(url: string) {
  const clean = url.toLowerCase();
  return clean.includes(".pdf") || clean.includes("/raw/upload/");
}

export function ReceiptPreview({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const pdf = useMemo(() => isPdf(url), [url]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Eye size={12} />
        Preview
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-900">Receipt preview</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 bg-slate-50">
              {pdf ? (
                <object data={url} type="application/pdf" className="h-full w-full">
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      PDF cannot be embedded in this browser.
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink size={12} />
                      Open receipt
                    </a>
                  </div>
                </object>
              ) : (
                <div className="flex h-full items-center justify-center p-4">
                  <img
                    src={url}
                    alt="Receipt"
                    className="max-h-full max-w-full rounded-lg object-contain shadow"
                  />
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 px-4 py-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2b2ef8] hover:underline"
              >
                <ExternalLink size={12} />
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
