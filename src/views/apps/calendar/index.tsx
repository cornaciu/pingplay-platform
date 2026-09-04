'use client'


// React Imports
import { useEffect, useMemo, useState } from 'react'

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
import { CalendarCheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react'

import type { CalendarEvent, CalendarView } from '@/types/apps/calendar-types'

// Component Imports
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
}

export function EventCalendar({ className, initialView = 'month', events = [] }: EventCalendarProps) {
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
    if (view === 'month') return format(currentDate, 'MMMM yyyy')
    if (view === 'day') return format(currentDate, 'EEE MMMM d, yyyy')

    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(currentDate, { weekStartsOn: 0 })

    return isSameMonth(start, end) ? format(start, 'MMMM yyyy') : `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`
  }, [currentDate, view])

  return (
    <div className={cn('bg-card flex flex-col rounded-lg border', className)}>
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
        <div className='flex items-center justify-between gap-1 p-2 sm:p-4'>
          <div className='flex items-center gap-1'>
            <Button className='max-sm:hidden'>
              <PlusIcon size={16} aria-hidden='true' />
              <span>New event</span>
            </Button>
            <Button size='icon-sm' className='sm:hidden' aria-label='New event'>
              <PlusIcon size={16} aria-hidden='true' />
            </Button>
            <Button variant='outline' className='max-sm:hidden' onClick={goToToday}>
              <CalendarCheckIcon size={16} aria-hidden='true' />
              <span>Today</span>
            </Button>
          </div>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon-sm' onClick={goToPrevious} aria-label='Previous'>
              <ChevronLeftIcon size={16} />
            </Button>
            <h2 className='text-center text-sm font-semibold sm:text-lg'>{viewTitle}</h2>
            <Button variant='ghost' size='icon-sm' onClick={goToNext} aria-label='Next'>
              <ChevronRightIcon size={16} />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant='outline' className='max-sm:h-8!' />}>
              <span className='sm:hidden'>{view[0].toUpperCase()}</span>
              <span className='max-sm:sr-only'>{view[0].toUpperCase() + view.slice(1)}</span>
              <ChevronDownIcon size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setView('month')}>
                Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('week')}>
                Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('day')}>
                Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='flex flex-1 flex-col'>
          {view === 'month' && (
            <MonthView currentDate={currentDate} events={events} onEventSelect={() => {}} onEventCreate={() => {}} />
          )}
          {view === 'week' && (
            <WeekView currentDate={currentDate} events={events} onEventSelect={() => {}} onEventCreate={() => {}} />
          )}
          {view === 'day' && (
            <DayView currentDate={currentDate} events={events} onEventSelect={() => {}} onEventCreate={() => {}} />
          )}
        </div>
      </div>
    </div>
  )
}
