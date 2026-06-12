"use client";

import { useState, useRef, useCallback, KeyboardEvent, useEffect } from "react";
import { X, Bookmark, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchMode = "default" | "username" | "niche";

export interface SearchToken {
  mode: SearchMode;
  query: string;
}

export interface TokenSearchBarProps {
  onSearchChange: (tokens: SearchToken[]) => void;
  onTyping: () => void;
  initialValue?: string;
  className?: string;
}

export default function TokenSearchBar({
  onSearchChange,
  onTyping,
  initialValue = "",
  className,
}: TokenSearchBarProps) {
  const [lockedTokens, setLockedTokens] = useState<SearchToken[]>([]);
  const [query, setQuery] = useState(initialValue);
  const [mode, setMode] = useState<SearchMode>("default");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Trigger debounce search ───────────────────────────────────────
  const triggerDebouncedSearch = useCallback(
    (tokensArr: SearchToken[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onSearchChange(tokensArr);
      }, 300);
    },
    [onSearchChange],
  );

  const triggerSearchInstantly = useCallback(
    (tokensArr: SearchToken[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onSearchChange(tokensArr);
    },
    [onSearchChange],
  );

  const removeToken = (index: number) => {
    const newTokens = [...lockedTokens];
    newTokens.splice(index, 1);
    setLockedTokens(newTokens);

    const activeSearchTokens = [...newTokens];
    if (query.trim()) activeSearchTokens.push({ mode, query });
    triggerSearchInstantly(activeSearchTokens);
  };

  // ─── Events ────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    let newMode = mode;

    if (newMode === "default") {
      if (val.startsWith("@")) {
        newMode = "username";
        val = val.slice(1);
      } else if (val.startsWith("#")) {
        newMode = "niche";
        val = val.slice(1);
      }
    }

    setMode(newMode);
    setQuery(val);
    onTyping();

    // Trigger search including existing locked tokens + currently typed string
    triggerDebouncedSearch([
      ...lockedTokens,
      ...(val.trim() ? [{ mode: newMode, query: val }] : []),
    ]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && query === "") {
      if (mode !== "default") {
        setMode("default");
        triggerDebouncedSearch([...lockedTokens]);
      } else if (lockedTokens.length > 0) {
        // Pop the last token if backspace is pressed on empty input
        e.preventDefault();
        const newTokens = [...lockedTokens];
        newTokens.pop();
        setLockedTokens(newTokens);
        triggerSearchInstantly([...newTokens]);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        const newTokens = [...lockedTokens, { mode, query }];
        setLockedTokens(newTokens);
        setQuery("");
        setMode("default");
        triggerSearchInstantly(newTokens);
      } else {
        triggerSearchInstantly(lockedTokens);
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setMode("default");
    setLockedTokens([]);
    triggerSearchInstantly([]);
    inputRef.current?.focus();
  };

  const handleWrapperClick = () => {
    inputRef.current?.focus();
  };

  // ─── Derived UI ───────────────────────────────────────────────────
  let placeholderText = "Search for keywords, #hashtags, or @username...";
  if (mode === "username") placeholderText = "Search by username...";
  if (mode === "niche") placeholderText = "Search by niche...";

  return (
    <div
      onClick={handleWrapperClick}
      className={cn(
        "relative flex items-center gap-2 flex-wrap",
        "min-h-[48px] px-3 py-2 rounded-xl bg-white",
        "border transition-all duration-200 cursor-text",
        isFocused
          ? "border-blue-400 ring-2 ring-blue-100 shadow-sm"
          : "border-gray-200 hover:border-gray-300",
        className,
      )}
    >
      <Search size={16} className="text-gray-400 flex-shrink-0 mr-1" />

      {/* ─── Flexible Input Area ─────────────────────────────────────── */}
      <div className="relative flex-1 min-w-[100px] flex items-center flex-wrap gap-2">
        {/* Render Locked Tokens */}
        {lockedTokens.map((token, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm"
          >
            {token.mode !== "default" && (
              <span
                className={cn(
                  "font-semibold text-sm select-none",
                  token.mode === "username"
                    ? "text-blue-500"
                    : "text-purple-500",
                )}
              >
                {token.mode === "username" ? "@" : "#"}
              </span>
            )}
            <span className="text-sm font-medium text-gray-800">
              {token.query}
            </span>
            <button
              onClick={() => removeToken(index)}
              className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {mode !== "default" ? (
          <div className="flex items-center px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
            <span
              className={cn(
                "font-semibold text-sm select-none mr-1.5",
                mode === "username" ? "text-blue-500" : "text-purple-500",
              )}
            >
              {mode === "username" ? "@" : "#"}
            </span>
            <div className="grid items-center">
              {/* Invisible span for auto-sizing */}
              <span className="invisible col-start-1 row-start-1 col-span-1 whitespace-pre text-sm font-medium px-0.5">
                {query || placeholderText}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholderText}
                className="col-start-1 row-start-1 w-full bg-transparent outline-none border-none text-sm text-gray-800 font-medium caret-blue-500 px-0.5"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholderText}
            className="w-full bg-transparent outline-none border-none text-sm text-gray-800 font-medium caret-blue-500 pl-0"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        )}
      </div>

      {/* ─── Action Buttons ────────────────────────────────────────── */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {(query || mode !== "default" || lockedTokens.length > 0) && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            title="Clear search"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
        <div className="w-[1px] h-5 bg-gray-200 mx-0.5" />
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "p-1.5 rounded-lg text-gray-400 hover:text-blue-500",
            "hover:bg-blue-50 transition-all duration-150 focus:outline-none",
          )}
          title="Save search"
        >
          <Bookmark size={16} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
