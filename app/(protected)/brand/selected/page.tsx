"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  List,
  Users,
  FolderOpen,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  BookmarkX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBrandLists,
  getInfluencersInList,
  removeInfluencerFromList,
  getBrandListsWithFirstInfluencers,
} from "@/lib/queries/lists.client";
import { normalizeInfluencer } from "@/lib/adapters/normalizeInfluencer";
import { InfluencerResultCard } from "@/components/brand/InfluencerResultCard";
import { InfluencerSidePanel } from "@/components/brand/InfluencerSidePanel";
import { Header } from "@/components/brand/Header";
import type { NormalizedInfluencer } from "@/components/brand/sidepanel/influencer-side-panel.types";

export default function SelectedPage() {
  const { userId, isLoaded } = useSupabaseUser();
  const [lists, setLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [influencers, setInfluencers] = useState<NormalizedInfluencer[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [isLoadingInfluencers, setIsLoadingInfluencers] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  // Side panel state
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<NormalizedInfluencer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch lists and initial influencers in ONE round trip on mount
  useEffect(() => {
    if (!isLoaded || !userId) return;
    setIsLoadingLists(true);

    getBrandListsWithFirstInfluencers(userId)
      .then(({ lists: fetchedLists, firstListInfluencers, firstListId }) => {
        setLists(fetchedLists);
        if (firstListId) {
          setSelectedListId(firstListId);
          const normalized = firstListInfluencers.map(normalizeInfluencer);
          setInfluencers(normalized);
        }
        setIsLoadingLists(false);
      })
      .catch((err) => {
        console.error("Failed to load initial lists:", err);
        setIsLoadingLists(false);
      })
      .finally(() => {
        // Mark initial load as completed so the next useEffect takes over
        setIsInitialLoad(false);
      });
  }, [isLoaded, userId]);

  // Fetch influencers when selected list changes, but ONLY after initial load
  useEffect(() => {
    if (!selectedListId || !userId || isInitialLoad) return;
    setIsLoadingInfluencers(true);
    setSearchQuery("");

    getInfluencersInList(userId, selectedListId)
      .then((rawInfluencers) => {
        const normalized = rawInfluencers.map(normalizeInfluencer);
        setInfluencers(normalized);
      })
      .catch((err) => {
        console.error("Failed to fetch influencers in list:", err);
        setInfluencers([]);
      })
      .finally(() => setIsLoadingInfluencers(false));
  }, [selectedListId, userId, isInitialLoad]);

  const handleRemoveFromList = useCallback(
    async (influencerId: string) => {
      if (!selectedListId || !userId) return;

      // OPTIMISTIC UPDATE: Remove from UI immediately
      const prevInfluencers = influencers;
      setInfluencers((prev) => prev.filter((inf) => inf.id !== influencerId));
      setLists((prev) =>
        prev.map((l) =>
          l.id === selectedListId
            ? { ...l, influencer_count: Math.max(0, l.influencer_count - 1) }
            : l,
        ),
      );

      const ok = await removeInfluencerFromList(
        userId,
        selectedListId,
        influencerId,
      );

      if (!ok) {
        // REVERT ON FAILURE
        setInfluencers(prevInfluencers);
        setLists((prev) =>
          prev.map((l) =>
            l.id === selectedListId
              ? { ...l, influencer_count: l.influencer_count + 1 }
              : l,
          ),
        );
        console.error("Failed to remove influencer — reverted");
      }
    },
    [selectedListId, userId, influencers],
  );

  const selectedList = lists.find((l: any) => l.id === selectedListId);

  const filteredInfluencers = useMemo(() => {
    if (!deferredSearch) return influencers;
    const q = deferredSearch.toLowerCase();
    return influencers.filter(
      (inf) =>
        inf.name.toLowerCase().includes(q) ||
        inf.username.toLowerCase().includes(q) ||
        (inf as any).niches?.some((n: string) => n.toLowerCase().includes(q)),
    );
  }, [influencers, deferredSearch]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1 pt-[52px] pl-14 overflow-hidden">
        {/* ── LEFT SIDEBAR — List picker ───────────────────────── */}
        <div
          className="w-72 flex-shrink-0 bg-white border-r border-gray-100
                        flex flex-col h-[calc(100vh-52px)]"
        >
          {/* Sidebar header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <List size={17} className="text-blue-500" />
              My Lists
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {lists.length} list{lists.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Lists */}
          <div className="flex-1 overflow-y-auto py-2">
            {isLoadingLists ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-blue-300" />
              </div>
            ) : lists.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center
                              py-10 px-4 text-center"
              >
                <FolderOpen size={32} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-500 font-medium mb-1">
                  No lists yet
                </p>
                <p className="text-xs text-gray-400">
                  Create lists from the header and save influencers from
                  Discovery
                </p>
              </div>
            ) : (
              lists.map((list: any) => {
                const isActive = list.id === selectedListId;
                return (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-5 py-3",
                      "transition-all duration-150 text-left group",
                      isActive
                        ? "bg-blue-50 border-r-2 border-blue-500"
                        : "hover:bg-gray-50 border-r-2 border-transparent",
                    )}
                  >
                    {/* Color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: list.color ?? "#8B5CF6" }}
                    />

                    {/* List info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isActive ? "text-blue-700" : "text-gray-700",
                        )}
                      >
                        {list.name}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Users size={10} />
                        {list.influencer_count} influencer
                        {list.influencer_count !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className={cn(
                        "flex-shrink-0 transition-all",
                        isActive ? "text-blue-400" : "text-gray-200",
                      )}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT — Influencers in selected list ──────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Content header */}
          <div
            className="bg-white border-b border-gray-100 px-6 py-4
                          flex items-center justify-between flex-shrink-0"
          >
            <div>
              {selectedList ? (
                <>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: selectedList.color ?? "#8B5CF6" }}
                    />
                    <h1 className="text-lg font-bold text-gray-900">
                      {selectedList.name}
                    </h1>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {influencers.length} influencer
                    {influencers.length !== 1 ? "s" : ""} saved
                  </p>
                </>
              ) : (
                <h1 className="text-lg font-bold text-gray-900">
                  Select a list
                </h1>
              )}
            </div>

            {/* Search within list */}
            {influencers.length > 0 && (
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in list..."
                  className="pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200
                             focus:border-blue-300 focus:ring-2 focus:ring-blue-100
                             outline-none w-52 transition-all"
                />
              </div>
            )}
          </div>

          {/* Influencers grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedListId ? (
              /* No list selected */
              <div
                className="flex flex-col items-center justify-center
                              h-full text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl bg-blue-50
                                flex items-center justify-center mb-4"
                >
                  <List size={28} className="text-blue-300" />
                </div>
                <p className="text-gray-500 font-medium mb-1">
                  Select a list to view influencers
                </p>
                <p className="text-sm text-gray-400">
                  Choose a list from the sidebar
                </p>
              </div>
            ) : isLoadingInfluencers ? (
              /* Loading */
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin text-blue-400" />
              </div>
            ) : filteredInfluencers.length === 0 ? (
              /* Empty list */
              <div
                className="flex flex-col items-center justify-center
                              h-full text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl bg-gray-50
                                flex items-center justify-center mb-4"
                >
                  <BookmarkX size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium mb-1">
                  {searchQuery
                    ? "No results found"
                    : "No influencers in this list"}
                </p>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? "Try a different search"
                    : "Go to Discovery and save influencers to this list"}
                </p>
              </div>
            ) : (
              /* Influencer cards */
              <LazyMotion features={domAnimation}>
                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredInfluencers.map((influencer, i) => (
                      <m.div
                        key={influencer.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="relative group"
                      >
                        {/* Remove from list button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromList(influencer.id);
                          }}
                          disabled={removingId === influencer.id}
                          className="absolute top-3 right-3 z-10
                                     opacity-0 group-hover:opacity-100
                                     flex items-center gap-1.5 px-2.5 py-1.5
                                     rounded-lg bg-white border border-red-200
                                     text-red-400 hover:bg-red-50 hover:text-red-500
                                     text-xs font-medium transition-all duration-150
                                     shadow-sm"
                        >
                          {removingId === influencer.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Trash2 size={11} />
                          )}
                          Remove
                        </button>

                        {/* Existing InfluencerResultCard */}
                        <InfluencerResultCard
                          influencer={influencer}
                          onClick={(inf) => {
                            setSelectedInfluencer(inf as NormalizedInfluencer);
                            setIsPanelOpen(true);
                          }}
                        />
                      </m.div>
                    ))}
                  </AnimatePresence>
                </div>
              </LazyMotion>
            )}
          </div>
        </div>
      </div>

      {/* Influencer Side Panel */}
      <InfluencerSidePanel
        influencer={selectedInfluencer}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
