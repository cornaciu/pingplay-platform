'use client'

// Next Imports
import { Fragment } from 'react'

import { usePathname } from 'next/navigation'

// Component Imports
import ModeToggle from '@/components/layout/ModeToggle'
import ProfileDropdown from '@/components/shared/ProfileDropdown'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderUser = {
  fullName: string
  email: string
  imageUrl: string
  initials: string
}

const Header = ({ user }: { user: HeaderUser }) => {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)

  return (
    <header className='bg-card/85 sticky top-0 z-40 border-b backdrop-blur-xl'>
      <div className='mx-auto flex max-w-360 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-4'>
          <SidebarTrigger className='[&_svg]:size-5!' />
          <Separator orientation='vertical' className='hidden h-4! data-vertical:self-center sm:block' />
          <Breadcrumb className='hidden sm:block'>
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const isLast = index === segments.length - 1

                const labels: Record<string, string> = {
                  dashboard: 'Dashboard',
                  rezervari: 'Privire de ansamblu',
                  apps: 'Aplicații',
                  reservations: 'Rezervări',
                  calendar: 'Calendar',
                  users: 'Clienți',
                  list: 'Listă',
                  view: 'Detalii',
                  pages: 'Cont',
                  'user-settings': 'Setări',
                  'user-profile': 'Profil'
                }

                const label = labels[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                const href = '/' + segments.slice(0, index + 1).join('/')

                return (
                  <Fragment key={href}>
                    <BreadcrumbItem>
                      {isLast ? <BreadcrumbPage>{label}</BreadcrumbPage> : <BreadcrumbLink>{label}</BreadcrumbLink>}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className='flex items-center gap-1.5'>
          <ModeToggle />
          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  )
}

export default Header
