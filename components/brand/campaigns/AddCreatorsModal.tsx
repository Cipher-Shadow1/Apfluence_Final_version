'use client'

import { useState, useEffect } from 'react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { X, Users, FolderOpen, Loader2, Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSupabaseUser } from '@/lib/auth/useSupabaseUser'

interface AddCreatorsModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId?: string
  onAdded?: (count: number) => void
  mode?: 'campaign' | 'wizard'
  onPickListId?: (listId: string) => void
}

export default function AddCreatorsModal({
  isOpen,
  onClose,
  campaignId,
  onAdded,
  mode = 'campaign',
  onPickListId,
}: AddCreatorsModalProps) {
  const { userId } = useSupabaseUser()
  const authUserId = userId ?? ''

  const [lists, setLists] = useState<any[]>([])
  const [isLoadingLists, setIsLoadingLists] = useState(false)
  const [addingListId, setAddingListId] = useState<string | null>(null)
  const [addedListIds, setAddedListIds] = useState<string[]>([])
  const [lastResult, setLastResult] = useState<{ added: number; skipped: number } | null>(null)

  useEffect(() => {
    if (!isOpen || !authUserId) return
    setIsLoadingLists(true)
    setAddedListIds([])
    setLastResult(null)

    import('@/lib/queries/lists.client')
      .then((mod) => mod.getBrandLists(authUserId))
      .then((data) => setLists(data ?? []))
      .finally(() => setIsLoadingLists(false))
  }, [isOpen, authUserId])

  const handleAddList = async (listId: string) => {
    if (mode === 'wizard') {
      onPickListId?.(listId)
      onClose()
      return
    }

    if (!campaignId) return
    setAddingListId(listId)
    setLastResult(null)
    try {
      const { addListInfluencersToCampaign } = await import('@/lib/queries/campaigns')
      const result = await addListInfluencersToCampaign(campaignId, listId)
      setLastResult(result)
      setAddedListIds((prev) => [...prev, listId])
      onAdded?.(result.added)
    } finally {
      setAddingListId(null)
    }
  }

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <m.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Users size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {mode === 'wizard' ? 'Pick a List' : 'Add Creators'}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {mode === 'wizard'
                          ? 'Choose a list to attach to this campaign draft'
                          : 'Select a list to import creators'}
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Result banner */}
                <AnimatePresence>
                  {mode !== 'wizard' && lastResult && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2"
                    >
                      <Check size={14} className="text-green-500 shrink-0" />
                      <p className="text-xs font-medium text-green-700">
                        Added {lastResult.added} creator{lastResult.added !== 1 ? 's' : ''}
                        {lastResult.skipped > 0 ? ` (${lastResult.skipped} already in campaign)` : ''}
                      </p>
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Lists */}
                <div className="max-h-80 overflow-y-auto py-2">
                  {isLoadingLists ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 size={20} className="animate-spin text-indigo-400" />
                    </div>
                  ) : lists.length === 0 ? (
                    <div className="flex flex-col items-center py-10 px-6 text-center">
                      <FolderOpen size={32} className="text-gray-200 mb-3" />
                      <p className="text-sm font-medium text-gray-600 mb-1">No lists yet</p>
                      <p className="text-xs text-gray-400">Create lists in Discovery first, then come back</p>
                    </div>
                  ) : (
                    lists.map((list) => {
                      const isAdded = addedListIds.includes(list.id)
                      const isAdding = addingListId === list.id
                      const count = list.influencer_count ?? null

                      return (
                        <button
                          key={list.id}
                          onClick={() => !isAdded && !isAdding && handleAddList(list.id)}
                          disabled={isAdding || isAdded}
                          className={cn(
                            'w-full group flex items-center gap-4 px-6 py-4 text-left transition-all',
                            isAdded ? 'bg-green-50 opacity-75 cursor-default' : 'hover:bg-indigo-50 cursor-pointer',
                          )}
                        >
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: list.color ?? '#6366F1' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{list.name}</p>
                            {count !== null && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <Users size={10} />
                                {count} influencer{count !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          {isAdding ? (
                            <Loader2 size={16} className="animate-spin text-indigo-400 shrink-0" />
                          ) : isAdded ? (
                            <div className="flex items-center gap-1.5 text-green-600 shrink-0">
                              <Check size={14} />
                              <span className="text-xs font-medium">Added</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-indigo-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus size={14} />
                              <span className="text-xs font-medium">Add</span>
                            </div>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
