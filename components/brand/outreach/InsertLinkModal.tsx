"use client";

import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface InsertLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, url: string, newTab: boolean) => void;
  initialText?: string;
  initialUrl?: string;
}

export default function InsertLinkModal({
  isOpen,
  onClose,
  onSave,
  initialText = "",
  initialUrl = "",
}: InsertLinkModalProps) {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const [newTab, setNewTab] = useState(true);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setUrl(initialUrl);
      setNewTab(true);
    }
  }, [isOpen, initialText, initialUrl]);

  const handleSave = () => {
    onSave(text, url, newTab);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-zinc-200 shadow-xl [&>button]:hidden">
        <DialogTitle className="sr-only">Insert Link</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="text-base font-bold text-zinc-900">Insert link</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Info Box */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-50/50 p-4 border border-blue-100/50">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-zinc-900">Merge fields</p>
              <p className="text-sm text-zinc-600 mt-0.5">
                Link can be a merge field (For example: <span className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-blue-100 text-blue-700">{`{{application_link}}`}</span>)
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-600">Link Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="here"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 
                           placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-600">Link URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.my-website.com"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 
                           placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-2 group w-fit">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={newTab}
                  onChange={(e) => setNewTab(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-4 w-4 rounded bg-white border border-zinc-300 peer-focus:ring-2 peer-focus:ring-blue-500/20 
                                peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors" />
                {newTab && <X size={10} className="absolute text-white" style={{ strokeWidth: 4, transform: 'rotate(45deg)' }} />}
              </div>
              <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
                Open in new tab
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!url.trim()}
            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
