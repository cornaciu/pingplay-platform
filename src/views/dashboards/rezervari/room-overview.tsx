import Link from 'next/link'

import { cn } from '@/lib/utils'

import LocationStatusChips from '@/views/dashboards/rezervari/location-status-chips'

type Booking = {
  eventUri?: string
  startTime: string
  endTime: string
  eventTypeUri: string
  clientName: string | null
  clientPhone: string | null
}

type TableKey = 'masa1' | 'masa2'

type TableBookings = { eventType: string; bookings: { reservations: Booking[] } | null }

const TIMEZONE = 'Europe/Bucharest'

// Masa 1 is green and Masa 2 is blue everywhere in the app.
const TABLES: Record<TableKey, { label: string; dot: string; text: string; tile: string; track: string; bar: string }> =
  {
    masa1: {
      label: 'Masa 1',
      dot: 'bg-emerald-400',
      text: 'text-emerald-300',
      tile: 'border-emerald-500/30 bg-emerald-500/10',
      track: 'bg-emerald-500/20',
      bar: 'bg-emerald-400'
    },
    masa2: {
      label: 'Masa 2',
      dot: 'bg-blue-400',
      text: 'text-blue-300',
      tile: 'border-blue-500/30 bg-blue-500/10',
      track: 'bg-blue-500/20',
      bar: 'bg-blue-400'
    }
  }

const dayKey = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(date)

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('ro-RO', { timeStyle: 'short', timeZone: TIMEZONE }).format(new Date(value))

const formatWhen = (value: string, now: Date) => {
  const date = new Date(value)

  if (dayKey(date) === dayKey(now)) return formatTime(value)

  const day = new Intl.DateTimeFormat('ro-RO', { day: '2-digit', month: '2-digit', timeZone: TIMEZONE }).format(date)

  return `${day}, ${formatTime(value)}`
}

const formatDuration = (startTime: string, endTime: string) => {
  const minutes = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours === 0) return `${minutes} min`
  if (rest === 0) return hours === 1 ? '1 oră' : `${hours} ore`

  return `${hours} h ${rest} min`
}

const bookingKey = (booking: Booking) => booking.eventUri ?? `${booking.eventTypeUri}-${booking.startTime}`

const byStart = (first: Booking, second: Booking) => first.startTime.localeCompare(second.startTime)

const RoomOverview = ({
  currentBookings,
  futureBookings,
  eventTypeLabels
}: {
  currentBookings: TableBookings[]
  futureBookings: TableBookings[]
  eventTypeLabels: Record<string, string>
}) => {
  const now = new Date()
  const isBothTables = (booking: Booking) => eventTypeLabels[booking.eventTypeUri]?.startsWith('Ambele') ?? false

  const listFor = (source: TableBookings[], table: TableKey) => {
    const own = source.find(item => item.eventType === table)?.bookings?.reservations ?? []
    const shared = source.flatMap(item => item.bookings?.reservations ?? []).filter(isBothTables)
    const unique = new Map([...own, ...shared].map(booking => [bookingKey(booking), booking]))

    return [...unique.values()].sort(byStart)
  }

  const tableOf = (booking: Booking): TableKey | 'ambele' => {
    if (isBothTables(booking)) return 'ambele'

    return futureBookings.find(item => item.eventType === 'masa2')?.bookings?.reservations.includes(booking)
      ? 'masa2'
      : 'masa1'
  }

  const upcoming = [
    ...new Map(
      futureBookings.flatMap(item => item.bookings?.reservations ?? []).map(booking => [bookingKey(booking), booking])
    ).values()
  ]
    .sort(byStart)
    .slice(0, 5)

  const today = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIMEZONE })
    .format(now)
    .replace(/^./, letter => letter.toUpperCase())

  return (
    <section className='flex min-w-0 flex-col gap-5' aria-labelledby='sala-acum'>
      <div className='flex flex-col gap-1'>
        <span className='text-muted-foreground text-sm'>{today}</span>
        <h2 id='sala-acum' className='text-2xl font-semibold tracking-tight sm:text-3xl'>
          Sala acum
        </h2>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        {(Object.keys(TABLES) as TableKey[]).map(table => {
          const style = TABLES[table]
          const current = listFor(currentBookings, table)[0]
          const next = listFor(futureBookings, table)[0]

          const progress = current
            ? Math.min(
                100,
                Math.max(
                  0,
                  ((now.getTime() - new Date(current.startTime).getTime()) /
                    (new Date(current.endTime).getTime() - new Date(current.startTime).getTime())) *
                    100
                )
              )
            : 0

          return (
            <div key={table} className={cn('flex min-w-0 flex-col gap-2.5 rounded-2xl border p-4', style.tile)}>
              <span className={cn('flex items-center gap-2 text-xs font-bold tracking-[0.14em] uppercase', style.text)}>
                <span className={cn('size-2.5 rounded-full', style.dot)} aria-hidden='true' />
                {style.label}
              </span>
              <span className='text-2xl font-semibold tracking-tight'>{current ? 'Ocupată' : 'Liberă'}</span>
              <div className={cn('h-1.5 overflow-hidden rounded-full', style.track)} aria-hidden='true'>
                <div className={cn('h-full rounded-full', style.bar)} style={{ width: `${progress}%` }} />
              </div>
              <span className='text-muted-foreground line-clamp-2 text-[13px]'>
                {current
                  ? `Până la ${formatTime(current.endTime)}${current.clientName ? ` · ${current.clientName}` : ''}`
                  : next
                    ? `Următoarea: ${formatWhen(next.startTime, now)}`
                    : 'Nicio rezervare programată'}
              </span>
            </div>
          )
        })}
      </div>

      <LocationStatusChips />

      <div className='flex flex-col gap-2.5'>
        <div className='flex items-baseline justify-between gap-3'>
          <h3 className='text-lg font-semibold'>Următoarele rezervări</h3>
          <Link href='/apps/reservations' className='text-primary text-sm hover:underline'>
            Toate
          </Link>
        </div>
        {upcoming.map(booking => {
          const table = tableOf(booking)

          return (
            <div
              key={bookingKey(booking)}
              className='bg-card flex min-w-0 items-center gap-3.5 rounded-2xl border px-3.5 py-3'
            >
              <div className='flex w-16 shrink-0 flex-col'>
                <span className='text-lg font-semibold tabular-nums'>{formatWhen(booking.startTime, now)}</span>
                <span className='text-muted-foreground text-xs'>
                  {formatDuration(booking.startTime, booking.endTime)}
                </span>
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='truncate font-medium'>{booking.clientName ?? 'Client necunoscut'}</span>
                {booking.clientPhone && (
                  <a
                    href={`tel:${booking.clientPhone}`}
                    className='text-muted-foreground hover:text-foreground truncate text-[13px]'
                  >
                    {booking.clientPhone}
                  </a>
                )}
              </div>
              <span className='bg-secondary inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold'>
                <span className='flex gap-0.5' aria-hidden='true'>
                  {table !== 'masa2' && <span className='size-2 rounded-full bg-emerald-400' />}
                  {table !== 'masa1' && <span className='size-2 rounded-full bg-blue-400' />}
                </span>
                {table === 'ambele' ? 'AMBELE' : TABLES[table].label.toUpperCase()}
              </span>
            </div>
          )
        })}
        {upcoming.length === 0 && <p className='text-muted-foreground text-sm'>Nu sunt rezervări programate.</p>}
      </div>
    </section>
  )
}

export default RoomOverview
