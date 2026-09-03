import type { CalendarEvent, events } from '@/types/apps/calendar-types'

const GOOGLE_CALENDAR_FEED_URL =
  process.env.GOOGLE_CALENDAR_ICAL_URL ??
  'https://calendar.google.com/calendar/ical/pingplaytm%40gmail.com/public/basic.ics'

const unescapeIcsText = (value: string) =>
  value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')

const parseIcsDate = (value: string, allDay: boolean) => {
  if (allDay) {
    const year = Number(value.slice(0, 4))
    const month = Number(value.slice(4, 6)) - 1
    const day = Number(value.slice(6, 8))

    return new Date(year, month, day)
  }

  const normalized = value.replace('Z', '')
  const year = Number(normalized.slice(0, 4))
  const month = Number(normalized.slice(4, 6)) - 1
  const day = Number(normalized.slice(6, 8))
  const hours = Number(normalized.slice(9, 11))
  const minutes = Number(normalized.slice(11, 13))
  const seconds = Number(normalized.slice(13, 15))

  return value.endsWith('Z')
    ? new Date(Date.UTC(year, month, day, hours, minutes, seconds))
    : new Date(year, month, day, hours, minutes, seconds)
}

const getProperty = (event: string, name: string) => {
  const line = event.match(new RegExp(`^${name}(?:;[^:]*)?:(.+)$`, 'm'))

  return line ? unescapeIcsText(line[1].trim()) : undefined
}

const getEventColor = (title: string): events => {
  const normalizedTitle = title.toLowerCase()

  if (normalizedTitle.includes('ambele')) return 'ambele'
  if (normalizedTitle.includes('masa 1')) return 'business'
  if (/nr\.?\s*2/.test(normalizedTitle)) return 'masa2'

  return 'etc'
}

export const getGoogleCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await fetch(GOOGLE_CALENDAR_FEED_URL, { next: { revalidate: 60 } })

    if (!response.ok) return []

    const ics = await response.text()
    const unfoldedIcs = ics.replace(/\r?\n[ \t]/g, '')

    return unfoldedIcs
      .split('BEGIN:VEVENT')
      .slice(1)
      .map((eventBlock): CalendarEvent | null => {
        const event = eventBlock.split('END:VEVENT')[0]
        const startValue = getProperty(event, 'DTSTART')
        const endValue = getProperty(event, 'DTEND')
        const title = getProperty(event, 'SUMMARY') || 'Rezervare'
        const allDay = /^DTSTART;VALUE=DATE:/m.test(event)

        if (!startValue) return null

        const start = parseIcsDate(startValue, allDay)
        const end = endValue ? parseIcsDate(endValue, allDay) : new Date(start.getTime() + 60 * 60 * 1000)

        return {
          id: getProperty(event, 'UID') || `${start.toISOString()}-${title}`,
          title,
          description: getProperty(event, 'DESCRIPTION'),
          location: getProperty(event, 'LOCATION'),
          start,
          end,
          allDay,
          color: getEventColor(title)
        }
      })
      .filter((event): event is CalendarEvent => event !== null)
  } catch {
    return []
  }
}
