'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  FilePen,
  Mail,
  Package,
  Plus,
  Search,
  Send,
  Star,
  Tag,
  Trash2,
  Truck,
  Users,
  CreditCard,
} from 'lucide-react'
import { LoaderOne as Loader2 } from '@/components/ui/Loader'
import { cn } from '@/lib/utils'
import {
  getCampaignById,
  removeInfluencerFromCampaign,
  updateCampaignInfluencerOffer,
  updateCampaignInfluencerStatus,
} from '@/lib/queries/campaigns'
import { sendOutreachEmail } from '@/lib/queries/smtp'
import AddCreatorsModal from '@/components/brand/campaigns/AddCreatorsModal'
import BulkEmailPanel from '@/components/brand/campaigns/BulkEmailPanel'
import ProDataGrid, {
  SelectedProductsModal,
  type DataGridColumn,
} from '@/components/brand/campaigns/ProDataGrid'
import { InfluencerSidePanel } from '@/components/brand/InfluencerSidePanel'
import { createClient } from '@/lib/supabase/client'
import { normalizeInfluencer } from '@/lib/adapters/normalizeInfluencer'
import { useSupabaseUser } from '@/lib/auth/useSupabaseUser'

const PIPELINE_STAGES = [
  { key: 'form_sent', label: 'Form Sent' },
  { key: 'accepted', label: 'Influencer Responded' },
  { key: 'shipped', label: 'Product Sent' },
  { key: 'drafted', label: 'Draft review' },
  { key: 'published', label: 'Published' },
  { key: 'paid', label: 'Paid' },
]

const STATUS_ORDER = ['accepted', 'shipped', 'drafted', 'published', 'paid'] as const

const STATUS_LABELS: Record<string, string> = {
  accepted: 'Influencer Responded',
  shipped: 'Product Sent',
  drafted: 'Draft review',
  published: 'Published',
  paid: 'Paid',
}

function hasShippingAddress(ci: any): boolean {
  return Boolean(String(ci?.shipping_address ?? '').trim())
}

/** Forward: skip optional draft (shipped → published). Never advance published → paid manually. */
function getNextPipelineStatus(ci: any): string | null {
  const s = String(ci?.status ?? '')
  if (s === 'published' || s === 'paid') return null
  if (s === 'shipped') return 'published'
  const idx = STATUS_ORDER.indexOf(s as (typeof STATUS_ORDER)[number])
  if (idx === -1 || idx >= STATUS_ORDER.length - 1) return null
  return STATUS_ORDER[idx + 1]
}

/** Back from published: drafted if they submitted a draft, else shipped (draft was skipped). */
function getPrevPipelineStatus(ci: any): string | null {
  const s = String(ci?.status ?? '')
  if (s === 'accepted' || s === 'paid') return null
  if (s === 'published') {
    const hasDrafts = Array.isArray(ci?.draft_submissions) && ci.draft_submissions.length > 0
    return hasDrafts ? 'drafted' : 'shipped'
  }
  const idx = STATUS_ORDER.indexOf(s as (typeof STATUS_ORDER)[number])
  if (idx <= 0) return null
  return STATUS_ORDER[idx - 1]
}

/** Nested `campaign_payouts` from getCampaignById (object or single-element array). */
function getCampaignPayout(ci: any): { id: string; status: string; amount?: number; created_at?: string } | null {
  const raw = ci?.campaign_payouts
  if (raw == null) return null
  const row = Array.isArray(raw) ? raw[0] : raw
  if (!row?.id) return null
  return row
}

const PAYOUT_LOCK_STATUSES = new Set(['pending', 'processing', 'sent', 'paid'])

/** Hide stage arrows: row is paid or a payout is in progress (not rejected). */
function isStageNavLocked(ci: any): boolean {
  if (ci?.status === 'paid') return true
  const p = getCampaignPayout(ci)
  if (!p?.status || p.status === 'rejected') return false
  return PAYOUT_LOCK_STATUSES.has(p.status)
}

const CI_STATUS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Ready to invite', color: 'text-gray-500', bg: 'bg-gray-100', icon: Mail },
  email_sent: { label: 'Email sent', color: 'text-blue-600', bg: 'bg-blue-50', icon: Send },
  viewed: { label: 'Viewed', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: CheckCircle2 },
  accepted: { label: 'Influencer Responded', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  shipped: { label: 'Product sent', color: 'text-orange-600', bg: 'bg-orange-50', icon: Truck },
  drafted: { label: 'Draft review', color: 'text-purple-600', bg: 'bg-purple-50', icon: FilePen },
  published: { label: 'Published', color: 'text-cyan-600', bg: 'bg-cyan-50', icon: Eye },
  paid: { label: 'Paid', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: DollarSign },
  declined: { label: 'Declined', color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle },
  no_response: { label: 'No response', color: 'text-gray-400', bg: 'bg-gray-50', icon: AlertCircle },
}

function formatPrice(cents: number | null, currencyCode: string = 'USD') {
  if (cents == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function CampaignDetailPage() {
  const { userId } = useSupabaseUser()
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const [isEmailPanelOpen, setIsEmailPanelOpen] = useState(false)
  const [emailPanelSubject, setEmailPanelSubject] = useState('')
  const [emailPanelBody, setEmailPanelBody] = useState('')
  const [emailPanelTitle, setEmailPanelTitle] = useState('Send Email')
  const [emailPanelSubtitle, setEmailPanelSubtitle] = useState('')
  const [emailPanelTargets, setEmailPanelTargets] = useState<any[]>([])
  const [pendingStatusAfterSend, setPendingStatusAfterSend] = useState<string | null>(null)

  const [brandName, setBrandName] = useState('Our Brand')
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [offerInput, setOfferInput] = useState('')
  const [isSavingOffers, setIsSavingOffers] = useState(false)

  const [sidePanelInfluencer, setSidePanelInfluencer] = useState<any | null>(null)
  const [sidePanelCi, setSidePanelCi] = useState<any | null>(null)

  const [productModalOpen, setProductModalOpen] = useState(false)
  const [productModalItems, setProductModalItems] = useState<any[]>([])
  const [gridColumns, setGridColumns] = useState<DataGridColumn[]>([])
  const [pageActionError, setPageActionError] = useState<string | null>(null)

  const loadCampaign = useCallback(async () => {
    setIsLoading(true)
    const data = await getCampaignById(campaignId)
    setCampaign(data)
    setIsLoading(false)
  }, [campaignId])

  useEffect(() => {
    loadCampaign()
  }, [loadCampaign])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((res: any) => {
      if (!res.data?.user) return
      supabase
        .from('brands')
        .select('company_name')
        .eq('auth_user_id', res.data.user.id)
        .single()
        .then((profileRes: any) => {
          if (profileRes.data) setBrandName(profileRes.data.company_name ?? 'Our Brand')
        })
    })
  }, [])

  const campaignInfluencers: any[] = campaign?.campaign_influencers ?? []
  const totalInfluencers = campaignInfluencers.length
  const campaignProducts: any[] = campaign?.campaign_products ?? []

  const filteredInfluencers = useMemo(() => {
    if (!searchQuery.trim()) return campaignInfluencers
    const q = searchQuery.toLowerCase()
    return campaignInfluencers.filter((ci: any) => {
      const inf = ci.influencers
      return (
        inf?.name?.toLowerCase().includes(q) ||
        inf?.username?.toLowerCase().includes(q) ||
        inf?.email?.toLowerCase().includes(q)
      )
    })
  }, [campaignInfluencers, searchQuery])

  const pendingCampaignPayouts = useMemo(() => {
    return campaignInfluencers.filter((ci: any) => {
      const p = getCampaignPayout(ci)
      return p && (p.status === 'pending' || p.status === 'processing')
    })
  }, [campaignInfluencers])

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const order = ['form_sent', 'accepted', 'shipped', 'drafted', 'published', 'paid']
    PIPELINE_STAGES.forEach((s) => (counts[s.key] = 0))
    campaignInfluencers.forEach((ci: any) => {
      const status = ci.status ?? ''
      const applyStatus = ci.apply_status ?? ''
      let key = status
      if (['pending', 'email_sent', 'viewed'].includes(status)) key = 'form_sent'
      if (
        ['accepted', 'declined', 'countered'].includes(applyStatus) &&
        ['pending', 'email_sent', 'viewed', 'form_sent'].includes(key)
      ) {
        key = 'accepted'
      }
      const idx = order.indexOf(key)
      order.forEach((stage, i) => {
        if (i <= idx && stage in counts) counts[stage]++
      })
    })
    return counts
  }, [campaignInfluencers])

  const allSelected = selectedIds.size === filteredInfluencers.length && filteredInfluencers.length > 0
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredInfluencers.map((ci: any) => ci.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleStatusChange = useCallback(async (ciId: string, newStatus: string) => {
    const ok = await updateCampaignInfluencerStatus(ciId, newStatus)
    if (!ok) return
    setCampaign((prev: any) => ({
      ...prev,
      campaign_influencers: prev.campaign_influencers.map((ci: any) =>
        ci.id === ciId ? { ...ci, status: newStatus } : ci,
      ),
    }))
  }, [])

  const moveStatus = useCallback(async (ci: any, direction: -1 | 1) => {
    if (isStageNavLocked(ci)) return
    const next =
      direction === 1 ? getNextPipelineStatus(ci) : getPrevPipelineStatus(ci)
    if (!next) return
    await handleStatusChange(ci.id, next)
  }, [handleStatusChange])

  const goToPayments = useCallback(() => {
    router.push(`/brand/payments?campaign=${encodeURIComponent(campaignId)}`)
  }, [campaignId, router])

  const requestCreatorPayout = useCallback(async (ci: any) => {
    setPageActionError(null)
    const res = await fetch(`/api/wallet/campaigns/${campaignId}/request`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ campaign_influencer_id: ci.id }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      setPageActionError(typeof payload?.error === 'string' ? payload.error : 'Could not request payout')
      return
    }
    await loadCampaign()
    router.push(`/brand/payments?campaign=${encodeURIComponent(campaignId)}`)
  }, [campaignId, loadCampaign, router])

  const getStatusTargets = useCallback((ci: any) => {
    if (selectedIds.size > 1 && selectedIds.has(ci.id)) {
      return filteredInfluencers.filter((row: any) => selectedIds.has(row.id) && row.status === ci.status)
    }
    return [ci]
  }, [filteredInfluencers, selectedIds])

  const openCampaignPanel = useCallback((ci: any) => {
    const inf = ci?.influencers
    if (!inf) return
    setSidePanelInfluencer(normalizeInfluencer(inf as any))
    setSidePanelCi(ci)
  }, [])

  const openProductModal = useCallback((productIds: string[]) => {
    const items = campaignProducts.filter((p: any) => productIds.includes(p.id))
    setProductModalItems(items)
    setProductModalOpen(true)
  }, [campaignProducts])

  const buildStepEmailTemplate = useCallback(
    (status: string, ci?: any) => {
      if (status === 'accepted') {
        if (hasShippingAddress(ci)) {
          return {
            title: 'Send product shipped email',
            cta: 'confirm product shipped',
            toStatus: 'shipped' as const,
            subject: `Your {{campaign_name}} package is on the way`,
            body: `<p>Hi <b>{{first_name}}</b>,</p><p>Thank you for sharing your shipping details. We have sent your package for <b>{{campaign_name}}</b> — it should be with you soon.</p><p>Best,<br/>${brandName}</p>`,
          }
        }
        return {
          title: 'Send approval email',
          cta: 'send approval',
          subject: `You are officially selected for {{campaign_name}}`,
          body: `<p>Hi <b>{{first_name}}</b>,</p><p>Great news: your profile is officially approved for <b>{{campaign_name}}</b>.</p><p>Please complete the next steps in your application (including shipping details if we are sending a product).</p><p>Best,<br/>${brandName}</p>`,
        }
      }
      const map: Record<
        string,
        { title: string; cta: string; subject: string; body: string; toStatus?: string }
      > = {
        shipped: {
          title: 'Send draft upload link',
          cta: 'send draft link email',
          subject: `Submit your draft for {{campaign_name}}`,
          body: `<p>Hi <b>{{first_name}}</b>,</p><p>Please upload your creative draft for <b>{{campaign_name}}</b> using your personal link (no login required):</p><p><a href="{{draft_link}}" style="color:#1a1aff;font-weight:600">Open draft upload page</a></p><p style="font-size:12px;color:#666">If the link does not work, copy and paste: {{draft_link}}</p><p>Best,<br/>${brandName}</p>`,
        },
        drafted: { title: 'Review submitted draft(s)', cta: 'review draft', subject: '', body: '' },
        published: {
          title: 'Send publish request email',
          cta: 'request publication',
          toStatus: '',
          subject: `Time to publish {{campaign_name}}`,
          body: `<p>Hi <b>{{first_name}}</b>,</p><p>Your content for <b>{{campaign_name}}</b> is ready to go live. Please publish on the agreed channel and let us know when it is live.</p><p>Best,<br/>${brandName}</p>`,
        },
      }
      return map[status] ?? null
    },
    [brandName],
  )

  const openStepEmailPanel = useCallback(
    (ci: any) => {
      let targets = getStatusTargets(ci)
      if (ci.status === 'accepted') {
        const ship = hasShippingAddress(ci)
        targets = targets.filter((t: any) => hasShippingAddress(t) === ship)
        if (!targets.length) return
      }
      const cfg = buildStepEmailTemplate(ci.status, ci)
      if (!cfg) return
      setEmailPanelTargets(targets)
      setEmailPanelSubject(cfg.subject)
      setEmailPanelBody(cfg.body)
      setEmailPanelTitle(cfg.title)
      setEmailPanelSubtitle(`${targets.length} influencer${targets.length !== 1 ? 's' : ''} selected — ${cfg.cta}`)
      setPendingStatusAfterSend(cfg.toStatus ?? null)
      setIsEmailPanelOpen(true)
    },
    [buildStepEmailTemplate, getStatusTargets],
  )

  const openOfferForCreator = useCallback(
    (ci: any) => {
      setSelectedIds(new Set([ci.id]))
      const baseAmount = campaign?.flat_amount != null ? campaign.flat_amount / 100 : 0
      setOfferInput(baseAmount ? String(baseAmount) : '')
      setIsOfferModalOpen(true)
    },
    [campaign?.flat_amount],
  )

  const defaultColumns: DataGridColumn[] = useMemo(() => [
    {
      key: 'profile_name',
      label: 'Profile Name',
      width: 260,
      minWidth: 220,
      pinned: 'left' as const,
      render: (ci: any) => {
        const inf = ci.influencers
        return (
          <button type="button" onClick={(e) => { e.stopPropagation(); openCampaignPanel(ci) }} className="flex items-center gap-3 min-w-0 text-left">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-gray-100">
              {inf?.avatar_url ? (
                <img src={inf.avatar_url} alt={inf?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#2b2ef8]">{inf?.name?.slice(0, 2).toUpperCase() ?? '??'}</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{inf?.name ?? 'Unknown'}</p>
              <p className="text-xs text-gray-400 truncate">@{inf?.username ?? ''}</p>
            </div>
          </button>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: 220,
      minWidth: 180,
      render: (ci: any) => {
        const cfg = CI_STATUS[ci.status] ?? CI_STATUS.pending
        const Icon = cfg.icon
        const locked = isStageNavLocked(ci)
        const payout = getCampaignPayout(ci)
        const prevSt = getPrevPipelineStatus(ci)
        const nextSt = getNextPipelineStatus(ci)
        const hasPrev = !locked && prevSt !== null
        const hasNext = !locked && nextSt !== null
        const payoutHint =
          payout && (payout.status === 'pending' || payout.status === 'processing')
            ? 'Payout requested — complete in Payments'
            : payout && payout.status === 'sent'
              ? 'Payout sent to creator'
              : null
        return (
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2">
              {!locked ? (
                <button type="button" onClick={(e) => { e.stopPropagation(); if (hasPrev) moveStatus(ci, -1) }} disabled={!hasPrev} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 flex items-center justify-center shrink-0">
                  <ChevronLeft size={14} />
                </button>
              ) : null}
              <div className="flex items-center gap-2 min-w-0 shrink-0">
                <Icon size={14} className={cn('shrink-0', cfg.color)} />
                <span className={cn('text-xs font-medium text-[#2b2ef8] leading-tight')}>
                  {STATUS_LABELS[ci.status] ?? cfg.label}
                </span>
              </div>
              {!locked ? (
                <button type="button" onClick={(e) => { e.stopPropagation(); if (hasNext) moveStatus(ci, 1) }} disabled={!hasNext} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 flex items-center justify-center shrink-0">
                  <ChevronRight size={14} />
                </button>
              ) : null}
            </div>
            {payoutHint ? (
              <p className="text-[10px] text-amber-800 font-medium leading-snug max-w-[210px]">{payoutHint}</p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'your_offer',
      label: 'Your Offer',
      width: 130,
      minWidth: 110,
      render: (ci: any, c: any) => (
        <div className="text-sm font-semibold text-gray-800">
          {ci.custom_flat_amount != null ? formatPrice(ci.custom_flat_amount, c?.currency) : c?.flat_amount ? formatPrice(c.flat_amount, c?.currency) : '—'}
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      width: 140,
      minWidth: 120,
      render: (ci: any) => {
        const inf = ci.influencers
        const parsed = (() => {
          const raw: string = ci.shipping_address ?? ''
          const parts = raw.split(', ')
          return parts.length >= 2 ? parts[1] : null
        })()
        return <span className="text-sm text-gray-600">{inf?.phone ?? parsed ?? '—'}</span>
      },
    },
    {
      key: 'address_line',
      label: 'Address line',
      width: 210,
      minWidth: 170,
      render: (ci: any) => {
        const inf = ci.influencers
        const parsed = (() => {
          const raw: string = ci.shipping_address ?? ''
          const parts = raw.split(', ')
          return parts[2] ?? null
        })()
        return <span className="text-sm text-gray-600 truncate">{inf?.billing_address_line1 ?? parsed ?? 'Not provided'}</span>
      },
    },
    {
      key: 'product_gifting',
      label: 'Product',
      width: 150,
      minWidth: 120,
      render: (ci: any) => {
        const ids: string[] = Array.isArray(ci.selected_product_ids) ? ci.selected_product_ids : []
        if (!ids.length) return <span className="text-xs text-gray-300 italic">None</span>
        return (
          <button type="button" onClick={(e) => { e.stopPropagation(); openProductModal(ids) }} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Package size={12} />
            {ids.length} selected
          </button>
        )
      },
    },
    {
      key: 'action',
      label: 'Action',
      width: 180,
      minWidth: 160,
      render: (ci: any) => {
        if (ci.status === 'paid') {
          return <span className="text-xs text-emerald-600 font-semibold">Completed</span>
        }

        if (ci.status === 'published') {
          const p = getCampaignPayout(ci)
          const st = p?.status
          if (st === 'pending' || st === 'processing') {
            return (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goToPayments() }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold text-[#2b2ef8] border-[#2b2ef8]/35 bg-[#f5f6ff]"
              >
                <CreditCard size={13} />
                Open Payments
              </button>
            )
          }
          if (st === 'sent') {
            return <span className="text-xs text-blue-700 font-semibold">Payout sent</span>
          }
          if (st === 'paid') {
            return <span className="text-xs text-emerald-600 font-semibold">Paid out</span>
          }
          const offerCents = Number(ci.custom_flat_amount ?? campaign?.flat_amount ?? 0)
          const canReq = Number.isFinite(offerCents) && offerCents > 0
          if (!canReq) {
            return (
              <div className="flex flex-col gap-1.5 min-w-0 max-w-[200px]">
                <span className="text-[11px] text-amber-800 leading-snug">Set a campaign default or custom offer to request payout.</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openOfferForCreator(ci) }}
                  className="self-start text-xs font-semibold text-[#2b2ef8] hover:underline"
                >
                  Set offer
                </button>
              </div>
            )
          }
          return (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); void requestCreatorPayout(ci) }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold text-emerald-700 border-emerald-300 bg-emerald-50"
            >
              <DollarSign size={13} />
              Request payout
            </button>
          )
        }

        const actionByStatus: Record<string, { label: string; icon: any; className: string }> = {
          accepted: {
            label: hasShippingAddress(ci) ? 'Send product shipped' : 'Send approval',
            icon: hasShippingAddress(ci) ? Truck : Star,
            className: 'text-[#E17842] border-[#E17842]/40 bg-[#FFF5EF]',
          },
          shipped: { label: 'Send draft link', icon: Send, className: 'text-[#1a1aff] border-[#1a1aff]/35 bg-[#f5f6ff]' },
          drafted: { label: 'Review draft', icon: Eye, className: 'text-[#17A9BC] border-[#17A9BC]/45 bg-[#EEFBFD]' },
        }
        const cfg = actionByStatus[ci.status]
        if (!cfg) return <span className="text-xs text-gray-300 italic">No action</span>
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (ci.status === 'drafted') return openCampaignPanel(ci)
              openStepEmailPanel(ci)
            }}
            className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold', cfg.className)}
          >
            <cfg.icon size={13} />
            {cfg.label}
          </button>
        )
      },
    },
  ], [campaign, goToPayments, moveStatus, openCampaignPanel, openOfferForCreator, openProductModal, openStepEmailPanel, requestCreatorPayout])

  useEffect(() => {
    if (gridColumns.length === 0) setGridColumns(defaultColumns)
  }, [defaultColumns, gridColumns.length])

  const openSetOffersModal = () => {
    const baseAmount = campaign?.flat_amount != null ? campaign.flat_amount / 100 : 0
    setOfferInput(baseAmount ? String(baseAmount) : '')
    setIsOfferModalOpen(true)
  }

  const handleSaveOffers = async () => {
    const parsed = parseFloat(offerInput)
    if (Number.isNaN(parsed) || parsed < 0) return
    const cents = Math.round(parsed * 100)
    const selected = campaignInfluencers.filter((ci: any) => selectedIds.has(ci.id))
    if (!selected.length) return
    setIsSavingOffers(true)
    try {
      await Promise.all(selected.map((ci: any) => updateCampaignInfluencerOffer(ci.id, cents)))
      await loadCampaign()
      setIsOfferModalOpen(false)
    } finally {
      setIsSavingOffers(false)
    }
  }

  const handleBulkRemoveSelected = useCallback(async () => {
    const selected = campaignInfluencers.filter((ci: any) => selectedIds.has(ci.id))
    if (!selected.length) return
    setRemovingId('bulk')
    try {
      await Promise.all(selected.map((ci: any) => removeInfluencerFromCampaign(campaignId, ci.influencer_id)))
      await loadCampaign()
      setSelectedIds(new Set())
    } finally {
      setRemovingId(null)
    }
  }, [campaignId, campaignInfluencers, loadCampaign, selectedIds])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={28} className="text-[#7b7dfa]" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle size={32} className="text-gray-300 mb-3" />
        <p className="text-gray-500">Campaign not found</p>
        <button onClick={() => router.push('/brand/campaigns')} className="mt-4 text-sm text-[#2b2ef8] hover:underline">
          ← Back to campaigns
        </button>
      </div>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col h-screen bg-white overflow-hidden">
        <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-3 flex items-center gap-4">
          <button onClick={() => router.push('/brand/campaigns')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors shrink-0">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-sm font-bold text-gray-900 truncate">{campaign.name}</h1>
          <div className="ml-auto text-right">
            <p className="text-[#2b2ef8] font-black text-lg leading-none">
              {campaign.flat_amount ? formatPrice(campaign.flat_amount * totalInfluencers, campaign?.currency) : '$0'}
            </p>
            <p className="text-xs text-gray-400">Budget Engaged</p>
          </div>
        </div>

        <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-5">
          <div className="flex items-center">
            {PIPELINE_STAGES.map((stage, i) => {
              const count = pipelineCounts[stage.key] ?? 0
              const pct = totalInfluencers > 0 ? (count / totalInfluencers) * 100 : 0
              return (
                <div key={stage.key} className="flex items-center flex-1 min-w-0">
                  <div className="flex-1 text-center px-2">
                    <p className="text-xs font-bold text-gray-500 mb-3">{stage.label}</p>
                    <p className="text-5xl font-black text-[#2b2ef8] font-semibold tracking-tight leading-none mb-3 tabular-nums">{count}</p>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <m.div
                        className="h-full rounded-full bg-[#2b2ef8] origin-left"
                        initial={false}
                        animate={{ scaleX: pct / 100 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && <ChevronRight size={16} className="text-gray-200 shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>

        {pageActionError ? (
          <div className="shrink-0 px-6 py-2.5 bg-red-50 border-b border-red-100 text-sm text-red-800 flex items-center justify-between gap-3">
            <span className="min-w-0">{pageActionError}</span>
            <button type="button" onClick={() => setPageActionError(null)} className="text-xs font-semibold text-red-700 underline shrink-0">
              Dismiss
            </button>
          </div>
        ) : null}

        {pendingCampaignPayouts.length > 0 ? (
          <div className="shrink-0 px-6 py-3 bg-amber-50 border-b border-amber-100 flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-950">Payout requested</p>
              <p className="text-xs text-amber-900 mt-0.5">
                {pendingCampaignPayouts.length} creator{pendingCampaignPayouts.length !== 1 ? 's' : ''} waiting for wallet payment. Open Payments to complete — row stage arrows stay hidden until this is resolved.
              </p>
            </div>
            <button
              type="button"
              onClick={goToPayments}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2b2ef8] text-white text-sm font-semibold hover:bg-[#2020d6]"
            >
              <CreditCard size={16} />
              Open Payments
            </button>
          </div>
        ) : null}

        <div className="shrink-0 px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors', selectedIds.size > 0 ? 'bg-[#2b2ef8] text-white' : 'bg-gray-100 text-gray-700')}>
            {selectedIds.size > 0 ? selectedIds.size : totalInfluencers}
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, username, email"
              className="pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200 outline-none w-72 focus:border-[#a5a6fc] focus:ring-2 focus:ring-[#eeeeff] transition-all placeholder:text-gray-300"
            />
          </div>

          <AnimatePresence>
            {selectedIds.size > 0 && (
              <m.button
                onClick={() => {
                  const selected = filteredInfluencers.filter((ci: any) => selectedIds.has(ci.id))
                  if (!selected.length) return
                  setEmailPanelTargets(selected)
                  setEmailPanelSubject((campaign?.email_subject as string) || `Collaboration with {{brand_name}}`)
                  setEmailPanelBody((campaign?.email_template as string) || '')
                  setEmailPanelTitle('Send campaign email')
                  setEmailPanelSubtitle(`${selected.length} influencer${selected.length !== 1 ? 's' : ''} selected — outreach`)
                  setPendingStatusAfterSend(null)
                  setIsEmailPanelOpen(true)
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Mail size={14} />
                Email
              </m.button>
            )}
          </AnimatePresence>

          <div className="ml-auto flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button onClick={openSetOffersModal} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Tag size={14} />
                Set offers
              </button>
            )}
            {selectedIds.size > 0 && (
              <button onClick={handleBulkRemoveSelected} disabled={removingId === 'bulk'} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                <Trash2 size={14} />
                {removingId === 'bulk' ? 'Removing…' : 'Remove selected'}
              </button>
            )}
            <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2b2ef8] hover:bg-[#2020d6] text-white text-sm font-semibold transition-colors shadow-sm">
              <Plus size={14} />
              Add creators
            </button>
          </div>
        </div>

        {campaignInfluencers.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#eeeeff] flex items-center justify-center mb-4">
              <Users size={28} className="text-[#a5a6fc]" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">No creators yet</p>
            <p className="text-sm text-gray-400 mb-5 max-w-xs">Add creators from your lists to start the campaign outreach</p>
          </div>
        ) : (
          <ProDataGrid
            columns={gridColumns.length ? gridColumns : defaultColumns}
            rows={filteredInfluencers}
            campaign={campaign}
            selectedIds={selectedIds}
            toggleOne={toggleOne}
            toggleAll={toggleAll}
            allSelected={allSelected}
            onRemove={() => { }}
            removingId={removingId}
            onColumnReorder={(cols) => setGridColumns(cols)}
          />
        )}
      </div>

      <SelectedProductsModal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} products={productModalItems} />

      <AddCreatorsModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} campaignId={campaignId} onAdded={() => { loadCampaign(); setIsAddOpen(false) }} />

      <BulkEmailPanel
        isOpen={isEmailPanelOpen}
        onClose={() => { setIsEmailPanelOpen(false); setPendingStatusAfterSend(null) }}
        selectedInfluencers={emailPanelTargets}
        campaign={campaign}
        brandName={brandName}
        initialSubject={emailPanelSubject}
        initialBody={emailPanelBody}
        panelTitle={emailPanelTitle}
        panelSubtitle={emailPanelSubtitle}
        onSent={async (count) => {
          if (pendingStatusAfterSend && count > 0 && emailPanelTargets.length > 0) {
            await Promise.all(emailPanelTargets.map((ci: any) => updateCampaignInfluencerStatus(ci.id, pendingStatusAfterSend)))
          }
          await loadCampaign()
          setSelectedIds(new Set())
          setIsEmailPanelOpen(false)
          setPendingStatusAfterSend(null)
        }}
      />

      <InfluencerSidePanel
        influencer={sidePanelInfluencer}
        isOpen={Boolean(sidePanelInfluencer)}
        onClose={() => { setSidePanelInfluencer(null); setSidePanelCi(null) }}
        campaignContext={{
          campaignName: campaign?.name ?? null,
          campaignInfluencer: sidePanelCi,
          campaign,
          onApproveDraft: async () => {
            if (!sidePanelCi) return
            const target = sidePanelCi
            await handleStatusChange(target.id, 'published')
            setSidePanelInfluencer(null)
            setSidePanelCi(null)
            setEmailPanelTargets([{ ...target, status: 'published' }])
            setEmailPanelSubject(`Time to publish {{campaign_name}}`)
            setEmailPanelBody(`<p>Hi <b>{{first_name}}</b>,</p><p>Your content for <b>{{campaign_name}}</b> is ready to go live. Please publish on the agreed channel and let us know when it is live.</p><p>Best,<br/>${brandName}</p>`)
            setEmailPanelTitle('Send publish request email')
            setEmailPanelSubtitle('1 influencer selected — request publication')
            setPendingStatusAfterSend(null)
            setIsEmailPanelOpen(true)
          },
          onRejectDraft: async () => {
            if (!sidePanelCi?.influencers?.email || !userId) return
            const tok = sidePanelCi.token as string | undefined
            const origin =
              typeof window !== 'undefined'
                ? window.location.origin
                : (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
            const draftUrl = tok ? `${origin}/draft/${tok}` : ''
            const first = sidePanelCi.influencers.first_name ?? sidePanelCi.influencers.name ?? 'there'
            const res = await sendOutreachEmail({
              authUserId: userId,
              toEmail: sidePanelCi.influencers.email,
              toName: sidePanelCi.influencers.name ?? sidePanelCi.influencers.email,
              subject: `Revisions requested — ${campaign?.name ?? 'your collaboration'}`,
              body: `<p>Hi ${first},</p><p>Thank you for your draft for <b>${campaign?.name ?? 'our campaign'}</b>. We would love a few changes before we can approve it. Could you please adjust the content and upload an updated version when you are ready?</p>${draftUrl ? `<p><a href="${draftUrl}" style="color:#1a1aff;font-weight:600">Resubmit your draft here</a></p><p style="font-size:12px;color:#666">Link: ${draftUrl}</p>` : ''}<p>We appreciate your work and look forward to the updated version.</p><p>Best,<br/>${brandName}</p>`,
            })
            if (!res.success) {
              setPageActionError(res.error ?? 'Could not send revision email')
              return
            }
            await loadCampaign()
          },
        }}
      />

      {isOfferModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => !isSavingOffers && setIsOfferModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-2xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">Set offers</h3>
              <p className="text-sm text-gray-500 mb-4">
                Set a custom flat payment for {selectedIds.size} selected influencer{selectedIds.size > 1 ? 's' : ''}.
              </p>
              <div className="relative mb-5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerInput}
                  onChange={(e) => setOfferInput(e.target.value)}
                  placeholder="Enter custom offer"
                  className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#a5a6fc] focus:ring-2 focus:ring-[#eeeeff]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsOfferModalOpen(false)} disabled={isSavingOffers} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveOffers} disabled={isSavingOffers || !offerInput.trim()} className="px-4 py-2 rounded-xl bg-[#2b2ef8] text-white text-sm font-semibold hover:bg-[#2020d6] disabled:opacity-50">
                  {isSavingOffers ? 'Saving...' : 'Save offers'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </LazyMotion>
  )
}
