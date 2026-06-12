import React from "react";
import { ChevronDown } from "lucide-react";
import TokenSearchBar, { SearchMode, SearchToken } from "./TokenSearchBar";

interface SearchSectionProps {
  onSearchChange: (tokens: SearchToken[]) => void;
  onTyping: () => void;
  isTyping?: boolean;
  isLoading?: boolean;
  searchMode?: SearchMode;
}

export const SearchSection = ({ 
  onSearchChange,
  onTyping,
}: SearchSectionProps) => {
  return (
    <div className="mt-5 px-6">
      <div className="flex items-center gap-3">
        <button className="bg-[var(--color-brand-blue)] text-white font-bold text-[13px] w-14 h-10 rounded-lg shadow-sm hover:blue-700 transition-colors flex items-center justify-center">
          10M
        </button>

        <TokenSearchBar
          onSearchChange={onSearchChange}
          onTyping={onTyping}
          className="flex-1 min-h-[44px] shadow-sm bg-[var(--color-bg-input)]"
        />

        <div className="flex items-center gap-2">
          <button className="h-10 px-3.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            Filter platforms
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button className="h-10 px-3.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            More filters
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
