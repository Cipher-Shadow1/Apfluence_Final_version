"use client";

import { useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { X, Plus, List, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LIST_COLORS = [
  "#8B5CF6", // blue
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#6366F1", // indigo
];

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (list: { id: string; name: string; color: string | null }) => void;
  authUserId: string;
}

export default function CreateListModal({
  isOpen,
  onClose,
  onCreated,
  authUserId,
}: CreateListModalProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(LIST_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("List name is required");
      return;
    }
    if (name.length > 100) {
      setError("Name too long (max 100 chars)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { createBrandList } = await import("@/lib/queries/lists.client");
      const list = await createBrandList(authUserId, name.trim(), selectedColor);

      if (!list) {
        setError("Failed to create list. Please try again.");
        return;
      }

      onCreated(list);
      setName("");
      setSelectedColor(LIST_COLORS[0]);
      onClose();
    } catch (e) {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <m.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Modal */}
            <m.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center
                                    justify-center"
                      style={{ background: selectedColor + "20" }}
                    >
                      <List size={18} style={{ color: selectedColor }} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Create New List
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100
                               text-gray-400 hover:text-gray-600
                               transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* List name input */}
                <div className="mb-5">
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-1.5"
                  >
                    List Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    placeholder="e.g. Fashion Micro-Influencers"
                    maxLength={100}
                    autoFocus
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl border text-sm",
                      "outline-none transition-all duration-200",
                      "placeholder:text-gray-300",
                      error
                        ? "border-red-300 ring-2 ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
                    )}
                  />
                  {error && (
                    <p className="mt-1.5 text-xs text-red-500">{error}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 text-right">
                    {name.length}/100
                  </p>
                </div>

                {/* Color picker */}
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium
                                    text-gray-700 mb-2"
                  >
                    Label Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {LIST_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className="w-8 h-8 rounded-full flex items-center
                                   justify-center transition-transform
                                   hover:scale-110 focus:outline-none"
                        style={{ background: color }}
                      >
                        {selectedColor === color && (
                          <Check size={14} color="white" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div
                  className="mb-6 px-4 py-3 rounded-xl bg-gray-50
                                border border-gray-100"
                >
                  <p
                    className="text-xs text-gray-400 mb-1.5 font-medium
                                uppercase tracking-wide"
                  >
                    Preview
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: selectedColor }}
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {name || "Your list name"}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      0 influencers
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl border
                               border-gray-200 text-sm font-medium
                               text-gray-600 hover:bg-gray-50
                               transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isLoading || !name.trim()}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold",
                      "text-white transition-all duration-200",
                      "flex items-center justify-center gap-2",
                      isLoading || !name.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md",
                    )}
                  >
                    {isLoading ? (
                      <div
                        className="w-4 h-4 border-2 border-white/30
                                      border-t-white rounded-full animate-spin"
                      />
                    ) : (
                      <>
                        <Plus size={16} />
                        Create List
                      </>
                    )}
                  </button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
