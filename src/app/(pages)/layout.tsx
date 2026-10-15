// React Imports
import { Suspense } from 'react'
import type { ReactNode } from 'react'

// Component Imports
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { requireAuth } from '@/lib/auth'
import SessionRefresh from '@/components/auth/session-refresh'

// Authenticated pages must be rendered per request, never during a static build.
export const dynamic = 'force-dynamic'

const PagesLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const user = await requireAuth()

  return (
    <div className='flex h-full w-full min-w-0'>
      <SessionRefresh />
      <Suspense>
        <Sidebar />
      </Suspense>
      <SidebarInset className='bg-background flex min-w-0 flex-1 flex-col'>
        <Header user={user} />
        <main className='mx-auto size-full max-w-360 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>{children}</main>
        <Toaster />
        <Footer />
      </SidebarInset>
    </div>
  )
}

export default PagesLayout
