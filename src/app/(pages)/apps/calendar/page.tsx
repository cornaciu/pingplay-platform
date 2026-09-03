import { getGoogleCalendarEvents } from '@/lib/google-calendar'
import { EventCalendar } from '@/views/apps/calendar'

const CalendarApp = async () => {
  const events = await getGoogleCalendarEvents()

  return <EventCalendar events={events} />
}

export default CalendarApp
