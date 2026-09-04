import 'server-only'

type StripeCharge = {
  id: string
  amount: number
  amount_refunded: number
  balance_transaction?: string | { fee: number }
  currency: string
  created: number
  paid: boolean
  status: string
}

type StripeListResponse = {
  data?: StripeCharge[]
  has_more?: boolean
}

export type StripeRevenueStats = {
  revenue: number | null
  netRevenue: number | null
  fees: number | null
  transactions: number | null
  averagePayment: number | null
  refunds: number | null
  currency: string | null
  dailyRevenue: { date: string; amount: number }[]
}

const STRIPE_API_URL = 'https://api.stripe.com/v1/charges'
const REVENUE_DAYS = 30
const REVENUE_TIME_ZONE = 'Europe/Bucharest'

const formatDateInTimeZone = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: REVENUE_TIME_ZONE
  }).format(date)

const addDaysToDateKey = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T12:00:00Z`)

  date.setUTCDate(date.getUTCDate() + days)

  return date.toISOString().slice(0, 10)
}

export const getStripeRevenueLast30Days = async (): Promise<StripeRevenueStats> => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  const emptyStats: StripeRevenueStats = {
    revenue: null,
    netRevenue: null,
    fees: null,
    transactions: null,
    averagePayment: null,
    refunds: null,
    currency: null,
    dailyRevenue: []
  }

  if (!secretKey) return emptyStats

  const now = new Date()
  const firstRevenueDate = new Date(now.getTime() - REVENUE_DAYS * 24 * 60 * 60 * 1000)

  const nowTimestamp = Math.floor(now.getTime() / 1000)
  const firstRevenueTimestamp = Math.floor(firstRevenueDate.getTime() / 1000)
  const charges: StripeCharge[] = []
  let startingAfter: string | undefined

  try {
    do {
      const url = new URL(STRIPE_API_URL)

      url.searchParams.set('limit', '100')
      url.searchParams.set('created[gte]', String(firstRevenueTimestamp))
      url.searchParams.set('created[lte]', String(nowTimestamp))
      url.searchParams.append('expand[]', 'data.balance_transaction')

      if (startingAfter) url.searchParams.set('starting_after', startingAfter)

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: 'no-store'
      })

      if (!response.ok) throw new Error(`Stripe API returned ${response.status}`)

      const data = (await response.json()) as StripeListResponse

      charges.push(...(data.data ?? []))

      startingAfter = data.has_more ? charges.at(-1)?.id : undefined
    } while (startingAfter)

    const successfulCharges = charges.filter(charge => charge.paid && charge.status === 'succeeded')
    const currency = successfulCharges[0]?.currency ?? null
    const revenue = successfulCharges.reduce((total, charge) => total + charge.amount, 0)
    const refunds = successfulCharges.reduce((total, charge) => total + charge.amount_refunded, 0)

    const fees = successfulCharges.reduce((total, charge) => {
      const balanceTransaction = charge.balance_transaction

      return total + (typeof balanceTransaction === 'object' ? balanceTransaction.fee : 0)
    }, 0)

    const netRevenue = revenue - refunds - fees

    const dailyTotals = successfulCharges.reduce<Record<string, number>>((totals, charge) => {
      const date = formatDateInTimeZone(new Date(charge.created * 1000))

      totals[date] = (totals[date] ?? 0) + charge.amount

      return totals
    }, {})

    const lastRevenueDate = formatDateInTimeZone(now)
    const firstRevenueDateKey = addDaysToDateKey(lastRevenueDate, -(REVENUE_DAYS - 1))
    const dailyRevenue = Array.from({ length: REVENUE_DAYS }, (_, index) => {
      const formattedDate = addDaysToDateKey(firstRevenueDateKey, index)

      return { date: formattedDate, amount: dailyTotals[formattedDate] ?? 0 }
    })

    return {
      revenue,
      netRevenue,
      fees,
      transactions: successfulCharges.length,
      averagePayment: successfulCharges.length > 0 ? Math.round(revenue / successfulCharges.length) : 0,
      refunds,
      currency,
      dailyRevenue
    }
  } catch {
    return emptyStats
  }
}
