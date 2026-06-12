"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/brand/Header";
import { SearchSection } from "@/components/brand/SearchSection";
import { TrendingSearches } from "@/components/brand/TrendingSearches";
import { ImportSection } from "@/components/brand/ImportSection";
import { InfluencerResultCard } from "@/components/brand/InfluencerResultCard";
import InfluencerResultCardSkeleton from "@/components/brand/InfluencerResultCardSkeleton";
import { InfluencerSidePanel } from "@/components/brand/InfluencerSidePanel";
import { getAllInfluencers, searchByTokens } from "@/lib/queries/influencers";
import { type NormalizedInfluencer } from "@/components/brand/sidepanel/influencer-side-panel.types";
import { SearchMode, SearchToken } from "@/components/brand/TokenSearchBar";
import { Loader2 } from "lucide-react";

export function BrandHomeClient({ firstName }: { firstName: string }) {
  const [selectedInfluencer, setSelectedInfluencer] = useState<NormalizedInfluencer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [influencers, setInfluencers] = useState<NormalizedInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time search state
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTokens, setCurrentTokens] = useState<SearchToken[]>([]);

  useEffect(() => {
    getAllInfluencers().then(data => {
      setInfluencers(data);
      setLoading(false);
    });
  }, []);

  const handleTyping = useCallback(() => {
    setIsTyping(true);
  }, []);

  const handleSearchChange = useCallback(async (tokens: SearchToken[]) => {
    setCurrentTokens(tokens);
    setIsLoading(true);
    setIsTyping(false);
    
    try {
      const results = await searchByTokens(tokens);
      setInfluencers(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSearch = () => {
    handleSearchChange([]);
  };

  /** True while the user is actively searching (typing or waiting for results / has tokens). */
  const searchActive = currentTokens.length > 0 || isTyping || isLoading;
  /** Show creator cards whenever we have data (even before first search) so discovery is not an empty page. */
  const showCreatorGrid = !loading && influencers.length > 0;

  // Determine the primary mode for the animated typing label
  const primaryMode = currentTokens.length > 0 ? currentTokens[currentTokens.length - 1].mode : "default";

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <main className="pl-0 pt-[52px] w-full flex-1 overflow-x-hidden">
        <div className="px-6 pt-5">
          <p className="text-sm font-medium text-gray-600">
            Welcome back, {firstName}
          </p>
        </div>
        
        <SearchSection 
          onSearchChange={handleSearchChange} 
          onTyping={handleTyping}
          isTyping={isTyping}
          isLoading={isLoading}
          searchMode={primaryMode}
        />

        {showCreatorGrid ? (
          <div className="px-6 py-8 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">
                  {searchActive ? "Search results" : "Creators"}{" "}
                  {!isTyping && !isLoading && `(${influencers.length})`}
                </h2>

                {(isTyping || isLoading) && (
                  <span className="text-xs text-blue-400 font-medium animate-pulse">
                    {primaryMode === "username"
                      ? "Searching by username..."
                      : primaryMode === "niche"
                        ? "Searching by niche..."
                        : "Searching..."}
                  </span>
                )}
              </div>
              {searchActive && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {isTyping || isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <InfluencerResultCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {influencers.map((influencer) => (
                  <InfluencerResultCard
                    key={influencer.id}
                    influencer={influencer}
                    onClick={(creator) => {
                      setSelectedInfluencer(creator as any);
                      setIsPanelOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            {searchActive && !isTyping && !isLoading && influencers.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-12 h-12 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <p className="font-semibold text-lg text-gray-900">No influencers found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {currentTokens.length > 1
                    ? "No creators match all of your filters together"
                    : currentTokens.length === 1 && currentTokens[0].mode === "username"
                      ? `No creator with handle matching '@${currentTokens[0].query}'`
                      : currentTokens.length === 1 && currentTokens[0].mode === "niche"
                        ? `No creators in the '#${currentTokens[0].query}' niche`
                        : "Try a different search term"}
                </p>
              </div>
            )}
          </div>
        ) : !loading ? (
          <p className="px-6 py-8 text-sm text-gray-500">No creators in the database yet.</p>
        ) : null}

        {!searchActive && !loading && (
          <>
            <TrendingSearches />
            <ImportSection />
          </>
        )}
      </main>
      <InfluencerSidePanel
        influencer={selectedInfluencer}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
