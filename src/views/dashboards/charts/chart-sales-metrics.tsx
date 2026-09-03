'use client'

// Third-party Imports
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { TrendingUpIcon, BadgePercentIcon, DollarSignIcon, ShoppingBagIcon } from 'lucide-react'

// Component Imports
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { StripeRevenueStats } from '@/lib/stripe'

const revenueChartConfig = {
  sales: {
    label: 'Sales'
  },
  january: {
    label: 'January',
    color: 'var(--primary)'
  },
  february: {
    label: 'February',
    color: 'color-mix(in oklab, var(--primary) 60%, transparent)'
  },
  march: {
    label: 'March',
    color: 'color-mix(in oklab, var(--primary) 20%, transparent)'
  }
} satisfies ChartConfig

const formatCurrency = (amount: number | null, currency: string | null) => {
  if (amount === null || !currency) return '-'

  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100)
}

const formatRon = (amount: number) =>
  new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(amount)

const formatChartValue = (amount: number) =>
  `${new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(amount)} RON`

const formatChartDate = (date: string) => {
  const [, month, day] = date.split('-')

  return `${day}.${month}`
}

const SalesMetricsCard = ({ revenueStats, className }: { revenueStats: StripeRevenueStats; className?: string }) => {
  const metricsData = [
    {
      icons: <TrendingUpIcon className='size-5' />,
      title: 'Venituri brute',
      value: formatCurrency(revenueStats.revenue, revenueStats.currency)
    },
    {
      icons: <DollarSignIcon className='size-5' />,
      title: 'Venituri nete',
      value: formatCurrency(revenueStats.netRevenue, revenueStats.currency)
    },
    {
      icons: <BadgePercentIcon className='size-5' />,
      title: 'Refunduri',
      value: formatCurrency(revenueStats.refunds, revenueStats.currency)
    },
    {
      icons: <BadgePercentIcon className='size-5' />,
      title: 'Comisioane Stripe',
      value: formatCurrency(revenueStats.fees, revenueStats.currency)
    },
    {
      icons: <DollarSignIcon className='size-5' />,
      title: 'Plată medie',
      value: formatCurrency(revenueStats.averagePayment, revenueStats.currency)
    },
    {
      icons: <ShoppingBagIcon className='size-5' />,
      title: 'Tranzacții reușite',
      value: revenueStats.transactions ?? '-'
    }
  ]

  const revenueChartData = revenueStats.dailyRevenue.map(item => ({
    month: item.date,
    sales: item.amount / 100,
    fill: 'var(--primary)'
  }))

  return (
    <Card className={className}>
      <CardContent>
        <div className='grid items-start gap-6 lg:grid-cols-5'>
          <div className='flex min-w-0 flex-col gap-5 lg:col-span-2'>
            <div className='flex items-center gap-3'>
              <img src='/images/brands/logo-square.webp' className='size-10.5 rounded-lg' alt='logo' />
              <div className='flex flex-col gap-0.5'>
                <span className='text-xl font-medium'>Stripe</span>
                <span className='text-muted-foreground text-sm'>Venituri din ultimele 30 de zile</span>
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              {metricsData.map((metric, index) => (
                <Card key={index} className='ring-foreground/10 py-2 shadow-none ring-1'>
                  <CardContent className='flex items-center gap-3 px-4'>
                    <Avatar className='rounded-sm after:border-0'>
                      <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-sm'>
                        {metric.icons}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-muted-foreground text-sm font-medium'>{metric.title}</span>
                      <span className='text-lg font-medium'>{metric.value}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className='ring-foreground/10 flex h-full min-w-0 flex-col gap-4 shadow-none ring-1 lg:col-span-3'>
            <CardHeader className='gap-1'>
              <CardTitle className='text-lg font-semibold'>Venituri brute (RON)</CardTitle>
            </CardHeader>

            <CardContent className='flex min-w-0 flex-1 flex-col space-y-4'>
              <ChartContainer config={revenueChartConfig} className='min-h-64 w-full flex-1'>
                <BarChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' />
                  <XAxis
                    dataKey='month'
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatChartDate}
                    interval={0}
                    angle={-45}
                    textAnchor='end'
                    height={50}
                    tickMargin={10}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => formatChartValue(Number(value))}
                    width={92}
                    tickMargin={6}
                    tick={{ fontSize: 14 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel formatter={value => formatRon(Number(value))} />}
                  />
                  <Bar dataKey='sales' fill='var(--primary)' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export default SalesMetricsCard
