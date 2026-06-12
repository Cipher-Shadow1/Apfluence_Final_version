"use client";

import React, { useState, useRef, useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  List,
  ChevronDown,
  Plus,
  Trash2,
  Users,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreateListModal from "./CreateListModal";

interface BrandList {
  id: string;
  name: string;
  color: string | null;
  influencer_count: number;
  created_at: string;
}

interface ListsDropdownProps {
  lists: BrandList[];
  authUserId: string;
  onListsChange: (lists: BrandList[]) => void;
}

const ListsDropdown = ({
  lists,
  authUserId,
  onListsChange,
}: ListsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
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
  }, []);

  const handleListCreated = (newList: {
    id: string;
    name: string;
    color: string | null;
  }) => {
    onListsChange([
      { ...newList, influencer_count: 0, created_at: new Date().toISOString() },
      ...lists,
    ]);
  };

  const handleDelete = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    setDeletingId(listId);
    try {
      const { deleteBrandList } = await import("@/lib/queries/lists.client");
      const ok = await deleteBrandList(authUserId, listId);
      if (ok) {
        onListsChange(lists.filter((l) => l.id !== listId));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div ref={dropdownRef} className="relative">
        {/* Trigger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl",
            "text-sm font-medium transition-all duration-200",
            "border focus:outline-none",
            isOpen
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
          )}
        >
          <List size={15} />
          <span>My Lists</span>
          {lists.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-semibold
                             bg-blue-100 text-blue-600"
            >
              {lists.length}
            </span>
          )}
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-200 text-gray-400",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Dropdown panel */}
        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 w-72 z-50
                         bg-white rounded-2xl shadow-xl border border-gray-100
                         overflow-hidden"
            >
              {/* Header */}
              <div
                className="px-4 py-3 border-b border-gray-50
                              flex items-center justify-between"
              >
                <span
                  className="text-xs font-bold text-gray-500
                                 uppercase tracking-wider"
                >
                  Your Lists
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg
                             text-xs font-semibold text-blue-600
                             bg-blue-50 hover:bg-blue-100
                             transition-colors"
                >
                  <Plus size={12} />
                  New List
                </button>
              </div>

              {/* Lists */}
              <div className="max-h-72 overflow-y-auto">
                {lists.length === 0 ? (
                  /* Empty state */
                  <div
                    className="flex flex-col items-center justify-center
                                  py-8 px-4 text-center"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl bg-blue-50
                                    flex items-center justify-center mb-3"
                    >
                      <FolderOpen size={22} className="text-blue-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      No lists yet
                    </p>
                    <p className="text-xs text-gray-400 mb-4 max-w-[180px]">
                      Create your first list to start organizing influencers
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2
                                 rounded-xl text-sm font-semibold
                                 text-white bg-blue-600 hover:bg-blue-700
                                 transition-colors shadow-sm"
                    >
                      <Plus size={14} />
                      Create First List
                    </button>
                  </div>
                ) : (
                  /* List items */
                  <div className="py-1.5">
                    {lists.map((list) => (
                      <div
                        key={list.id}
                        className="flex items-center gap-3 px-4 py-2.5
                                   hover:bg-gray-50 cursor-pointer
                                   transition-colors group"
                      >
                        {/* Color dot */}
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: list.color ?? "#8B5CF6" }}
                        />

                        {/* List info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium text-gray-800
                                        truncate"
                          >
                            {list.name}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Users size={10} />
                            {list.influencer_count} influencer
                            {list.influencer_count !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {/* Delete button (shown on hover) */}
                        <button
                          onClick={(e) => handleDelete(e, list.id)}
                          disabled={deletingId === list.id}
                          className="opacity-0 group-hover:opacity-100
                                     p-1.5 rounded-lg hover:bg-red-50
                                     text-gray-300 hover:text-red-400
                                     transition-all duration-150
                                     focus:outline-none flex-shrink-0"
                        >
                          {deletingId === list.id ? (
                            <div
                              className="w-3.5 h-3.5 border-2
                                            border-red-300/40 border-t-red-400
                                            rounded-full animate-spin"
                            />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {lists.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-50">
                  <p className="text-xs text-gray-400 text-center">
                    Click an influencer in Discovery to add to a list
                  </p>
                </div>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create list modal */}
      <CreateListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleListCreated}
        authUserId={authUserId}
      />
    </LazyMotion>
  );
};

export default React.memo(ListsDropdown);
