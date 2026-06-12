'use client'

import {
  createContext, useContext, useState, useCallback, useRef, useEffect,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { buildSignatureHtml, type EmailSignatureConfig } from '@/lib/email/signature'
import { useSupabaseUser } from '@/lib/auth/useSupabaseUser'

// ── Constants ──────────────────────────────────────────────────────────
export const CAMPAIGN_EMOJIS = ['🎯', '📢', '🚀', '💼', '⭐', '🔥', '💡', '🎬']
export const CAMPAIGN_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#3B82F6',
  '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
]
export const TOTAL_STEPS = 6
export const STEP_LABELS = [
  'Campaign Type',
  'Campaign Info',
  'Compensation',
  'Documents',
  'Email Settings',
  'Finalize',
]

// ── Types ──────────────────────────────────────────────────────────────
export interface ContentTag {
  type: 'hashtag' | 'mention'
  value: string
}
export interface ProductDraft {
  id: string
  name: string
  imageFile?: File
  imagePreview?: string
  valueUSD: number
  description: string
}

interface WizardState {
  // Step 1
  campaignType: 'paid' | 'paid_with_product' | null

  // Step 2
  logoType: 'icon' | 'image'
  logoFile: File | null
  logoPreview: string | null
  name: string
  description: string
  coverEmoji: string
  coverColor: string
  tags: ContentTag[]
  campaignGoal: string
  primaryKpi: string
  targetKpiValue: number | ''

  // Step 3
  flatAmountUSD: number | ''
  campaignCurrency: string
  products: ProductDraft[]
  showProductPrices: boolean
  maxProductCount: number | ''
  maxProductValueUSD: number | ''
  optionalFlatUSD: number | ''

  // Step 4
  briefFile: File | null
  contractFile: File | null
  requiresContract: boolean
  campaignLanguage: string
  targetCountries: string[]
  targetCities: string[]
  targetNiches: string[]
  minFollowers: number | ''
  maxFollowers: number | ''
  minEngagementRate: number | ''
  authenticityMinScore: number | ''
  startAt: string
  contentDueAt: string
  publishWindowStart: string
  publishWindowEnd: string
  emailSubject: string
  emailTemplate: string
  signature: EmailSignatureConfig

  // Step 5
  selectedListId: string | null
}

interface WizardContextValue extends WizardState {
  // Setters (one per field for convenience)
  setCampaignType: (v: 'paid' | 'paid_with_product' | null) => void
  setLogoType: (v: 'icon' | 'image') => void
  setLogoFile: (v: File | null) => void
  setLogoPreview: (v: string | null) => void
  setName: (v: string) => void
  setDescription: (v: string) => void
  setCoverEmoji: (v: string) => void
  setCoverColor: (v: string) => void
  setTags: (v: ContentTag[] | ((prev: ContentTag[]) => ContentTag[])) => void
  setCampaignGoal: (v: string) => void
  setPrimaryKpi: (v: string) => void
  setTargetKpiValue: (v: number | '') => void
  setFlatAmountUSD: (v: number | '') => void
  setCampaignCurrency: (v: string) => void
  setProducts: (v: ProductDraft[] | ((prev: ProductDraft[]) => ProductDraft[])) => void
  setShowProductPrices: (v: boolean | ((prev: boolean) => boolean)) => void
  setMaxProductCount: (v: number | '') => void
  setMaxProductValueUSD: (v: number | '') => void
  setOptionalFlatUSD: (v: number | '') => void
  setBriefFile: (v: File | null) => void
  setContractFile: (v: File | null) => void
  setRequiresContract: (v: boolean | ((prev: boolean) => boolean)) => void
  setCampaignLanguage: (v: string) => void
  setTargetCountries: (v: string[] | ((prev: string[]) => string[])) => void
  setTargetCities: (v: string[] | ((prev: string[]) => string[])) => void
  setTargetNiches: (v: string[] | ((prev: string[]) => string[])) => void
  setMinFollowers: (v: number | '') => void
  setMaxFollowers: (v: number | '') => void
  setMinEngagementRate: (v: number | '') => void
  setAuthenticityMinScore: (v: number | '') => void
  setStartAt: (v: string) => void
  setContentDueAt: (v: string) => void
  setPublishWindowStart: (v: string) => void
  setPublishWindowEnd: (v: string) => void
  setEmailSubject: (v: string) => void
  setEmailTemplate: (v: string | ((prev: string) => string)) => void
  setSignature: (v: EmailSignatureConfig | ((prev: EmailSignatureConfig) => EmailSignatureConfig)) => void
  setSelectedListId: (v: string | null) => void

  // Navigation
  currentStep: number
  goNext: () => void
  goBack: () => void
  canGoNext: () => boolean

  // Create
  isCreating: boolean
  error: string | null
  setError: (v: string | null) => void
  handleCreate: () => Promise<void>

  // Lists (fetched)
  lists: { id: string; name: string; color?: string; influencer_count: number }[]
  setLists: (v: any[]) => void
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used inside CampaignWizardProvider')
  return ctx
}

// ── Provider ───────────────────────────────────────────────────────────
export function CampaignWizardProvider({
  children,
  currentStep,
}: {
  children: ReactNode
  currentStep: number
}) {
  const router = useRouter()
  const { userId } = useSupabaseUser()

  // Step 1
  const [campaignType, setCampaignType] = useState<'paid' | 'paid_with_product' | null>(null)

  // Step 2
  const [logoType, setLogoType] = useState<'icon' | 'image'>('icon')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverEmoji, setCoverEmoji] = useState('🎯')
  const [coverColor, setCoverColor] = useState('#6366F1')
  const [tags, setTags] = useState<ContentTag[]>([])
  const [campaignGoal, setCampaignGoal] = useState('')
  const [primaryKpi, setPrimaryKpi] = useState('')
  const [targetKpiValue, setTargetKpiValue] = useState<number | ''>('')

  // Step 3
  const [flatAmountUSD, setFlatAmountUSD] = useState<number | ''>('')
  const [campaignCurrency, setCampaignCurrency] = useState('')
  const [products, setProducts] = useState<ProductDraft[]>([])
  const [showProductPrices, setShowProductPrices] = useState(true)
  const [maxProductCount, setMaxProductCount] = useState<number | ''>('')
  const [maxProductValueUSD, setMaxProductValueUSD] = useState<number | ''>('')
  const [optionalFlatUSD, setOptionalFlatUSD] = useState<number | ''>('')

  // Step 4
  const [briefFile, setBriefFile] = useState<File | null>(null)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [requiresContract, setRequiresContract] = useState(false)
  const [campaignLanguage, setCampaignLanguage] = useState('')
  const [targetCountries, setTargetCountries] = useState<string[]>([])
  const [targetCities, setTargetCities] = useState<string[]>([])
  const [targetNiches, setTargetNiches] = useState<string[]>([])
  const [minFollowers, setMinFollowers] = useState<number | ''>('')
  const [maxFollowers, setMaxFollowers] = useState<number | ''>('')
  const [minEngagementRate, setMinEngagementRate] = useState<number | ''>('')
  const [authenticityMinScore, setAuthenticityMinScore] = useState<number | ''>('')
  const [startAt, setStartAt] = useState('')
  const [contentDueAt, setContentDueAt] = useState('')
  const [publishWindowStart, setPublishWindowStart] = useState('')
  const [publishWindowEnd, setPublishWindowEnd] = useState('')
  const [emailSubject, setEmailSubject] = useState(
    'Collaboration opportunity with {{brand_name}}'
  )
  const [signature, setSignature] = useState<EmailSignatureConfig>({
    title: 'Business Consultant',
    phone: '07976 985625',
    websiteText: 'www.example.com',
    websiteUrl: 'https://www.example.com',
    linkedinText: 'linkedin.com/in/yourname',
    linkedinUrl: 'https://www.linkedin.com',
  })
  const [emailTemplate, setEmailTemplate] = useState(
    [
      `<p>Hi <span style="color:#6366F1;font-weight:600">{{first_name}}</span>,</p>`,
      `<p></p>`,
      `<p>We'd love to collaborate with you on our upcoming <b>{{campaign_name}}</b> campaign.</p>`,
      `<p></p>`,
      `<p>Click here to view details and apply: <a href="{{application_link}}" style="color:#6366F1">Apply</a></p>`,
      `<p></p>`,
      `<p>Best,</p>`,
      buildSignatureHtml({
        title: 'Business Consultant',
        phone: '07976 985625',
        websiteText: 'www.example.com',
        websiteUrl: 'https://www.example.com',
        linkedinText: 'linkedin.com/in/yourname',
        linkedinUrl: 'https://www.linkedin.com',
      }),
    ].join('')
  )

  // Step 5
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [lists, setLists] = useState<any[]>([])

  // Meta
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    ;(async () => {
      const { data } = await supabase
        .from('brands')
        .select(
          'country_code, city, preferred_language, currency, shipping_notes_default, mandatory_terms_default, forbidden_terms_default',
        )
        .eq('auth_user_id', userId)
        .single()

      if (!data) return
      if (!campaignLanguage && data.preferred_language) {
        setCampaignLanguage(data.preferred_language)
      }
      if (!campaignCurrency && data.currency) {
        setCampaignCurrency(data.currency)
      }
      if (targetCountries.length === 0 && data.country_code) {
        setTargetCountries([data.country_code])
      }
      if (targetCities.length === 0 && data.city) {
        setTargetCities([data.city])
      }
      if (!description.trim()) {
        const notes = [
          data.shipping_notes_default ? `Shipping notes: ${data.shipping_notes_default}` : '',
          data.mandatory_terms_default ? `Mandatory terms: ${data.mandatory_terms_default}` : '',
          data.forbidden_terms_default ? `Forbidden terms: ${data.forbidden_terms_default}` : '',
        ]
          .filter(Boolean)
          .join('\n')
        if (notes) setDescription(notes)
      }
    })()
  }, [userId])

  const canGoNext = useCallback(() => {
    if (currentStep === 1) return campaignType !== null
    if (currentStep === 2) {
      if (targetKpiValue !== '' && typeof targetKpiValue === 'number' && targetKpiValue < 0) {
        return false
      }
      return name.trim().length > 0
    }
    if (currentStep === 3) {
      if (campaignType === 'paid') {
        return typeof flatAmountUSD === 'number' && flatAmountUSD > 0
      }
      if (campaignType === 'paid_with_product') {
        return products.length > 0
      }
    }
    if (currentStep === 4) {
      const countOk =
        maxProductCount === '' ||
        (typeof maxProductCount === 'number' && maxProductCount >= 1)
      const valueOk =
        maxProductValueUSD === '' ||
        (typeof maxProductValueUSD === 'number' && maxProductValueUSD >= 0)
      const followerRangeOk =
        minFollowers === '' ||
        maxFollowers === '' ||
        (typeof minFollowers === 'number' &&
          typeof maxFollowers === 'number' &&
          minFollowers <= maxFollowers)
      return countOk && valueOk && followerRangeOk
    }
    if (currentStep === 5) {
      return emailSubject.trim().length > 0 && emailTemplate.trim().length > 0
    }
    return true
  }, [
    currentStep,
    campaignType,
    name,
    flatAmountUSD,
    targetKpiValue,
    products.length,
    maxProductCount,
    maxProductValueUSD,
    minFollowers,
    maxFollowers,
    emailSubject,
    emailTemplate,
  ])

  const goNext = useCallback(() => {
    if (!canGoNext()) return
    if (currentStep === 2 && !name.trim()) {
      setError('Campaign name is required')
      return
    }
    if (currentStep === 2 && typeof targetKpiValue === 'number' && targetKpiValue < 0) {
      setError('Target KPI value must be greater than or equal to 0')
      return
    }
    if (currentStep === 4) {
      if (
        typeof minFollowers === 'number' &&
        typeof maxFollowers === 'number' &&
        minFollowers > maxFollowers
      ) {
        setError('Min followers cannot be greater than max followers')
        return
      }
      if (
        typeof authenticityMinScore === 'number' &&
        (authenticityMinScore < 0 || authenticityMinScore > 100)
      ) {
        setError('Authenticity score must be between 0 and 100')
        return
      }
    }
    if (currentStep === 3 && campaignType === 'paid') {
      if (!(typeof flatAmountUSD === 'number' && flatAmountUSD > 0)) {
        setError('Please set a valid flat payment amount')
        return
      }
    }
    if (currentStep === 3 && campaignType === 'paid_with_product') {
      if (products.length === 0) {
        setError('Add at least one product before continuing')
        return
      }
    }
    if (currentStep === 5) {
      if (!emailSubject.trim()) {
        setError('Email subject is required')
        return
      }
      if (!emailTemplate.trim()) {
        setError('Email body is required')
        return
      }
    }
    setError(null)
    if (currentStep < TOTAL_STEPS) {
      router.push(`/brand/campaigns/create/step-${currentStep + 1}`)
    }
  }, [
    currentStep,
    canGoNext,
    name,
    campaignType,
    flatAmountUSD,
    targetKpiValue,
    products.length,
    minFollowers,
    maxFollowers,
    authenticityMinScore,
    emailSubject,
    emailTemplate,
    router,
  ])

  const goBack = useCallback(() => {
    setError(null)
    if (currentStep > 1) {
      router.push(`/brand/campaigns/create/step-${currentStep - 1}`)
    } else {
      router.push('/brand/campaigns')
    }
  }, [currentStep, router])

  const handleCreate = useCallback(async () => {
    if (!name.trim()) { setError('Campaign name is required'); return }
    if (!campaignType) { setError('Please select a campaign type'); return }
    setIsCreating(true)
    setError(null)
    try {
      const { createCampaign, addListInfluencersToCampaign } = await import('@/lib/queries/campaigns')

      const supabase = createClient()

      const uploadToCloudinary = async (file: File) => {
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        if (!uploadPreset || !cloudName) {
          throw new Error('Cloudinary environment variables are missing')
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData },
        )

        const json = await res.json()
        if (!res.ok || !json?.secure_url) {
          throw new Error(json?.error?.message || 'Cloudinary upload failed')
        }
        return json.secure_url as string
      }

      const uploadPdfToContractsBucket = async (file: File, keyPrefix: string) => {
        if (file.type !== 'application/pdf') {
          throw new Error('Only PDF files are accepted')
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('PDF must be under 10MB')
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
        const filePath = `contracts/${keyPrefix}/${Date.now()}_${safeName}`

        const { error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(filePath, file, { contentType: 'application/pdf', upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(filePath)
        if (!urlData?.publicUrl) throw new Error('Failed to generate PDF URL')
        return urlData.publicUrl
      }

      const flat =
        campaignType === 'paid'
          ? (typeof flatAmountUSD === 'number' ? Math.round(flatAmountUSD * 100) : null)
          : (typeof optionalFlatUSD === 'number' ? Math.round(optionalFlatUSD * 100) : null)

      const authUserId = userId ?? ''

      // If a logo file exists, upload it regardless of logoType.
      // (Users may upload an image but forget to click "Save" in the logo modal.)
      const logoUrl = logoFile ? await uploadToCloudinary(logoFile) : undefined

      const briefPdfUrl = briefFile
        ? await uploadPdfToContractsBucket(briefFile, `${authUserId}/briefs`)
        : null

      const contractPdfUrl = contractFile
        ? await uploadPdfToContractsBucket(contractFile, `${authUserId}/contracts`)
        : null

      const productsWithUploads =
        campaignType === 'paid_with_product'
          ? await Promise.all(
              products.map(async (p) => ({
                name: p.name,
                // Preserve catalog image URLs when product came from saved catalog.
                imageUrl: p.imageFile
                  ? await uploadToCloudinary(p.imageFile)
                  : (p.imagePreview || undefined),
                value: Math.round(p.valueUSD * 100),
                description: p.description || undefined,
              })),
            )
          : []

      const campaign = await createCampaign({
        authUserId,
        name: name.trim(),
        description: description.trim() || undefined,
        logoUrl,
        type: campaignType,
        contentTags: tags,
        flatAmount: flat,
        showProductPrice: showProductPrices,
        maxProductCount: typeof maxProductCount === 'number' ? maxProductCount : null,
        maxProductValue: typeof maxProductValueUSD === 'number'
          ? Math.round(maxProductValueUSD * 100) : null,
        briefPdfUrl,
        contractPdfUrl,
        requiresContract,
        targetListId: selectedListId,
        coverColor,
        coverEmoji,
        emailSubject: emailSubject.trim() || undefined,
        emailTemplate: emailTemplate.trim() || undefined,
        campaignGoal: campaignGoal.trim() || null,
        primaryKpi: primaryKpi.trim() || null,
        targetKpiValue: typeof targetKpiValue === 'number' ? targetKpiValue : null,
        campaignLanguage: campaignLanguage.trim() || null,
        campaignCurrency: campaignCurrency.trim() || null,
        targetCountries,
        targetCities,
        targetNiches,
        minFollowers: typeof minFollowers === 'number' ? minFollowers : null,
        maxFollowers: typeof maxFollowers === 'number' ? maxFollowers : null,
        minEngagementRate:
          typeof minEngagementRate === 'number' ? minEngagementRate : null,
        authenticityMinScore:
          typeof authenticityMinScore === 'number' ? authenticityMinScore : null,
        startAt: startAt || null,
        contentDueAt: contentDueAt || null,
        publishWindowStart: publishWindowStart || null,
        publishWindowEnd: publishWindowEnd || null,
        products: productsWithUploads,
      })

      if (!campaign) {
        setError('Failed to create campaign. Try again.')
        return
      }

      // If the brand selected a list during the wizard, attach its creators now
      // so the campaign dashboard is created with creators already present.
      if (selectedListId) {
        try {
          await addListInfluencersToCampaign(campaign.id, selectedListId)
        } catch (e) {
          console.error('Failed to attach list creators to campaign:', e)
        }
      }
      router.push('/brand/campaigns')
    } catch (e: any) {
      setError(e?.message || 'Failed to create campaign. Try again.')
    } finally {
      setIsCreating(false)
    }
  }, [
    name, campaignType, flatAmountUSD, optionalFlatUSD, description,
    campaignGoal, primaryKpi, targetKpiValue, campaignLanguage, campaignCurrency,
    targetCountries, targetCities, targetNiches, minFollowers, maxFollowers,
    minEngagementRate, authenticityMinScore, startAt, contentDueAt,
    publishWindowStart, publishWindowEnd,
    tags, showProductPrices, maxProductCount, maxProductValueUSD,
    requiresContract, selectedListId, coverColor, coverEmoji,
    emailSubject, emailTemplate, products, userId, router,
    logoType, logoFile, briefFile, contractFile,
  ])

  return (
    <WizardContext.Provider
      value={{
        campaignType, setCampaignType,
        logoType, setLogoType,
        logoFile, setLogoFile,
        logoPreview, setLogoPreview,
        name, setName,
        description, setDescription,
        coverEmoji, setCoverEmoji,
        coverColor, setCoverColor,
        tags, setTags,
        campaignGoal, setCampaignGoal,
        primaryKpi, setPrimaryKpi,
        targetKpiValue, setTargetKpiValue,
        flatAmountUSD, setFlatAmountUSD,
        campaignCurrency, setCampaignCurrency,
        products, setProducts,
        showProductPrices, setShowProductPrices,
        maxProductCount, setMaxProductCount,
        maxProductValueUSD, setMaxProductValueUSD,
        optionalFlatUSD, setOptionalFlatUSD,
        briefFile, setBriefFile,
        contractFile, setContractFile,
        requiresContract, setRequiresContract,
        campaignLanguage, setCampaignLanguage,
        targetCountries, setTargetCountries,
        targetCities, setTargetCities,
        targetNiches, setTargetNiches,
        minFollowers, setMinFollowers,
        maxFollowers, setMaxFollowers,
        minEngagementRate, setMinEngagementRate,
        authenticityMinScore, setAuthenticityMinScore,
        startAt, setStartAt,
        contentDueAt, setContentDueAt,
        publishWindowStart, setPublishWindowStart,
        publishWindowEnd, setPublishWindowEnd,
        emailSubject, setEmailSubject,
        emailTemplate, setEmailTemplate,
        signature, setSignature,
        selectedListId, setSelectedListId,
        lists, setLists,
        currentStep,
        goNext, goBack, canGoNext,
        isCreating, error, setError,
        handleCreate,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}
