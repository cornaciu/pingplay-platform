'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { CalendarCheck2Icon, CalendarIcon, HouseIcon, SlidersHorizontalIcon, UsersIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard/rezervari', label: 'Acasă', icon: HouseIcon, match: '/dashboard/rezervari' },
  { href: '/apps/reservations', label: 'Rezervări', icon: CalendarCheck2Icon, match: '/apps/reservations' },
  { href: '/dashboard/control', label: 'Control', icon: SlidersHorizontalIcon, match: '/dashboard/control' },
  { href: '/apps/calendar', label: 'Calendar', icon: CalendarIcon, match: '/apps/calendar' },
  { href: '/apps/users/list', label: 'Clienți', icon: UsersIcon, match: '/apps/users' }
]

// Phone navigation: a bottom tab bar within thumb reach. Wider screens keep the sidebar.
const MobileTabBar = () => {
  const pathname = usePathname()

  return (
    <nav
      aria-label='Navigare principală'
      className='fixed inset-x-0 bottom-0 z-40 border-t bg-[#050505] pb-[env(safe-area-inset-bottom)] md:hidden'
    >
      <ul className='grid grid-cols-5'>
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.match)
          const TabIcon = tab.icon

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <TabIcon className='size-[22px]' aria-hidden='true' />
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default MobileTabBar
