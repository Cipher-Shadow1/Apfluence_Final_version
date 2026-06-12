'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LogOut, ChevronDown } from "lucide-react";
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseUser } from '@/lib/auth/useSupabaseUser'

const TABS = [
  {
    key: 'marketplace',
    label: 'Marketplace',
    href: '/influencer',
    exact: true,
  },
  {
    key: 'offers',
    label: 'My Campaigns',
    href: '/influencer/offers',
    badge: true,
  },
  {
    key: 'payments',
    label: 'Payments',
    href: '/influencer/payments',
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/influencer/settings',
  },
]

export default function InfluencerHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { userId, firstName, isLoaded } = useSupabaseUser()
  const [pendingCount, setPendingCount] = useState(0)
  const [influencerData, setInfluencerData] = useState<any>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Load influencer data + pending offers count
  useEffect(() => {
    if (!isLoaded || !userId) return
    const supabase = createClient()

    // Get influencer profile
    supabase
      .from('influencers')
      .select('id, name, email, avatar_url, username, authenticity_score')
      .eq('auth_user_id', userId)
      .single()
      .then(({ data }: { data: any }) => {
        if (data) {
          setInfluencerData(data)

          // Get pending offers count
          supabase
            .from('campaign_influencers')
            .select('id', { count: 'exact', head: true })
            .eq('influencer_id', data.id)
            .eq('status', 'email_sent')
            .is('apply_status', null)
            .then(({ count }: { count: number | null }) => setPendingCount(count ?? 0))
        }
      })
  }, [isLoaded, userId])

  const isActive = (tab: typeof TABS[0]) => {
    if (tab.exact) return pathname === tab.href
    return pathname.startsWith(tab.href)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in/influencer')
    setShowProfileMenu(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-8xl mx-auto px-6 flex items-center justify-between h-12">

        {/* LEFT — Logo + Nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button
            onClick={() => router.push('/influencer')}
            className="flex items-center gap-1.5 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo blue gradient.svg"
              alt="Apfluence"
              className="h-5 w-auto"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="text-sm font-extrabold text-[#1a1aff]">
              apfluence
            </span>
          </button>

          {/* Tab navigation */}
          <nav className="flex items-center h-12">
            {TABS.map(tab => {
              const active = isActive(tab)

              return (
                <button
                  key={tab.key}
                  onClick={() => router.push(tab.href)}
                  className={cn(
                    'relative flex items-center h-full px-4',
                    'text-sm font-medium transition-colors',
                    active
                      ? 'text-[#1a1aff]'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {tab.label}

                  {/* Pending badge on Offers tab */}
                  {tab.badge && pendingCount > 0 && (
                    <span className="ml-1.5 min-w-[18px] h-[18px] px-1
                                     rounded-full bg-red-500 text-white
                                     text-[10px] font-bold flex items-center
                                     justify-center leading-none">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}

                  {/* Active blue underline */}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1a1aff] rounded-full" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* RIGHT — Email + Logout */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* User email */}
          <span className="text-sm text-gray-600 hidden md:block">
            {influencerData?.email ?? firstName ?? 'Creator'}
          </span>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors',
                'text-[#1a1aff] hover:text-[#0000cc]'
              )}
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Logout</span>
              <ChevronDown size={12} className={cn(
                'transition-transform',
                showProfileMenu && 'rotate-180'
              )} />
            </button>

            {/* Dropdown */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 z-20
                                bg-white rounded-xl shadow-lg border
                                border-gray-100 overflow-hidden">

                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {influencerData?.name ?? firstName ?? "Creator"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {influencerData?.email ?? ''}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        router.push('/influencer/settings')
                        setShowProfileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5
                                 text-sm text-gray-700 hover:bg-gray-50
                                 transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5
                                 text-sm text-red-500 hover:bg-red-50
                                 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
