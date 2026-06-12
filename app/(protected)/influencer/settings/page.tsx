'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Country list ──────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
]

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

// ── Reusable input components ─────────────────────────────────────────
function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-800 mb-1.5">
      {children}
    </label>
  )
}

function TextInput({
  id, value, onChange, placeholder, disabled, type = 'text',
}: {
  id?: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; type?: string
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all',
        'border-gray-200 bg-white text-gray-800 placeholder:text-gray-400',
        'focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/20',
        'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
      )}
    />
  )
}

function SelectInput({
  id, value, onChange, options, placeholder,
}: {
  id?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all appearance-none',
        'border-gray-200 bg-white text-gray-800',
        'focus:border-[#1a1aff] focus:ring-2 focus:ring-[#1a1aff]/20',
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default function InfluencerSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Profile fields
  const [mediaName, setMediaName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState('')
  const [gender, setGender] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Billing fields
  const [billingType, setBillingType] = useState<'Individual' | 'Business'>('Individual')
  const [billingName, setBillingName] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [billingCountry, setBillingCountry] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')

  // ── Fetch data ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/influencer/settings')
        if (!res.ok) throw new Error('Failed to fetch settings')
        const json = await res.json()
        const inf = json.influencer

        setMediaName(inf.name ?? '')
        setFirstName(inf.first_name ?? '')
        setLastName(inf.last_name ?? '')
        setCountry(inf.country_code ?? '')
        setGender(inf.gender ?? '')
        setEmail(inf.email ?? '')
        setPhone(inf.phone ?? '')

        setBillingType(inf.billing_type === 'Business' ? 'Business' : 'Individual')
        setBillingName(inf.billing_name ?? '')
        setAddressLine1(inf.billing_address_line1 ?? '')
        setAddressLine2(inf.billing_address_line2 ?? '')
        setBillingCountry(inf.billing_country ?? '')
        setStateProvince(inf.billing_state_province ?? '')
        setCity(inf.billing_city ?? '')
        setPostalCode(inf.billing_postal_code ?? '')
      } catch {
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // ── Save profile ─────────────────────────────────────────────────────
  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/influencer/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mediaName || undefined,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          country_code: country || undefined,
          gender: gender || undefined,
          phone: phone || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Save billing ────────────────────────────────────────────────────
  const saveBilling = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/influencer/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billing_type: billingType,
          billing_name: billingName || undefined,
          billing_address_line1: addressLine1 || undefined,
          billing_address_line2: addressLine2 || undefined,
          billing_country: billingCountry || undefined,
          billing_state_province: stateProvince || undefined,
          billing_city: city || undefined,
          billing_postal_code: postalCode || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Billing information saved')
    } catch {
      toast.error('Failed to save billing information')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="pt-20 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1a1aff] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-20 w-full">
      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-gray-200 mb-10">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors relative',
            activeTab === 'profile' ? 'text-[#1a1aff]' : 'text-gray-500 hover:text-gray-800',
          )}
        >
          Profile
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1a1aff] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors relative',
            activeTab === 'billing' ? 'text-[#1a1aff]' : 'text-gray-500 hover:text-gray-800',
          )}
        >
          Billing
          {activeTab === 'billing' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1a1aff] rounded-full" />
          )}
        </button>
      </div>

      {/* ── Profile Tab ─────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-10">Profile</h1>

          {/* Personal information */}
          <div className="flex gap-16 mb-12">
            <div className="w-[320px] shrink-0">
              <h2 className="text-sm font-bold text-gray-900 mb-1">Personal information</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Complete your personal information and improve your chances of finding the best partnerships.
              </p>
            </div>
            <div className="flex-1 border border-gray-200 rounded-xl p-6 space-y-5">
              <div>
                <FieldLabel htmlFor="mediaName">Media name</FieldLabel>
                <TextInput id="mediaName" value={mediaName} onChange={setMediaName} placeholder="e.g., John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <TextInput id="firstName" value={firstName} onChange={setFirstName} placeholder="e.g., John" />
                </div>
                <div>
                  <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                  <TextInput id="lastName" value={lastName} onChange={setLastName} placeholder="e.g., Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <SelectInput
                    id="country"
                    value={country}
                    onChange={setCountry}
                    placeholder="Select your country"
                    options={COUNTRIES.map(c => ({ value: c.code, label: `${c.flag}  ${c.name}` }))}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="gender">Gender</FieldLabel>
                  <SelectInput
                    id="gender"
                    value={gender}
                    onChange={setGender}
                    placeholder="Select gender"
                    options={GENDERS.map(g => ({ value: g, label: g }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact information */}
          <div className="flex gap-16 mb-8">
            <div className="w-[320px] shrink-0">
              <h2 className="text-sm font-bold text-gray-900 mb-1">Contact information</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Keep your contact information up to date. The phone number is optional.
              </p>
            </div>
            <div className="flex-1 border border-gray-200 rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <TextInput id="email" value={email} onChange={() => {}} placeholder="" disabled />
                </div>
                <div>
                  <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                  <TextInput id="phone" value={phone} onChange={setPhone} placeholder="(415) 000 0000" type="tel" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveProfile}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1a1aff] hover:bg-[#0000cc] disabled:opacity-60 transition-all"
            >
              {isSaving ? 'Saving...' : 'Update profile'}
            </button>
          </div>
        </div>
      )}

      {/* ── Billing Tab ─────────────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <div>
          <div className="flex gap-16 mb-8">
            <div className="w-[320px] shrink-0">
              <h2 className="text-sm font-bold text-gray-900 mb-1">Billing information</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Manage your payment information for future payments.
              </p>
            </div>
            <div className="flex-1 border border-gray-200 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-semibold text-gray-900">Billing information</h3>

              <div>
                <FieldLabel>Type*</FieldLabel>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billingType"
                      checked={billingType === 'Individual'}
                      onChange={() => setBillingType('Individual')}
                      className="w-4 h-4 text-[#1a1aff] border-gray-300 focus:ring-[#1a1aff]"
                    />
                    <span className="text-sm text-gray-700">Individual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billingType"
                      checked={billingType === 'Business'}
                      onChange={() => setBillingType('Business')}
                      className="w-4 h-4 text-[#1a1aff] border-gray-300 focus:ring-[#1a1aff]"
                    />
                    <span className="text-sm text-gray-700">Business</span>
                  </label>
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="billingName">Name*</FieldLabel>
                <TextInput id="billingName" value={billingName} onChange={setBillingName} placeholder="e.g., John Doe" />
              </div>
              <div>
                <FieldLabel htmlFor="addressLine1">Address Line 1*</FieldLabel>
                <TextInput id="addressLine1" value={addressLine1} onChange={setAddressLine1} placeholder="e.g., 123 Madison Ave" />
              </div>
              <div>
                <FieldLabel htmlFor="addressLine2">Address Line 2</FieldLabel>
                <TextInput id="addressLine2" value={addressLine2} onChange={setAddressLine2} placeholder="e.g., Apt 4B" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="billingCountry">Country*</FieldLabel>
                  <SelectInput
                    id="billingCountry"
                    value={billingCountry}
                    onChange={setBillingCountry}
                    placeholder="Select your country"
                    options={COUNTRIES.map(c => ({ value: c.code, label: `${c.flag}  ${c.name}` }))}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="stateProvince">State/Province*</FieldLabel>
                  <TextInput id="stateProvince" value={stateProvince} onChange={setStateProvince} placeholder="e.g., California" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="city">City*</FieldLabel>
                  <TextInput id="city" value={city} onChange={setCity} placeholder="e.g., New York" />
                </div>
                <div>
                  <FieldLabel htmlFor="postalCode">Postal Code*</FieldLabel>
                  <TextInput id="postalCode" value={postalCode} onChange={setPostalCode} placeholder="e.g., 10001" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={saveBilling}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1a1aff] hover:bg-[#0000cc] disabled:opacity-60 transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save information'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
