'use client'

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  CheckSquare, Square, GripVertical, ChevronRight,
  Trash2, MoreHorizontal, Package, X,
} from 'lucide-react'
import { LoaderOne as Loader2 } from '@/components/ui/Loader'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────
export interface DataGridColumn {
  key: string
  label: string
  width: number          // in px
  minWidth?: number
  pinned?: 'left'
  render: (ci: any, campaign: any) => React.ReactNode
  /** Extra content rendered at the right side of the header cell (e.g. filter icon) */
  headerExtra?: () => React.ReactNode
}

interface DataGridProps {
  columns: DataGridColumn[]
  rows: any[]
  campaign: any
  selectedIds: Set<string>
  toggleOne: (id: string) => void
  toggleAll: () => void
  allSelected: boolean
  onRemove: (ci: any) => void
  removingId: string | null
  onColumnReorder: (columns: DataGridColumn[]) => void
}

// ─── Column Resize Handle ─────────────────────────────────────────────
function ResizeHandle({ onResize }: { onResize: (delta: number) => void }) {
  const startX = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startX.current = e.clientX

    const handleMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX.current
      startX.current = ev.clientX
      onResize(delta)
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [onResize])

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute right-0 top-0 h-full w-[5px] cursor-col-resize z-10
                 group-hover:bg-indigo-300/40 hover:!bg-indigo-400/60 transition-colors"
    />
  )
}

// ─── Main DataGrid Component ──────────────────────────────────────────
export default function ProDataGrid({
  columns: initialColumns,
  rows,
  campaign,
  selectedIds,
  toggleOne,
  toggleAll,
  allSelected,
  onRemove,
  removingId,
  onColumnReorder,
}: DataGridProps) {
  const [columns, setColumns] = useState(initialColumns)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  // Sync external column changes
  useEffect(() => { setColumns(initialColumns) }, [initialColumns])

  // ── Column resize ──────────────────────────────────────────────────
  const handleResize = useCallback((colKey: string, delta: number) => {
    setColumns(prev =>
      prev.map(c =>
        c.key === colKey
          ? { ...c, width: Math.max(c.minWidth ?? 96, c.width + delta) }
          : c,
      ),
    )
  }, [])

  // ── Drag-and-drop reordering ───────────────────────────────────────
  const pinnedCount = useMemo(() => columns.filter(c => c.pinned === 'left').length, [columns])

  const handleDragStart = useCallback((idx: number) => {
    if (idx < pinnedCount) return
    setDragIdx(idx)
  }, [pinnedCount])

  const handleDragOver = useCallback((idx: number) => {
    if (idx < pinnedCount) return
    setDragOverIdx(idx)
  }, [pinnedCount])

  const handleDrop = useCallback(() => {
    if (dragIdx == null || dragOverIdx == null || dragIdx === dragOverIdx) {
      setDragIdx(null)
      setDragOverIdx(null)
      return
    }
    setColumns(prev => {
      const next = [...prev]
      const [removed] = next.splice(dragIdx, 1)
      next.splice(dragOverIdx, 0, removed)
      onColumnReorder(next)
      return next
    })
    setDragIdx(null)
    setDragOverIdx(null)
  }, [dragIdx, dragOverIdx, onColumnReorder])

  // ── Pinned vs scrollable columns ───────────────────────────────────
  const pinned = useMemo(() => columns.filter(c => c.pinned === 'left'), [columns])
  const scrollable = useMemo(() => columns.filter(c => c.pinned !== 'left'), [columns])
  const checkboxWidth = 56
  const pinnedWidth = useMemo(() => pinned.reduce((s, c) => s + c.width, 0), [pinned])
  const leftOffset = checkboxWidth + pinnedWidth
  // Total table width = checkbox + all columns
  const totalWidth = useMemo(
    () => columns.reduce((s, c) => s + c.width, 0) + checkboxWidth,
    [columns],
  )

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <LazyMotion features={domAnimation}>
      {/*
        Single outer scroll container — both header and body share the same
        horizontal scroll position, so columns never mis-align with their data.
      */}
      <div className="flex flex-col flex-1 min-h-0 overflow-auto select-none">
        {/* ── Inner wrapper keeps header + rows at the same total width ── */}
        <div style={{ minWidth: totalWidth }}>

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex sticky top-0 z-20 bg-white border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">

            {/* Checkbox — frozen */}
            <div
              className="flex items-center justify-center border-r border-gray-100 bg-white shrink-0 z-20"
              style={{ width: checkboxWidth, position: 'sticky', left: 0 }}
            >
              <button onClick={toggleAll} className="hover:text-indigo-600 transition-colors">
                {allSelected
                  ? <CheckSquare size={15} className="text-indigo-600" />
                  : <Square size={15} />}
              </button>
            </div>

            {/* Pinned columns — frozen */}
            {pinned.map((col, i) => (
              <div
                key={col.key}
                className="relative flex items-center px-4 py-3 border-r border-gray-100 bg-white group shrink-0 z-20"
                style={{
                  width: col.width,
                  position: 'sticky',
                  left: checkboxWidth + pinned.slice(0, i).reduce((s, c) => s + c.width, 0),
                }}
              >
                <span className="truncate">{col.label}</span>
                {col.headerExtra && (
                  <div className="ml-auto shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                    {col.headerExtra()}
                  </div>
                )}
                <ResizeHandle onResize={(d) => handleResize(col.key, d)} />
              </div>
            ))}

            {/* Scrollable columns */}
            {scrollable.map((col) => {
              const globalIdx = columns.indexOf(col)
              const isDragging = dragIdx === globalIdx
              const isOver = dragOverIdx === globalIdx
              return (
                <div
                  key={col.key}
                  draggable
                  onDragStart={() => handleDragStart(globalIdx)}
                  onDragOver={(e) => { e.preventDefault(); handleDragOver(globalIdx) }}
                  onDrop={handleDrop}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null) }}
                  className={cn(
                    'relative flex items-center gap-1.5 px-4 py-3 border-r border-gray-100 group shrink-0 cursor-grab active:cursor-grabbing transition-all',
                    isDragging && 'opacity-40',
                    isOver && 'bg-indigo-50',
                  )}
                  style={{ width: col.width }}
                >
                  <GripVertical size={12} className="text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="truncate">{col.label}</span>
                  {col.headerExtra && (
                    <div className="ml-auto shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                      {col.headerExtra()}
                    </div>
                  )}
                  <ResizeHandle onResize={(d) => handleResize(col.key, d)} />
                </div>
              )
            })}
          </div>

          {/* ── Body ────────────────────────────────────────────────── */}
          {rows.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No rows to display
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {rows.map((ci, rowIdx) => {
                const isSelected = selectedIds.has(ci.id)
                return (
                  <m.div
                    key={ci.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: rowIdx * 0.015 }}
                    className={cn(
                      // Explicit opaque background is REQUIRED so sticky pinned cells
                      // cover scrollable cells when the table scrolls horizontally.
                      'flex items-stretch border-b border-gray-50 transition-colors group/row cursor-pointer',
                      isSelected
                        ? 'bg-indigo-50 hover:bg-indigo-100'
                        : 'bg-white hover:bg-gray-50/80',
                    )}
                    onClick={() => toggleOne(ci.id)}
                  >
                    {/* Checkbox — frozen */}
                    <div
                      className="flex items-center justify-center border-r border-gray-50 bg-inherit shrink-0 z-[11]"
                      style={{ width: checkboxWidth, position: 'sticky', left: 0 }}
                      onClick={(e) => { e.stopPropagation(); toggleOne(ci.id) }}
                    >
                      {isSelected
                        ? <CheckSquare size={15} className="text-indigo-600" />
                        : <Square size={15} className="text-gray-300 group-hover/row:text-gray-400 transition-colors" />}
                    </div>

                    {/* Pinned cells — frozen */}
                    {pinned.map((col, i) => (
                      <div
                        key={col.key}
                        className="flex items-center px-4 py-2.5 border-r border-gray-50 bg-inherit shrink-0 min-h-[52px]"
                        style={{
                          width: col.width,
                          position: 'sticky',
                          left: checkboxWidth + pinned.slice(0, i).reduce((s, c) => s + c.width, 0),
                          zIndex: 11,
                        }}
                      >
                        {col.render(ci, campaign)}
                      </div>
                    ))}

                    {/* Shadow divider — sits just after the frozen zone */}
                    <div
                      className="sticky w-0 shrink-0 pointer-events-none"
                      style={{ left: leftOffset, zIndex: 10 }}
                    >
                      <div className="absolute left-0 top-0 h-full w-[6px] bg-gradient-to-r from-black/[0.04] to-transparent" />
                    </div>

                    {/* Scrollable cells — z-index:0 ensures they always render BELOW sticky pinned cells */}
                    {scrollable.map((col) => (
                      <div
                        key={col.key}
                        className="flex items-center px-4 py-2.5 border-r border-gray-50 shrink-0 min-h-[52px]"
                        style={{ width: col.width, zIndex: 0 }}
                      >
                        {col.render(ci, campaign)}
                      </div>
                    ))}
                  </m.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </LazyMotion>
  )
}

// ─── Selected Products Modal ──────────────────────────────────────────
export function SelectedProductsModal({
  isOpen,
  onClose,
  products,
}: {
  isOpen: boolean
  onClose: () => void
  products: any[]
}) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Package size={16} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Selected Products</h3>
                <p className="text-xs text-gray-400">{products.length} product{products.length !== 1 ? 's' : ''} selected</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Product List */}
          <div className="px-6 py-4 space-y-3 max-h-[400px] overflow-y-auto">
            {products.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No products selected</p>
            ) : (
              products.map((product: any, idx: number) => (
                <div key={product.id ?? idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <Package size={18} className="text-indigo-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-400 truncate">{product.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-indigo-600 shrink-0">
                    DZD${((product.value ?? 0) / 100).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
