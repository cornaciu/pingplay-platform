import 'server-only'

type CalendlyScheduledEvent = {
  uri: string
  event_type: string
  start_time: string
  end_time: string
}

type CalendlyResponse = {
  collection?: CalendlyScheduledEvent[]
  pagination?: {
    next_page?: string | null
  }
}

type CalendlyUserResponse = {
  resource?: {
    current_organization?: string
  }
}

type CalendlyInvitee = {
  uri?: string
  name?: string
  email?: string
  rescheduled?: boolean
  questions_and_answers?: Array<{
    question?: string
    answer?: string
  }>
}

type BookingStats = {
  eventType: string
  count: number | null
  previousCount: number | null
  rescheduled: number | null
  canceled: number | null
}

export type CalendlyReservation = {
  id: string
  eventUri: string
  startTime: string
  endTime: string
  eventTypeUri: string
  clientName: string | null
  clientEmail: string | null
  clientPhone: string | null
  status: 'active' | 'canceled'
  rescheduled: boolean
}

const CALENDLY_API_URL = 'https://api.calendly.com'
const DAYS_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000
const CURRENT_EVENTS_LOOKBACK_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const FUTURE_EVENTS_IN_MILLISECONDS = 365 * 24 * 60 * 60 * 1000

const toEventTypeUri = (eventTypeId: string) =>
  eventTypeId.startsWith('https://') ? eventTypeId : `${CALENDLY_API_URL}/event_types/${eventTypeId}`

const getEventTypeIds = (): Record<string, string[]> => {
  const value = process.env.CALENDLY_EVENT_TYPE_IDS

  if (!value) return {}

  try {
    const ids = JSON.parse(value) as unknown

    if (!ids || typeof ids !== 'object' || Array.isArray(ids)) return {}

    return Object.fromEntries(
      Object.entries(ids).map(([eventType, eventTypeIds]) => {
        const ids = Array.isArray(eventTypeIds) ? eventTypeIds : [eventTypeIds]

        return [
          eventType,
          ids.filter((eventTypeId): eventTypeId is string => typeof eventTypeId === 'string' && eventTypeId.length > 0)
        ]
      })
    )
  } catch {
    return {}
  }
}

const getScheduledEvents = async (organization: string, minStartTime: string, maxStartTime: string, status: string) => {
  const events: CalendlyScheduledEvent[] = []
  let nextPage: string | null = new URL('/scheduled_events', CALENDLY_API_URL).toString()

  while (nextPage) {
    const url = new URL(nextPage)

    url.searchParams.set('organization', organization)
    url.searchParams.set('min_start_time', minStartTime)
    url.searchParams.set('max_start_time', maxStartTime)
    url.searchParams.set('count', '100')
    url.searchParams.set('status', status)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) throw new Error(`Calendly API returned ${response.status}`)

    const data = (await response.json()) as CalendlyResponse

    events.push(...(data.collection ?? []))
    nextPage = data.pagination?.next_page ?? null
  }

  return events
}

const getEventInvitees = async (eventUri: string) => {
  const response = await fetch(`${eventUri}/invitees`, {
    headers: {
      Authorization: `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) throw new Error(`Calendly API returned ${response.status}`)

  const data = (await response.json()) as { collection?: CalendlyInvitee[] }

  return data.collection ?? []
}

const getInviteeAnswerAtPosition = (invitee: CalendlyInvitee, position: number) =>
  invitee.questions_and_answers?.[position]?.answer?.trim() || null

const hasRescheduledInvitee = async (eventUri: string) => {
  const invitees = await getEventInvitees(eventUri)

  return invitees.some(invitee => invitee.rescheduled === true)
}

const getCalendlyOrganization = async () => {
  const response = await fetch(`${CALENDLY_API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) throw new Error(`Calendly API returned ${response.status}`)

  const data = (await response.json()) as CalendlyUserResponse

  if (!data.resource?.current_organization) throw new Error('Calendly organization is missing')

  return data.resource.current_organization
}

export const getCalendlyBookingsLast30Days = async (eventTypes: string[]) => {
  const accessToken = process.env.CALENDLY_ACCESS_TOKEN
  const eventTypeIds = getEventTypeIds()

  if (!accessToken) {
    return {
      bookings: eventTypes.map<BookingStats>(eventType => ({
        eventType,
        count: null,
        previousCount: null,
        rescheduled: null,
        canceled: null
      }))
    }
  }

  const maxStartTime = new Date()
  const minStartTime = new Date(maxStartTime.getTime() - DAYS_IN_MILLISECONDS)
  const previousMinStartTime = new Date(minStartTime.getTime() - DAYS_IN_MILLISECONDS)

  let organization: string

  try {
    organization = await getCalendlyOrganization()
  } catch {
    return {
      bookings: eventTypes.map<BookingStats>(eventType => ({
        eventType,
        count: null,
        previousCount: null,
        rescheduled: null,
        canceled: null
      }))
    }
  }

  const eventTypeUris = new Set(Object.values(eventTypeIds).flat().map(toEventTypeUri))

  try {
    const [activeEvents, previousActiveEvents, canceledEvents] = await Promise.all([
      getScheduledEvents(organization, minStartTime.toISOString(), maxStartTime.toISOString(), 'active'),
      getScheduledEvents(organization, previousMinStartTime.toISOString(), minStartTime.toISOString(), 'active'),
      getScheduledEvents(organization, minStartTime.toISOString(), maxStartTime.toISOString(), 'canceled')
    ])

    const completedInPeriod = (event: CalendlyScheduledEvent) =>
      new Date(event.end_time) >= minStartTime && new Date(event.end_time) <= maxStartTime

    const completedInPreviousPeriod = (event: CalendlyScheduledEvent) =>
      new Date(event.end_time) >= previousMinStartTime && new Date(event.end_time) < minStartTime

    const completedEvents = activeEvents.filter(completedInPeriod)
    const previousCompletedEvents = previousActiveEvents.filter(completedInPreviousPeriod)
    const relevantCanceledEvents = canceledEvents.filter(event => eventTypeUris.has(event.event_type))

    const rescheduledEvents = await Promise.all(
      relevantCanceledEvents.map(async event => ((await hasRescheduledInvitee(event.uri)) ? event.uri : null))
    )

    const rescheduledEventUris = new Set(rescheduledEvents.filter((eventUri): eventUri is string => eventUri !== null))

    return {
      bookings: eventTypes.map(eventType => {
        const configuredUris = new Set((eventTypeIds[eventType] ?? []).map(toEventTypeUri))
        const canceledForEventType = relevantCanceledEvents.filter(event => configuredUris.has(event.event_type))
        const rescheduledForEventType = canceledForEventType.filter(event => rescheduledEventUris.has(event.uri))

        return {
          eventType,
          count: completedEvents.filter(event => configuredUris.has(event.event_type)).length,
          previousCount: previousCompletedEvents.filter(event => configuredUris.has(event.event_type)).length,
          canceled: canceledForEventType.length - rescheduledForEventType.length,
          rescheduled: rescheduledForEventType.length
        }
      })
    }
  } catch {
    return {
      bookings: eventTypes.map<BookingStats>(eventType => ({
        eventType,
        count: null,
        previousCount: null,
        rescheduled: null,
        canceled: null
      }))
    }
  }
}

export const getCalendlyFutureBookings = async (eventType: string) => {
  const accessToken = process.env.CALENDLY_ACCESS_TOKEN
  const eventTypeIds = getEventTypeIds()[eventType] ?? []

  if (!accessToken || eventTypeIds.length === 0) return null

  try {
    const organization = await getCalendlyOrganization()
    const minStartTime = new Date()
    const maxStartTime = new Date(minStartTime.getTime() + FUTURE_EVENTS_IN_MILLISECONDS)

    const events = await getScheduledEvents(
      organization,
      minStartTime.toISOString(),
      maxStartTime.toISOString(),
      'active'
    )

    const eventTypeUris = new Set(eventTypeIds.map(toEventTypeUri))

    const futureEvents = events
      .filter(event => eventTypeUris.has(event.event_type) && new Date(event.start_time) >= minStartTime)
      .sort((firstEvent, secondEvent) => firstEvent.start_time.localeCompare(secondEvent.start_time))

    const reservations = await Promise.all(
      futureEvents.map(async event => {
        const invitees = await getEventInvitees(event.uri)
        const client = invitees[0]

        return {
          eventUri: event.uri,
          startTime: event.start_time,
          endTime: event.end_time,
          eventTypeUri: event.event_type,
          clientName: client?.name ?? null,
          clientEmail: getInviteeAnswerAtPosition(client ?? {}, 2) ?? client?.email ?? null,
          clientPhone: getInviteeAnswerAtPosition(client ?? {}, 0)
        }
      })
    )

    return { count: reservations.length, reservations }
  } catch {
    return null
  }
}

export const getCalendlyCurrentBookings = async (eventType: string) => {
  const accessToken = process.env.CALENDLY_ACCESS_TOKEN
  const eventTypeIds = getEventTypeIds()[eventType] ?? []

  if (!accessToken || eventTypeIds.length === 0) return null

  try {
    const organization = await getCalendlyOrganization()
    const now = new Date()
    const minStartTime = new Date(now.getTime() - CURRENT_EVENTS_LOOKBACK_IN_MILLISECONDS)
    const eventTypeUris = new Set(eventTypeIds.map(toEventTypeUri))

    const events = await getScheduledEvents(organization, minStartTime.toISOString(), now.toISOString(), 'active')

    const currentEvents = events
      .filter(
        event =>
          eventTypeUris.has(event.event_type) && new Date(event.start_time) <= now && new Date(event.end_time) >= now
      )
      .sort((firstEvent, secondEvent) => firstEvent.start_time.localeCompare(secondEvent.start_time))

    const reservations = await Promise.all(
      currentEvents.map(async event => {
        const invitees = await getEventInvitees(event.uri)
        const client = invitees[0]

        return {
          startTime: event.start_time,
          endTime: event.end_time,
          eventTypeUri: event.event_type,
          clientName: client?.name ?? null,
          clientEmail: getInviteeAnswerAtPosition(client ?? {}, 2) ?? client?.email ?? null,
          clientPhone: getInviteeAnswerAtPosition(client ?? {}, 0)
        }
      })
    )

    return { count: reservations.length, reservations }
  } catch {
    return null
  }
}

export const getCalendlyReservations = async (): Promise<CalendlyReservation[]> => {
  const accessToken = process.env.CALENDLY_ACCESS_TOKEN
  const eventTypeUris = new Set(Object.values(getEventTypeIds()).flat().map(toEventTypeUri))

  if (!accessToken || eventTypeUris.size === 0) return []

  try {
    const organization = await getCalendlyOrganization()
    const now = new Date()
    const minStartTime = new Date(now.getTime() - DAYS_IN_MILLISECONDS)
    const maxStartTime = new Date(now.getTime() + FUTURE_EVENTS_IN_MILLISECONDS)

    const [activeEvents, canceledEvents] = await Promise.all([
      getScheduledEvents(organization, minStartTime.toISOString(), maxStartTime.toISOString(), 'active'),
      getScheduledEvents(organization, minStartTime.toISOString(), now.toISOString(), 'canceled')
    ])

    const events = [
      ...activeEvents.filter(event => eventTypeUris.has(event.event_type)),
      ...canceledEvents.filter(event => eventTypeUris.has(event.event_type))
    ]

    return Promise.all(
      events.map(async event => {
        const invitees = await getEventInvitees(event.uri)
        const client = invitees[0]

        return {
          id: event.uri,
          eventUri: event.uri,
          startTime: event.start_time,
          endTime: event.end_time,
          eventTypeUri: event.event_type,
          clientName: client?.name ?? null,
          clientEmail: getInviteeAnswerAtPosition(client ?? {}, 2) ?? client?.email ?? null,
          clientPhone: getInviteeAnswerAtPosition(client ?? {}, 0),
          status: canceledEvents.some(canceledEvent => canceledEvent.uri === event.uri) ? 'canceled' : 'active',
          rescheduled: client?.rescheduled === true
        }
      })
    )
  } catch {
    return []
  }
}
