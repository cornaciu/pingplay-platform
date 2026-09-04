import { CalendarClockIcon, CalendarDaysIcon, MailIcon, PhoneIcon, ShapesIcon, TagIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCalendlyBookingsLast30Days, getCalendlyCurrentBookings, getCalendlyFutureBookings } from '@/lib/calendly'
import { getStripeRevenueLast30Days } from '@/lib/stripe'

import SalesMetricsCard from '@/views/dashboards/charts/chart-sales-metrics'
import TableAvailabilityPanel from '@/views/dashboards/rezervari/table-availability-panel'
import StatisticsCard from '@/views/dashboards/statistics/statistics-card-01'

const DASHBOARD_EVENT_TYPES = [
  { value: 'masa1', label: 'MASA 1', icon: CalendarDaysIcon },
  { value: 'masa2', label: 'MASA 2', icon: ShapesIcon }
] as const

const CALENDLY_EVENT_TYPE_LABELS: Record<string, string> = {
  'https://api.calendly.com/event_types/2fa1f3d1-311a-4605-b4f7-40ef071cba5e': 'Masa 1 - 30 minute',
  'https://api.calendly.com/event_types/c32e6a06-b625-4dd3-8f45-3f9ae299a488': 'Masa 1 - 1 ora',
  'https://api.calendly.com/event_types/9a1b291a-a500-4f80-8b73-582f3619cf73': 'Masa 1 - 1 ora si 30 minute',
  'https://api.calendly.com/event_types/2698c02e-093f-407d-8058-bed4c40d6ca6': 'Masa 1 - 2 ore',
  'https://api.calendly.com/event_types/5e6303f1-effc-4b41-ada3-c679376557af': 'Masa 2 - 30 minute',
  'https://api.calendly.com/event_types/74540ed4-4521-45ef-919d-71a6c4c4f609': 'Masa 2 - 1 ora',
  'https://api.calendly.com/event_types/e6dc2775-44a8-4976-9acb-6c4ea5375987': 'Masa 2 - 1 ora si 30 minute',
  'https://api.calendly.com/event_types/1b2eba10-7783-4523-a2aa-f3255e7a9a5a': 'Masa 2 - 2 ore',
  'https://api.calendly.com/event_types/628d387d-7da8-4a2c-ba07-22dc17cc7d8a': 'Ambele mese - 30 minute',
  'https://api.calendly.com/event_types/d5b6759a-caa0-45a7-bdc7-be72ec5fbd37': 'Ambele mese - 1 ora',
  'https://api.calendly.com/event_types/59924205-14fe-470d-aff2-72ece2dccf75': 'Ambele mese - 1 ora si 30 minute',
  'https://api.calendly.com/event_types/ab65dbda-ea1e-4702-8b7d-d743da8a7df2': 'Ambele mese - 2 ore'
}

const formatBookingDate = (date: string) =>
  new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Bucharest'
  }).format(new Date(date))

// Transaction table data

const OrdersDashboard = async () => {
  const bookingStats = await getCalendlyBookingsLast30Days(DASHBOARD_EVENT_TYPES.map(eventType => eventType.value))

  const futureBookings = await Promise.all(
    DASHBOARD_EVENT_TYPES.map(async eventType => ({
      eventType: eventType.value,
      bookings: await getCalendlyFutureBookings(eventType.value)
    }))
  )

  const currentBookings = await Promise.all(
    DASHBOARD_EVENT_TYPES.map(async eventType => ({
      eventType: eventType.value,
      bookings: await getCalendlyCurrentBookings(eventType.value)
    }))
  )

  const currentReservations = currentBookings
    .flatMap(({ eventType, bookings }) =>
      (bookings?.reservations ?? []).map(reservation => ({
        ...reservation,
        table: DASHBOARD_EVENT_TYPES.find(item => item.value === eventType)?.label ?? eventType
      }))
    )
    .sort((first, second) => new Date(first.startTime).getTime() - new Date(second.startTime).getTime())

  const stripeRevenueStats = await getStripeRevenueLast30Days()

  return (
    <div className='grid grid-cols-2 gap-6 lg:grid-cols-3'>
      {/* Statistics Cards */}
      <div className='col-span-full grid gap-6 lg:col-span-2'>
        {DASHBOARD_EVENT_TYPES.map(eventType => {
          const bookingStatsForEventType = bookingStats.bookings.find(item => item.eventType === eventType.value)
          const bookingCount = bookingStatsForEventType?.count
          const previousBookingCount = bookingStatsForEventType?.previousCount

          const bookingChangePercent =
            bookingCount !== null &&
            bookingCount !== undefined &&
            previousBookingCount !== null &&
            previousBookingCount !== undefined
              ? previousBookingCount === 0
                ? null
                : Math.round(((bookingCount - previousBookingCount) / previousBookingCount) * 100)
              : null

          const futureBookingsForEventType = futureBookings.find(item => item.eventType === eventType.value)?.bookings

          return (
            <StatisticsCard
              key={eventType.value}
              title={eventType.label}
              value={bookingCount ?? '-'}
              comparison={
                <div className='text-right text-xs'>
                  <span className='text-muted-foreground block'>față de luna trecută</span>
                  <span
                    className={
                      bookingChangePercent === null
                        ? ''
                        : bookingChangePercent > 0
                          ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                          : bookingChangePercent < 0
                            ? 'text-destructive font-semibold'
                            : 'font-semibold'
                    }
                  >
                    {bookingChangePercent === null
                      ? previousBookingCount === 0 && bookingCount && bookingCount > 0
                        ? 'rezervări noi'
                        : '-'
                      : `${bookingChangePercent > 0 ? '+' : ''}${bookingChangePercent}%`}
                  </span>
                </div>
              }
              className={
                eventType.value === 'masa1'
                  ? 'border-emerald-500/60 bg-emerald-100/70 dark:border-emerald-400/50 dark:bg-emerald-900/40'
                  : 'border-blue-500/60 bg-blue-100/70 dark:border-blue-400/50 dark:bg-blue-900/40'
              }
              details={
                <div className='mt-3 flex flex-col gap-3 text-xs'>
                  <div className='flex flex-wrap gap-2'>
                    <span className='border-border bg-muted/60 text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium'>
                      Reprogramate <strong>{bookingStatsForEventType?.rescheduled ?? '-'}</strong>
                    </span>
                    <span className='border-border bg-muted/60 text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium'>
                      Anulate <strong>{bookingStatsForEventType?.canceled ?? '-'}</strong>
                    </span>
                  </div>
                  <div className='border-border/60 border-t pt-3'>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-foreground flex items-center gap-1.5 font-semibold'>
                        <CalendarClockIcon className='text-primary size-3.5' />
                        Rezervări viitoare
                      </span>
                      <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 font-bold'>
                        {futureBookingsForEventType?.count ?? '-'}
                      </span>
                    </div>
                    <div className='flex max-h-72 flex-col gap-2 overflow-y-auto pr-1'>
                      {futureBookingsForEventType?.reservations.map(reservation => (
                        <div
                          key={`${reservation.eventTypeUri}-${reservation.startTime}`}
                          className='bg-muted/40 border-border/60 grid gap-4 rounded-md border p-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,auto)]'
                        >
                          <div className='min-w-0'>
                            <span className='text-foreground flex items-start gap-2 text-base leading-6 font-semibold'>
                              <CalendarDaysIcon className='text-primary mt-0.5 size-4 shrink-0' />
                              {formatBookingDate(reservation.startTime)}
                            </span>
                            <span className='text-muted-foreground mt-2 flex items-start gap-2 text-sm leading-5'>
                              <TagIcon className='mt-0.5 size-3.5 shrink-0' />
                              {CALENDLY_EVENT_TYPE_LABELS[reservation.eventTypeUri] ?? 'Event type necunoscut'}
                            </span>
                          </div>
                          <div className='border-border/60 border-t pt-3 text-sm md:border-t-0 md:border-l md:pt-0 md:pl-4'>
                            <span className='text-foreground block text-base font-semibold'>
                              {reservation.clientName ?? 'Client necunoscut'}
                            </span>
                            {reservation.clientEmail && (
                              <span className='text-muted-foreground mt-2 flex items-start gap-2 text-sm break-all'>
                                <MailIcon className='mt-0.5 size-3.5 shrink-0' />
                                <span>{reservation.clientEmail}</span>
                              </span>
                            )}
                            {reservation.clientPhone && (
                              <span className='text-muted-foreground mt-1 flex items-center gap-2 text-sm'>
                                <PhoneIcon className='size-3.5 shrink-0' />
                                {reservation.clientPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              }
            />
          )
        })}
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Rezervări curente</CardTitle>
          </CardHeader>
          <CardContent className='w-full'>
            <div className='grid w-full min-w-0 gap-3'>
              {currentReservations.map(reservation => (
                <div
                  key={`${reservation.table}-${reservation.eventTypeUri}-${reservation.startTime}`}
                  className='bg-muted/40 border-border/60 grid w-full min-w-0 gap-3 rounded-md border p-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,auto)]'
                >
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                      <span className='text-foreground flex items-center gap-1.5 font-semibold'>
                        <CalendarDaysIcon className='text-primary size-4 shrink-0' />
                        {formatBookingDate(reservation.startTime)}
                      </span>
                    </div>
                    <span className='text-muted-foreground mt-2 flex items-center gap-1.5 truncate text-sm'>
                      <TagIcon className='size-3.5 shrink-0' />
                      {CALENDLY_EVENT_TYPE_LABELS[reservation.eventTypeUri] ?? 'Event type necunoscut'}
                    </span>
                  </div>
                  <div className='border-border/60 text-sm sm:border-l sm:pl-4'>
                    <span className='text-foreground block font-semibold'>
                      {reservation.clientName ?? 'Client necunoscut'}
                    </span>
                    {reservation.clientEmail && (
                      <span className='text-muted-foreground mt-1 flex items-center gap-1.5'>
                        <MailIcon className='size-3.5 shrink-0' />
                        <span className='max-w-52 truncate'>{reservation.clientEmail}</span>
                      </span>
                    )}
                    {reservation.clientPhone && (
                      <span className='text-muted-foreground flex items-center gap-1.5'>
                        <PhoneIcon className='size-3.5 shrink-0' />
                        {reservation.clientPhone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {currentReservations.length === 0 && (
                <p className='text-muted-foreground text-sm'>Nu există rezervări curente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TableAvailabilityPanel />

      <SalesMetricsCard revenueStats={stripeRevenueStats} className='col-span-full w-full' />
    </div>
  )
}

export default OrdersDashboard
