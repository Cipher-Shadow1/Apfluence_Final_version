'use client'

import { useState } from 'react'
import { X, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  image_url: string | null
  value: number
  description: string | null
  sort_order: number
}

interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  selectedProductIds: string[]
  onSaveSelection: (productId: string) => void
  maxProductValue: number | null
  maxProductCount: number | null
  currentSelectionValue: number
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  products,
  selectedProductIds,
  onSaveSelection,
  maxProductValue,
  maxProductCount,
  currentSelectionValue,
}: ProductSelectionModalProps) {
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  if (!isOpen) return null

  const budgetUsed = formatCents(currentSelectionValue)
  const budgetMax = maxProductValue ? formatCents(maxProductValue) : null
  const budgetDisplay = budgetMax ? `${budgetUsed}/${budgetMax}` : budgetUsed

  const handleSelectProduct = (product: Product) => {
    setViewingProduct(product)
  }

  const handleSaveSelection = () => {
    if (viewingProduct) {
      onSaveSelection(viewingProduct.id)
      setViewingProduct(null)
      onClose()
    }
  }

  const handleBackToList = () => {
    setViewingProduct(null)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4
                          border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              Product selection
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100
                         text-gray-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* VIEW 1 — Product List */}
          {!viewingProduct && (
            <>
              {/* Sub-header */}
              <div className="flex items-center justify-between px-6 py-3
                              border-b border-gray-50 bg-gray-50/50">
                <span className="text-sm font-medium text-gray-600">
                  Select a product
                </span>
                {budgetMax && (
                  <span className="text-sm font-semibold text-[#2b2ef8]">
                    {budgetDisplay}
                  </span>
                )}
              </div>

              {/* Product list */}
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {products.map(product => {
                  const isAlreadySelected = selectedProductIds.includes(product.id)

                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 px-6 py-3
                                 hover:bg-gray-50 transition-colors"
                    >
                      {/* Product image */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden
                                      bg-gray-100 flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center
                                          justify-center">
                            <Package size={16} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCents(product.value)}
                        </p>
                      </div>

                      {/* Select button */}
                      <button
                        onClick={() => handleSelectProduct(product)}
                        className={cn(
                          'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold',
                          'border transition-all duration-150',
                          isAlreadySelected
                            ? 'border-[#2b2ef8] bg-[#eeeeff] text-[#2b2ef8]'
                            : 'border-gray-300 text-gray-600 hover:border-[#2b2ef8] hover:text-[#2b2ef8]'
                        )}
                      >
                        {isAlreadySelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium
                             text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* VIEW 2 — Product Detail */}
          {viewingProduct && (
            <>
              {/* Product detail content */}
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Large image */}
                  <div className="w-52 flex-shrink-0 rounded-xl overflow-hidden
                                  bg-gray-100 flex items-center justify-center
                                  min-h-40">
                    {viewingProduct.image_url ? (
                      <img
                        src={viewingProduct.image_url}
                        alt={viewingProduct.name}
                        className="w-full h-full object-contain max-h-48"
                      />
                    ) : (
                      <Package size={40} className="text-gray-300" />
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-3
                                   leading-snug">
                      {viewingProduct.name}
                    </h3>

                    {/* Price / budget */}
                    <div className="inline-flex items-center px-3 py-1 rounded-lg
                                    bg-gray-100 mb-3">
                      <span className="text-sm font-bold text-gray-800">
                        {formatCents(viewingProduct.value)}
                        {maxProductValue && (
                          <span className="text-gray-500 font-normal">
                            /{formatCents(maxProductValue)}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Options */}
                    <p className="text-sm text-gray-500 mb-4">
                      This product has no option
                    </p>

                    {/* Gift value */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Gift value
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCents(viewingProduct.value)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100
                              flex items-center justify-end gap-3">
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 rounded-xl text-sm font-medium
                             text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSelection}
                  className="px-5 py-2 rounded-xl text-sm font-semibold
                             text-white bg-[#2b2ef8] hover:bg-[#1a1ce8]
                             transition-colors shadow-sm"
                >
                  Save selection
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
