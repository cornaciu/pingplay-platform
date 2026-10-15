import { getCalendarData } from '@/lib/calendar-data'
import { EventCalendar } from '@/views/apps/calendar'

const CalendarApp = async () => {
  const data = await getCalendarData()

  return (
    <div className='space-y-5'>
      <div>
        <p className='text-primary mb-2 text-xs font-semibold tracking-widest uppercase'>Rezervări PINGPLAY</p>
        <h1 className='text-3xl font-semibold tracking-tight'>Calendar</h1>
        <p className='text-muted-foreground mt-2 text-sm'>
          {data.source} · Orele sunt afișate în fusul orar al dispozitivului.
        </p>
      </div>
      <EventCalendar events={data.events} error={data.error} notice={data.notice} />
    </div>
  )
}

export default CalendarApp
