// Type Imports
import type { ReactNode } from 'react'

// Component Imports
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Statistics card data type
type StatisticsCardProps = {
  value: string | number
  title: string
  subtitle?: string
  comparison?: ReactNode
  details?: ReactNode
  className?: string
}

const StatisticsCard = ({
  value,
  title,
  subtitle = 'ultimele 30 de zile',
  comparison,
  details,
  className
}: StatisticsCardProps) => {
  return (
    <Card className={`border-border/80 bg-card gap-0 py-0 shadow-sm ${className ?? ''}`}>
      <CardHeader className='flex flex-row items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>{title}</span>
        </div>
        <p className='text-muted-foreground text-xs'>{subtitle}</p>
      </CardHeader>
      <CardContent className='flex flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5'>
        <div className='bg-muted/40 border-border/70 flex items-center justify-between gap-3 rounded-lg border px-3 py-3'>
          <div className='flex items-baseline gap-2'>
            <span className='text-4xl leading-none font-bold tracking-tight'>{value}</span>
            <span className='text-muted-foreground text-xs font-medium'>rezervări</span>
          </div>
          {comparison}
        </div>
        {details}
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
