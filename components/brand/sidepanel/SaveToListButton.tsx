"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  Check,
  ChevronDown,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";
import { cn } from "@/lib/utils";
import {
  getBrandLists,
  addInfluencerToList,
  removeInfluencerFromList,
  getListsContainingInfluencer,
} from "@/lib/queries/lists.client";

export type SaveToListButtonVariant = "default" | "icon";

interface SaveToListButtonProps {
  influencerId: string; // Must be the real Supabase UUID
  /** `icon` = compact check used on result cards; same list picker + API as default. */
  variant?: SaveToListButtonVariant;
  className?: string;
}

const SaveToListButton = ({
  influencerId,
  variant = "default",
  className,
}: SaveToListButtonProps) => {
  const { userId, isLoaded } = useSupabaseUser();
  const [isOpen, setIsOpen] = useState(false);
  const [lists, setLists] = useState<any[]>([]);
  const [savedListIds, setSavedListIds] = useState<string[]>([]);
  const [loadingListId, setLoadingListId] = useState<string | null>(null);
  const [isFetchingLists, setIsFetchingLists] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [portalReady, setPortalReady] = useState(false);

  // Debug: log the influencerId on mount
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[SaveToListButton] influencerId received:", influencerId);
      console.log("[SaveToListButton] type:", typeof influencerId);
    }
  }, [influencerId]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (variant !== "icon" || !isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [variant, isOpen]);

  // Close on outside click (dropdown only — icon variant uses centered modal + backdrop)
  useEffect(() => {
    if (variant === "icon") return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [variant]);

  // Fetch lists + which ones contain this influencer when dropdown opens
  useEffect(() => {
    if (!isOpen || !isLoaded || !userId) return;
    if (process.env.NODE_ENV === "development") {
      console.log("[SaveToListButton] Fetching lists for user:", userId);
    }

    setIsFetchingLists(true);
    setLastError(null);

    Promise.all([
      getBrandLists(userId),
      getListsContainingInfluencer(userId, influencerId),
    ])
      .then(async ([allLists, containingIds]) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[SaveToListButton] Lists fetched:", allLists.length);
          console.log(
            "[SaveToListButton] Influencer is in lists:",
            containingIds,
          );
        }
        setLists(allLists);
        setSavedListIds(containingIds);

        // Quick-save from cards: if not on any list yet, add to newest list (API order = created_at desc).
        if (
          variant === "icon" &&
          containingIds.length === 0 &&
          allLists.length > 0
        ) {
          const newestListId = allLists[0].id;
          const ok = await addInfluencerToList(
            userId,
            newestListId,
            influencerId,
          );
          if (ok) {
            setSavedListIds([newestListId]);
          } else {
            setLastError("Could not add to your newest list");
          }
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development")
          console.error("[SaveToListButton] Fetch error:", err);
        setLastError("Failed to load lists");
      })
      .finally(() => setIsFetchingLists(false));
  }, [isOpen, isLoaded, userId, influencerId, variant]);

  const isSavedToAny = savedListIds.length > 0;

  const handleToggle = async (listId: string) => {
    if (!userId) return;
    const isInList = savedListIds.includes(listId);
    setLoadingListId(listId);
    setLastError(null);

    // OPTIMISTIC UPDATE
    if (isInList) {
      setSavedListIds((prev) => prev.filter((id) => id !== listId));
    } else {
      setSavedListIds((prev) => [...prev, listId]);
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[SaveToListButton] ${isInList ? "Removing" : "Adding"} influencer`,
        { listId, influencerId },
      );
    }

    try {
      const ok = isInList
        ? await removeInfluencerFromList(userId, listId, influencerId)
        : await addInfluencerToList(userId, listId, influencerId);

      if (!ok) {
        // REVERT ON FAILURE
        if (isInList) {
          setSavedListIds((prev) => [...prev, listId]);
        } else {
          setSavedListIds((prev) => prev.filter((id) => id !== listId));
        }
        setLastError(
          isInList ? "Failed to remove from list" : "Failed to add to list",
        );
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development")
        console.error("[SaveToListButton] Unexpected error:", e);

      // REVERT ON EXCEPTION
      if (isInList) {
        setSavedListIds((prev) => [...prev, listId]);
      } else {
        setSavedListIds((prev) => prev.filter((id) => id !== listId));
      }
      setLastError("Unexpected error occurred");
    } finally {
      setLoadingListId(null);
    }
  };

  if (!isLoaded) return null;

  const openOrToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((v) => !v);
  };

  const listPanel = (
    <>
      <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          Save to List
        </p>
        {variant === "icon" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {lastError && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2">
          <AlertCircle size={13} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-500">{lastError}</p>
        </div>
      )}

      <div className="max-h-56 overflow-y-auto">
        {isFetchingLists ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={18} className="animate-spin text-blue-400" />
          </div>
        ) : lists.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <p className="text-sm text-gray-500 mb-1">No lists yet</p>
            <p className="text-xs text-gray-400">
              Create a list from the header first
            </p>
          </div>
        ) : (
          <div className="py-1.5">
            {variant === "icon" && (
              <p className="px-4 pb-2 text-[11px] text-gray-500 leading-snug">
                Added to your newest list if you weren&apos;t on any list yet.
                Tap a list to add or remove.
              </p>
            )}
            {lists.map((list: any) => {
              const isInList = savedListIds.includes(list.id);
              const isLoading = loadingListId === list.id;

              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleToggle(list.id);
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-2.5
                             hover:bg-gray-50 transition-colors text-left
                             disabled:opacity-60"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: list.color ?? "#8B5CF6" }}
                  />
                  <span className="flex-1 text-sm text-gray-800 truncate">
                    {list.name}
                  </span>
                  <span className="text-xs text-gray-400 mr-1">
                    {list.influencer_count}
                  </span>
                  <div
                    className="w-5 h-5 rounded-full flex items-center
                                justify-center shrink-0 transition-all"
                    style={
                      isInList
                        ? { background: list.color ?? "#8B5CF6" }
                        : { border: "1.5px solid #E5E7EB" }
                    }
                  >
                    {isLoading ? (
                      <Loader2
                        size={10}
                        className="animate-spin text-gray-400"
                      />
                    ) : isInList ? (
                      <Check size={11} color="white" strokeWidth={3} />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div
      ref={dropdownRef}
      className={cn("relative", variant === "icon" && "inline-flex", className)}
    >
      {/* Trigger */}
      {variant === "icon" ? (
        <button
          type="button"
          aria-label={
            isSavedToAny
              ? `Saved to ${savedListIds.length} list(s). Choose list`
              : "Save to list"
          }
          title="Save to list"
          onClick={openOrToggle}
          className={cn(
            "rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400/50",
            isSavedToAny
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "bg-green-50 text-green-600 hover:bg-green-100",
          )}
        >
          <Check size={14} strokeWidth={3} />
        </button>
      ) : (
        <button
          type="button"
          onClick={openOrToggle}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            "text-sm font-semibold transition-all duration-200",
            "border focus:outline-none",
            isSavedToAny
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600",
          )}
        >
          <Bookmark size={15} fill={isSavedToAny ? "white" : "none"} />
          <span>
            {isSavedToAny ? `Saved (${savedListIds.length})` : "Save to List"}
          </span>
          <ChevronDown
            size={13}
            className={cn(
              "transition-transform duration-200",
              isOpen && "rotate-180",
              isSavedToAny ? "text-white/70" : "text-gray-400",
            )}
          />
        </button>
      )}

      {/* Centered modal (card quick-save) */}
      {portalReady &&
        variant === "icon" &&
        createPortal(
          <LazyMotion features={domAnimation}>
            <AnimatePresence>
              {isOpen && (
                <m.div
                  key="save-list-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-300 flex items-center justify-center p-4"
                  role="presentation"
                >
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                    aria-label="Close"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  />
                  <m.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="save-to-list-title"
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span id="save-to-list-title" className="sr-only">
                      Save creator to a list
                    </span>
                    {listPanel}
                  </m.div>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>,
          document.body,
        )}

      {/* Anchored dropdown (side panel & default) */}
      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {isOpen && variant === "default" && (
            <m.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 w-64 z-200 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {listPanel}
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
};

export default React.memo(SaveToListButton);
