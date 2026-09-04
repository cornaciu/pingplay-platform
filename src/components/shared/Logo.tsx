// Config Imports
import Image from 'next/image'

// Next Imports

// Util Imports
import { cn } from '@/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex w-full items-center justify-center gap-2.5', className)}>
      <Image
        src='https://pingplay.ro/wp-content/uploads/2026/01/tenis-de-masa-timisoara-scaled-e1768661867958.png'
        alt='PingPlay'
        width={180}
        height={48}
        className='h-24 w-auto object-contain'
      />
    </div>
  )
}

export default Logo
