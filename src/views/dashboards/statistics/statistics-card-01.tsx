// Type Imports
import type { ReactNode } from 'react'

import { CircleHelpIcon } from 'lucide-react'

// Component Imports
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Statistics card data type
type StatisticsCardProps = {
  icon: ReactNode
  value: string | number
  title: string
  subtitle?: string
  details?: ReactNode
  className?: string
}

const StatisticsCard = ({
  icon,
  value,
  title,
  subtitle = 'ultimele 30 de zile',
  details,
  className
}: StatisticsCardProps) => {
  return (
    <Card className={`border-border/80 bg-card gap-0 py-0 shadow-sm ${className ?? ''}`}>
      <CardHeader className='flex flex-row items-center gap-2 px-4 pt-4 pb-2 sm:px-5 sm:pt-5'>
        <span className='text-sm font-semibold'>{title}</span>
        <CircleHelpIcon className='text-muted-foreground size-4' />
      </CardHeader>
      <CardContent className='flex flex-col gap-1 px-4 pb-4 sm:px-5 sm:pb-5'>
        <div className='flex items-center gap-3'>
          <span className='text-4xl leading-none font-bold tracking-tight'>{value}</span>
          <div className='text-primary/80 bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-sm'>
            {icon}
          </div>
        </div>
        <p className='text-muted-foreground text-xs'>{subtitle}</p>
        {details}
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
