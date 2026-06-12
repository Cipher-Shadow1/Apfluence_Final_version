"use client";

import { Check, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BrandList = {
  id: string;
  name: string;
  color?: string;
  influencer_count: number;
};

export function TargetListSelector({
  lists,
  selectedListId,
  onSelect,
  className,
}: {
  lists: BrandList[];
  selectedListId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3",
          "rounded-xl border text-left transition-all",
          selectedListId === null
            ? "border-[#1a1aff]/40 bg-[#EEF2FF]"
            : "border-gray-200 hover:border-gray-300 bg-white",
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <X size={13} className="text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">No list for now</p>
          <p className="text-xs text-gray-400">Add influencers later</p>
        </div>
        {selectedListId === null && (
          <Check size={15} className="ml-auto text-[#1a1aff]" />
        )}
      </button>

      {lists.map((list) => (
        <button
          key={list.id}
          type="button"
          onClick={() => onSelect(list.id)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3",
            "rounded-xl border text-left transition-all",
            selectedListId === list.id
              ? "border-[#1a1aff]/40 bg-[#EEF2FF]"
              : "border-gray-200 hover:border-gray-300 bg-white",
          )}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: list.color ?? "#6366F1" }}
          >
            {list.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {list.name}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Users size={10} />
              {list.influencer_count} influencer
              {list.influencer_count !== 1 ? "s" : ""}
            </p>
          </div>
          {selectedListId === list.id && (
            <Check size={15} className="ml-auto text-[#1a1aff]" />
          )}
        </button>
      ))}
    </div>
  );
}

