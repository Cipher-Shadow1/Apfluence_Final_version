'use client'

import { useState } from 'react'
import { Search, ChevronUp, ChevronDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MergeField {
  token: string        // e.g. "{{influencer_name}}"
  label: string        // e.g. "Influencer Name"
  category: string     // e.g. "Most Used"
}

const MERGE_FIELDS: MergeField[] = [
  // Most Used
  { token: '{{influencer_name}}', label: 'Influencer Name',   category: 'Most Used' },
  { token: '{{first_name}}',      label: 'First Name',        category: 'Most Used' },
  { token: '{{promo_code}}',      label: 'Promo Code',        category: 'Most Used' },
  { token: '{{affiliate_link}}',  label: 'Affiliate Link',    category: 'Most Used' },
  { token: '{{application_link}}',label: 'Application Link',  category: 'Most Used' },
  { token: '{{draft_link}}',       label: 'Draft upload link', category: 'Most Used' },

  // Influencer Profile
  { token: '{{username}}',        label: 'Username',          category: 'Influencer Profile' },
  { token: '{{email}}',           label: 'Email Address',     category: 'Influencer Profile' },
  { token: '{{location}}',        label: 'Location',          category: 'Influencer Profile' },
  { token: '{{bio}}',             label: 'Bio',               category: 'Influencer Profile' },
  { token: '{{niche}}',           label: 'Primary Niche',     category: 'Influencer Profile' },

  // Social Media
  { token: '{{instagram_handle}}',label: 'Instagram Handle',  category: 'Social Media' },
  { token: '{{tiktok_handle}}',   label: 'TikTok Handle',     category: 'Social Media' },
  { token: '{{youtube_handle}}',  label: 'YouTube Handle',    category: 'Social Media' },
  { token: '{{followers_count}}', label: 'Followers Count',   category: 'Social Media' },
  { token: '{{engagement_rate}}', label: 'Engagement Rate',   category: 'Social Media' },
]

const CATEGORIES = ['Most Used', 'Influencer Profile', 'Social Media']

interface MergeFieldsPanelProps {
  onInsert: (token: string) => void
}

export default function MergeFieldsPanel({ onInsert }: MergeFieldsPanelProps) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  const filtered = MERGE_FIELDS.filter(f =>
    !search ||
    f.label.toLowerCase().includes(search.toLowerCase()) ||
    f.token.toLowerCase().includes(search.toLowerCase())
  )

  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filtered.filter(f => f.category === cat)
    return acc
  }, {} as Record<string, MergeField[]>)

  return (
    <div className="w-72 flex-shrink-0 bg-white border-l border-gray-100
                    flex flex-col h-full overflow-hidden">

      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-indigo-100 flex items-center
                        justify-center flex-shrink-0">
          <span className="text-indigo-600 text-xs font-bold">{'{}'}</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900">Insert Merge Fields</h3>
        <button className="ml-auto text-gray-300 hover:text-gray-500 transition-colors">
          <Info size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fields..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border
                       border-gray-200 outline-none transition-all
                       placeholder:text-gray-300
                       focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
          />
        </div>
      </div>

      {/* Fields list */}
      <div className="flex-1 overflow-y-auto py-2">
        {CATEGORIES.map(category => {
          const fields = groupedByCategory[category] ?? []
          if (fields.length === 0) return null
          const isCollapsed = collapsed[category]

          return (
            <div key={category} className="mb-1">

              {/* Category header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between
                           px-5 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-700">
                  {category}
                </span>
                {isCollapsed
                  ? <ChevronDown size={13} className="text-gray-400" />
                  : <ChevronUp size={13} className="text-gray-400" />
                }
              </button>

              {/* Fields */}
              {!isCollapsed && (
                <div className="px-3 pb-2">
                  {fields.map(field => (
                    <button
                      key={field.token}
                      onClick={() => onInsert(field.token)}
                      className="w-full flex items-center gap-2 px-3 py-2
                                 rounded-lg hover:bg-indigo-50 text-left
                                 transition-colors group"
                    >
                      <span className="text-xs font-mono font-semibold
                                       text-indigo-600 group-hover:text-indigo-700
                                       min-w-0 truncate flex-shrink-0 max-w-[160px]">
                        {field.token}
                      </span>
                      <span className="text-gray-300 text-xs flex-shrink-0">—</span>
                      <span className="text-xs text-gray-500 truncate">
                        {field.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
