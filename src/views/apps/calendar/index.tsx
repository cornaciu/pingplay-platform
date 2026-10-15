'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ro } from 'date-fns/locale'

// Third-party Imports
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks
} from 'date-fns'
import {
  CalendarCheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  RefreshCwIcon
} from 'lucide-react'

import type { CalendarEvent, CalendarView } from '@/types/apps/calendar-types'

// Component Imports
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DayView } from './day-view'
import { MonthView } from './month-view'
import { WeekView } from './week-view'

// Util Imports
import { cn } from '@/lib/utils'

// Data Imports
import { EventGap, EventHeight, WeekCellsHeight } from '@/assets/data/constants'

export interface EventCalendarProps {
  className?: string
  initialView?: CalendarView
  events?: CalendarEvent[]
  error?: string
  notice?: string
}

export function EventCalendar({ className, initialView = 'month', events = [], error, notice }: EventCalendarProps) {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const createHref = '/dashboard/rezervari#creare-rezervare'
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [view, setView] = useState<CalendarView>(initialView)

  const goToToday = () => setCurrentDate(new Date())

  const goToPrevious = () =>
    setCurrentDate(current =>
      view === 'month' ? subMonths(current, 1) : view === 'week' ? subWeeks(current, 1) : addDays(current, -1)
    )

  const goToNext = () =>
    setCurrentDate(current =>
      view === 'month' ? addMonths(current, 1) : view === 'week' ? addWeeks(current, 1) : addDays(current, 1)
    )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.key.toLowerCase() === 'm') setView('month')
      if (event.key.toLowerCase() === 'w') setView('week')
      if (event.key.toLowerCase() === 'd') setView('day')
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const viewTitle = useMemo(() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: ro })
    if (view === 'day') return format(currentDate, 'EEEE, d MMMM yyyy', { locale: ro })

    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })

    return isSameMonth(start, end)
      ? format(start, 'MMMM yyyy', { locale: ro })
      : `${format(start, 'MMM', { locale: ro })} - ${format(end, 'MMM yyyy', { locale: ro })}`
  }, [currentDate, view])

  return (
    <div className={cn('bg-card flex flex-col rounded-lg border', className)}>
      {error && (
        <p role='alert' className='border-destructive/40 text-destructive m-4 rounded-xl border p-4 text-sm'>
          {error}
        </p>
      )}
      {notice && (
        <p role='status' className='text-muted-foreground m-4 rounded-xl border p-4 text-sm'>
          {notice}
        </p>
      )}
      <div
        className='flex flex-col has-data-[slot=month-view]:flex-1'
        style={
          {
            '--event-height': `${EventHeight}px`,
            '--event-gap': `${EventGap}px`,
            '--week-cells-height': `${WeekCellsHeight}px`
          } as React.CSSProperties
        }
      >
        <div className='flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4'>
          <div className='flex items-center gap-1'>
            <Link
              href={createHref}
              className='bg-primary text-primary-foreground inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium hover:opacity-90'
            >
              <PlusIcon size={16} aria-hidden='true' />
              <span>Rezervare</span>
            </Link>
            <Button variant='ghost' size='icon' onClick={() => router.refresh()} aria-label='Reîncarcă rezervările'>
              <RefreshCwIcon className='size-4' />
            </Button>
            <Button variant='outline' onClick={goToToday}>
              <CalendarCheckIcon size={16} aria-hidden='true' />
              <span>Azi</span>
            </Button>
          </div>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon-sm' onClick={goToPrevious} aria-label='Perioada anterioară'>
              <ChevronLeftIcon size={16} />
            </Button>
            <h2 className='text-center text-sm font-semibold sm:text-lg'>{viewTitle}</h2>
            <Button variant='ghost' size='icon-sm' onClick={goToNext} aria-label='Perioada următoare'>
              <ChevronRightIcon size={16} />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant='outline' className='max-sm:h-8!' />}>
              <span className='sm:hidden'>{{ month: 'L', week: 'S', day: 'Z' }[view]}</span>
              <span className='max-sm:sr-only'>{{ month: 'Lună', week: 'Săptămână', day: 'Zi' }[view]}</span>
              <ChevronDownIcon size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setView('month')}>
                Lună <DropdownMenuShortcut>M</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('week')}>
                Săptămână <DropdownMenuShortcut>W</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('day')}>
                Zi <DropdownMenuShortcut>D</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {!error && events.length === 0 && (
          <p role='status' className='text-muted-foreground px-4 pb-4 text-sm'>
            Nu sunt rezervări în sursa calendarului.
          </p>
        )}
        <div className='flex flex-1 flex-col'>
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={setSelectedEvent}
              onEventCreate={() => router.push(createHref)}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={setSelectedEvent}
              onEventCreate={() => router.push(createHref)}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={setSelectedEvent}
              onEventCreate={() => router.push(createHref)}
            />
          )}
        </div>
      </div>
      <Dialog
        open={selectedEvent !== null}
        onOpenChange={open => {
          if (!open) setSelectedEvent(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Detaliile rezervării</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className='space-y-3 text-sm'>
              <p>
                {format(new Date(selectedEvent.start), 'dd MMMM yyyy, HH:mm', { locale: ro })} –{' '}
                {format(new Date(selectedEvent.end), 'dd MMMM yyyy, HH:mm', { locale: ro })}
              </p>
              {selectedEvent.description && (
                <p className='text-muted-foreground break-words whitespace-pre-wrap'>{selectedEvent.description}</p>
              )}
              {selectedEvent.location && <p>{selectedEvent.location}</p>}
              <Link href='/apps/reservations' className='inline-block text-[#ffacc8] underline underline-offset-4'>
                Gestionează rezervările
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
