import 'server-only'

import { getCalendlyCalendarEvents } from '@/lib/calendly'
import { getGoogleCalendarEvents } from '@/lib/google-calendar'
import type { CalendarEvent } from '@/types/apps/calendar-types'

export type CalendarData = { events: CalendarEvent[]; source: string; error?: string; notice?: string }

export const getCalendarData = async (): Promise<CalendarData> => {
  let googleUnavailable = false

  if (process.env.GOOGLE_CALENDAR_ICAL_URL?.trim()) {
    try {
      return { events: await getGoogleCalendarEvents(), source: 'Google Calendar' }
    } catch {
      googleUnavailable = true
    }
  }

  try {
    return {
      events: await getCalendlyCalendarEvents(),
      source: 'Calendly',
      notice: googleUnavailable
        ? 'Fluxul Google Calendar nu este disponibil. Sunt afișate rezervările active din Calendly.'
        : undefined
    }
  } catch {
    return {
      events: [],
      source: 'Calendar',
      error: 'Rezervările nu au putut fi încărcate. Verifică integrarea calendarului și încearcă din nou.'
    }
  }
}
