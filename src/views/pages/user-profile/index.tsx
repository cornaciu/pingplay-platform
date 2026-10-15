import Link from 'next/link'
import { MailIcon, SettingsIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAuth } from '@/lib/auth'

const UserProfile = async () => {
  const user = await requireAuth()

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-primary mb-2 text-xs font-semibold tracking-widest uppercase'>Contul tău</p>
        <h1 className='text-3xl font-semibold tracking-tight'>Profil</h1>
      </div>
      <Card>
        <CardContent className='flex flex-wrap items-center gap-5'>
          <Avatar className='size-20'>
            <AvatarFallback className='bg-primary/15 text-2xl font-semibold text-[#ffacc8]'>
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <h2 className='text-2xl font-semibold'>{user.fullName}</h2>
            <p className='text-muted-foreground mt-2 flex items-center gap-2 break-all'>
              <MailIcon className='size-4 shrink-0' />
              {user.email}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Setările contului</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href='/pages/user-settings?setting=general'
            className='hover:bg-accent inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium'
          >
            <SettingsIcon className='text-primary size-4' /> Deschide setările
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserProfile
