'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'

import { logout } from '@/lib/auth'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type ProfileUser = {
  fullName: string
  email: string
  imageUrl: string
  initials: string
}

const ProfileDropdown = ({ user }: { user: ProfileUser }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant='ghost' size='icon' className='relative rounded-full hover:bg-transparent' />}
      >
        <Avatar>
          <AvatarImage src={user.imageUrl} alt={user.fullName} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-72 max-w-[calc(100vw-2rem)]'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center gap-4 px-2 py-2.5 font-normal'>
            <div className='relative shrink-0'>
              <Avatar className='size-10'>
                <AvatarImage src={user.imageUrl} alt={user.fullName} />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
            </div>
            <div className='flex min-w-0 flex-1 flex-col items-start'>
              <span className='text-foreground max-w-full truncate text-base font-semibold'>{user.fullName}</span>
              <span className='text-muted-foreground max-w-full text-sm break-all'>{user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href='/pages/user-profile?view=profile' />}>
            <UserIcon />
            <span>Contul meu</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href='/pages/user-settings?setting=general' />}>
            <SettingsIcon />
            <span>Setări</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <form action={logout}>
            <DropdownMenuItem variant='destructive' render={<button type='submit' />}>
              <LogOutIcon />
              <span>Deconectare</span>
            </DropdownMenuItem>
          </form>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
