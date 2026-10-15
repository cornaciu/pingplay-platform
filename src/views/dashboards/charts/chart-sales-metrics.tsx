'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartNoAxesCombinedIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { StripeRevenueStats } from '@/lib/stripe'

const revenueChartConfig = {
  revenue: { label: 'Venituri brute', color: '#E83471' }
} satisfies ChartConfig

const SalesMetricsCard = ({ revenueStats, className }: { revenueStats: StripeRevenueStats; className?: string }) => {
  const currency = revenueStats.currency?.toUpperCase() ?? 'RON'

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('ro-RO', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)

  const formatMetric = (amount: number | null) => (amount === null ? 'Indisponibil' : formatAmount(amount / 100))

  const formatDate = (date: string) => {
    const [, month, day] = date.split('-')

    return `${day}.${month}`
  }

  const metrics = [
    { title: 'Venituri brute', value: formatMetric(revenueStats.revenue) },
    { title: 'Venituri nete', value: formatMetric(revenueStats.netRevenue) },
    { title: 'Rambursări', value: formatMetric(revenueStats.refunds) },
    { title: 'Comisioane Stripe', value: formatMetric(revenueStats.fees) },
    { title: 'Plată medie', value: formatMetric(revenueStats.averagePayment) },
    { title: 'Tranzacții reușite', value: revenueStats.transactions ?? 'Indisponibil' }
  ]

  const data = revenueStats.dailyRevenue.map(item => ({ date: item.date, revenue: item.amount / 100 }))
  const ticks = data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map(item => item.date)
  const available = revenueStats.revenue !== null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-xl font-semibold'>
          <ChartNoAxesCombinedIcon className='text-primary size-5' /> Venituri
        </CardTitle>
        <p className='text-muted-foreground text-sm'>Stripe · ultimele 30 de zile · {currency}</p>
      </CardHeader>
      <CardContent className='min-w-0 space-y-6'>
        <dl className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {metrics.map(metric => (
            <div key={metric.title} className='min-w-0 rounded-xl border p-4'>
              <dt className='text-muted-foreground text-sm'>{metric.title}</dt>
              <dd className='text-foreground mt-2 text-2xl font-semibold tracking-tight tabular-nums'>
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
        {available && data.length > 0 ? (
          <>
            <h3 className='font-semibold'>Venituri brute pe zi ({currency})</h3>
            <p className='text-muted-foreground text-xs sm:hidden'>
              Glisează graficul lateral pentru toate zilele. Atinge o bară pentru sumă.
            </p>
            <div className='max-w-full overflow-x-auto overscroll-x-contain rounded-xl border p-3'>
              <ChartContainer config={revenueChartConfig} className='aspect-auto h-80 w-full min-w-160 sm:h-96'>
                <BarChart accessibilityLayer data={data} margin={{ top: 16, right: 16, bottom: 8, left: 4 }}>
                  <CartesianGrid vertical={false} stroke='#303036' strokeDasharray='3 4' />
                  <XAxis
                    dataKey='date'
                    ticks={ticks}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDate}
                    tickMargin={14}
                    height={40}
                    tick={{ fontSize: 13, fill: '#d4d4dc' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickMargin={10}
                    tickCount={5}
                    tickFormatter={value =>
                      new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Number(value))
                    }
                    tick={{ fontSize: 13, fill: '#d4d4dc' }}
                  />
                  <ChartTooltip
                    cursor={{ fill: '#ffffff0d' }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={value => formatDate(String(value))}
                        formatter={value => formatAmount(Number(value))}
                      />
                    }
                  />
                  <Bar dataKey='revenue' fill='var(--color-revenue)' radius={[5, 5, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ChartContainer>
            </div>
            <details className='rounded-xl border p-4'>
              <summary className='cursor-pointer text-sm font-medium text-[#ffacc8]'>Vezi valorile zilnice</summary>
              <div className='mt-4 max-h-72 overflow-auto'>
                <table className='w-full text-left text-sm'>
                  <caption className='sr-only'>Venituri brute zilnice în {currency}</caption>
                  <thead className='text-muted-foreground sticky top-0 bg-black'>
                    <tr>
                      <th scope='col' className='py-2'>
                        Data
                      </th>
                      <th scope='col' className='py-2 text-right'>
                        Venituri brute
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(item => (
                      <tr key={item.date} className='border-t'>
                        <th scope='row' className='py-2 font-normal'>
                          {formatDate(item.date)}
                        </th>
                        <td className='py-2 text-right tabular-nums'>{formatAmount(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        ) : (
          <p role='status' className='text-muted-foreground rounded-xl border border-dashed p-6 text-sm'>
            Veniturile nu au putut fi încărcate. Verifică integrarea Stripe și reîncarcă pagina.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default SalesMetricsCard
