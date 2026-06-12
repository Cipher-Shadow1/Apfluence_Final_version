'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Country + dial-code master list ──────────────────────────────────────────
const COUNTRIES = [
  { code: 'DZ', name: 'Algeria',        flag: '🇩🇿', dial: '+213' },
  { code: 'AR', name: 'Argentina',      flag: '🇦🇷', dial: '+54'  },
  { code: 'AU', name: 'Australia',      flag: '🇦🇺', dial: '+61'  },
  { code: 'AT', name: 'Austria',        flag: '🇦🇹', dial: '+43'  },
  { code: 'BE', name: 'Belgium',        flag: '🇧🇪', dial: '+32'  },
  { code: 'BR', name: 'Brazil',         flag: '🇧🇷', dial: '+55'  },
  { code: 'CA', name: 'Canada',         flag: '🇨🇦', dial: '+1'   },
  { code: 'CN', name: 'China',          flag: '🇨🇳', dial: '+86'  },
  { code: 'CO', name: 'Colombia',       flag: '🇨🇴', dial: '+57'  },
  { code: 'DK', name: 'Denmark',        flag: '🇩🇰', dial: '+45'  },
  { code: 'EG', name: 'Egypt',          flag: '🇪🇬', dial: '+20'  },
  { code: 'FI', name: 'Finland',        flag: '🇫🇮', dial: '+358' },
  { code: 'FR', name: 'France',         flag: '🇫🇷', dial: '+33'  },
  { code: 'DE', name: 'Germany',        flag: '🇩🇪', dial: '+49'  },
  { code: 'GH', name: 'Ghana',          flag: '🇬🇭', dial: '+233' },
  { code: 'GR', name: 'Greece',         flag: '🇬🇷', dial: '+30'  },
  { code: 'IN', name: 'India',          flag: '🇮🇳', dial: '+91'  },
  { code: 'ID', name: 'Indonesia',      flag: '🇮🇩', dial: '+62'  },
  { code: 'IE', name: 'Ireland',        flag: '🇮🇪', dial: '+353' },
  { code: 'IL', name: 'Israel',         flag: '🇮🇱', dial: '+972' },
  { code: 'IT', name: 'Italy',          flag: '🇮🇹', dial: '+39'  },
  { code: 'JP', name: 'Japan',          flag: '🇯🇵', dial: '+81'  },
  { code: 'KE', name: 'Kenya',          flag: '🇰🇪', dial: '+254' },
  { code: 'KR', name: 'South Korea',    flag: '🇰🇷', dial: '+82'  },
  { code: 'MA', name: 'Morocco',        flag: '🇲🇦', dial: '+212' },
  { code: 'MX', name: 'Mexico',         flag: '🇲🇽', dial: '+52'  },
  { code: 'NL', name: 'Netherlands',    flag: '🇳🇱', dial: '+31'  },
  { code: 'NZ', name: 'New Zealand',    flag: '🇳🇿', dial: '+64'  },
  { code: 'NG', name: 'Nigeria',        flag: '🇳🇬', dial: '+234' },
  { code: 'NO', name: 'Norway',         flag: '🇳🇴', dial: '+47'  },
  { code: 'PK', name: 'Pakistan',       flag: '🇵🇰', dial: '+92'  },
  { code: 'PH', name: 'Philippines',    flag: '🇵🇭', dial: '+63'  },
  { code: 'PL', name: 'Poland',         flag: '🇵🇱', dial: '+48'  },
  { code: 'PT', name: 'Portugal',       flag: '🇵🇹', dial: '+351' },
  { code: 'RO', name: 'Romania',        flag: '🇷🇴', dial: '+40'  },
  { code: 'RU', name: 'Russia',         flag: '🇷🇺', dial: '+7'   },
  { code: 'SA', name: 'Saudi Arabia',   flag: '🇸🇦', dial: '+966' },
  { code: 'SG', name: 'Singapore',      flag: '🇸🇬', dial: '+65'  },
  { code: 'ZA', name: 'South Africa',   flag: '🇿🇦', dial: '+27'  },
  { code: 'ES', name: 'Spain',          flag: '🇪🇸', dial: '+34'  },
  { code: 'SE', name: 'Sweden',         flag: '🇸🇪', dial: '+46'  },
  { code: 'CH', name: 'Switzerland',    flag: '🇨🇭', dial: '+41'  },
  { code: 'TN', name: 'Tunisia',        flag: '🇹🇳', dial: '+216' },
  { code: 'TR', name: 'Turkey',         flag: '🇹🇷', dial: '+90'  },
  { code: 'UA', name: 'Ukraine',        flag: '🇺🇦', dial: '+380' },
  { code: 'AE', name: 'UAE',            flag: '🇦🇪', dial: '+971' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dial: '+44'  },
  { code: 'US', name: 'United States',  flag: '🇺🇸', dial: '+1'   },
  { code: 'VN', name: 'Vietnam',        flag: '🇻🇳', dial: '+84'  },
]

export interface ShippingAddress {
  firstName: string
  lastName: string
  phoneDialCode: string
  phone: string
  addressLine1: string
  addressLine2: string
  country: string
  stateProvince: string
  city: string
  postalCode: string
}

interface ShippingAddressModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onCancel: () => void
  onAccept: (address: ShippingAddress) => void
}

// ── Small reusable input ──────────────────────────────────────────────────────
function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, error, type = 'text',
}: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; error?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300',
        error
          ? 'border-red-400 ring-2 ring-red-100'
          : 'border-gray-200 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#d5d5fd]',
      )}
    />
  )
}

// ── Phone dial-code picker ────────────────────────────────────────────────────
function PhoneDialPicker({
  value, onChange,
}: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = COUNTRIES.find(c => c.code === value) ?? COUNTRIES.find(c => c.code === 'US')!

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  )

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch('') }}
        className={cn(
          'flex items-center gap-1.5 h-full px-3 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap shrink-0 bg-white',
          open
            ? 'border-[#2b2ef8] ring-2 ring-[#d5d5fd] text-[#2b2ef8]'
            : 'border-gray-200 text-gray-700 hover:border-gray-300',
        )}
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-xs font-semibold tracking-tight text-gray-600">
          {selected.code}
        </span>
        <span className="text-xs text-gray-400 font-medium">{selected.dial}</span>
        <ChevronDown size={12} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-[100] w-64 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-56 py-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No countries found</p>
            ) : (
              filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                    c.code === value && 'bg-[#eeeeff]',
                  )}
                >
                  <span className="text-base leading-none w-5 shrink-0">{c.flag}</span>
                  <span className="flex-1 text-left text-gray-700 font-medium truncate">{c.name}</span>
                  <span className="text-xs font-semibold text-gray-400 shrink-0">{c.dial}</span>
                  {c.code === value && <Check size={12} className="text-[#2b2ef8] shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Country select (native) ───────────────────────────────────────────────────
function CountrySelect({
  value, onChange, error,
}: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; error?: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={cn(
          'w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border text-sm outline-none transition-all bg-white',
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-gray-200 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#d5d5fd]',
        )}
      >
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.flag}  {c.name}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ShippingAddressModal({
  isOpen,
  isSubmitting,
  onCancel,
  onAccept,
}: ShippingAddressModalProps) {
  const [form, setForm] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    phoneDialCode: 'US',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    country: 'US',
    stateProvince: '',
    city: '',
    postalCode: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress | 'terms', string>>>({})

  if (!isOpen) return null

  const selectedDialCountry = COUNTRIES.find(c => c.code === form.phoneDialCode) ?? COUNTRIES.find(c => c.code === 'US')!

  const setField = (key: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const setPhoneCountry = (code: string) => {
    setForm(prev => ({ ...prev, phoneDialCode: code }))
    setErrors(prev => ({ ...prev, phone: undefined }))
  }

  const validate = () => {
    const errs: typeof errors = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim()) errs.lastName = 'Required'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (!form.addressLine1.trim()) errs.addressLine1 = 'Required'
    if (!form.country) errs.country = 'Required'
    if (!form.stateProvince.trim()) errs.stateProvince = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    if (!form.postalCode.trim()) errs.postalCode = 'Required'
    if (!agreedToTerms) errs.terms = 'You must agree to the terms'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onAccept(form)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-900">Accept offer</h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto px-6 py-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Enter an address</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                In order to receive the products that the brand would like to send you, please add a postal address to receive the shipment.
              </p>
            </div>

            {/* First / Last */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required error={errors.firstName}>
                <TextInput value={form.firstName} onChange={setField('firstName')} placeholder="Enter first name" error={errors.firstName} />
              </Field>
              <Field label="Last Name" required error={errors.lastName}>
                <TextInput value={form.lastName} onChange={setField('lastName')} placeholder="Enter last name" error={errors.lastName} />
              </Field>
            </div>

            {/* Phone */}
            <Field label="Phone Number" required error={errors.phone}>
              <div className="flex gap-2">
                <PhoneDialPicker value={form.phoneDialCode} onChange={setPhoneCountry} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder={`e.g. ${selectedDialCountry.dial} 555 0000`}
                  className={cn(
                    'flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none transition-all placeholder:text-gray-300',
                    errors.phone
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-gray-200 focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#d5d5fd]',
                  )}
                />
              </div>
            </Field>

            {/* Address Line 1 */}
            <Field label="Address Line 1" required error={errors.addressLine1}>
              <TextInput value={form.addressLine1} onChange={setField('addressLine1')} placeholder="Enter address" error={errors.addressLine1} />
            </Field>

            {/* Address Line 2 */}
            <Field label="Address Line 2">
              <TextInput value={form.addressLine2} onChange={setField('addressLine2')} placeholder="Apartment, suite, unit (optional)" />
            </Field>

            {/* Country / State */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Country" required error={errors.country}>
                <CountrySelect value={form.country} onChange={setField('country')} error={errors.country} />
              </Field>
              <Field label="State / Province" required error={errors.stateProvince}>
                <TextInput value={form.stateProvince} onChange={setField('stateProvince')} placeholder="e.g. New York" error={errors.stateProvince} />
              </Field>
            </div>

            {/* City / Postal */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" required error={errors.city}>
                <TextInput value={form.city} onChange={setField('city')} placeholder="Enter city" error={errors.city} />
              </Field>
              <Field label="Postal Code" required error={errors.postalCode}>
                <TextInput value={form.postalCode} onChange={setField('postalCode')} placeholder="e.g. 10038" error={errors.postalCode} />
              </Field>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => { setAgreedToTerms(p => !p); setErrors(prev => ({ ...prev, terms: undefined })) }}
                  className={cn(
                    'w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                    agreedToTerms ? 'bg-[#2b2ef8] border-[#2b2ef8]' : 'border-gray-300 hover:border-gray-400',
                  )}
                >
                  {agreedToTerms && (
                    <svg viewBox="0 0 12 10" className="w-2.5 h-2 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 5l3 3 7-7" />
                    </svg>
                  )}
                </button>
                <span className="text-sm text-gray-600 leading-snug">
                  I have read and agree to the{' '}
                  <a href="/terms" target="_blank" className="text-[#2b2ef8] hover:underline font-medium">
                    terms and conditions of the Registered Influencer
                  </a>.
                </span>
              </label>
              {errors.terms && <p className="mt-1.5 text-xs text-red-500 pl-7">{errors.terms}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#2b2ef8] hover:bg-[#1a1ce8] text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isSubmitting ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              Accept Offer
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
