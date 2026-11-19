// Calendly event types per table and duration (minutes). These are the same event types the
// public booking page and the n8n reservation workflow use, so a booking made with them goes
// through the normal reservation flow.
export type BlockerTable = 'masa1' | 'masa2' | 'ambele'

export const BLOCK_DURATIONS = [30, 60, 90, 120] as const

export type BlockDuration = (typeof BLOCK_DURATIONS)[number]

export const CALENDLY_EVENT_TYPES: Record<BlockerTable, Record<BlockDuration, string>> = {
  masa1: {
    30: 'https://api.calendly.com/event_types/2fa1f3d1-311a-4605-b4f7-40ef071cba5e',
    60: 'https://api.calendly.com/event_types/c32e6a06-b625-4dd3-8f45-3f9ae299a488',
    90: 'https://api.calendly.com/event_types/9a1b291a-a500-4f80-8b73-582f3619cf73',
    120: 'https://api.calendly.com/event_types/2698c02e-093f-407d-8058-bed4c40d6ca6'
  },
  masa2: {
    30: 'https://api.calendly.com/event_types/5e6303f1-effc-4b41-ada3-c679376557af',
    60: 'https://api.calendly.com/event_types/74540ed4-4521-45ef-919d-71a6c4c4f609',
    90: 'https://api.calendly.com/event_types/e6dc2775-44a8-4976-9acb-6c4ea5375987',
    120: 'https://api.calendly.com/event_types/1b2eba10-7783-4523-a2aa-f3255e7a9a5a'
  },
  ambele: {
    30: 'https://api.calendly.com/event_types/628d387d-7da8-4a2c-ba07-22dc17cc7d8a',
    60: 'https://api.calendly.com/event_types/d5b6759a-caa0-45a7-bdc7-be72ec5fbd37',
    90: 'https://api.calendly.com/event_types/59924205-14fe-470d-aff2-72ece2dccf75',
    120: 'https://api.calendly.com/event_types/ab65dbda-ea1e-4702-8b7d-d743da8a7df2'
  }
}

export const MAX_BLOCK_MINUTES = 8 * 60

// Splits a block into consecutive Calendly bookings: as many 2 h slots as fit, then the rest
// (150 min → 120 + 30, 180 min → 120 + 60).
export const splitBlockDuration = (totalMinutes: number): BlockDuration[] => {
  const parts: BlockDuration[] = []
  let remaining = totalMinutes

  while (remaining >= 120) {
    parts.push(120)
    remaining -= 120
  }

  if (remaining > 0) parts.push(remaining as BlockDuration)

  return parts
}

const TABLE_BY_EVENT_TYPE = new Map(
  Object.entries(CALENDLY_EVENT_TYPES).flatMap(([table, byDuration]) =>
    Object.values(byDuration).map(uri => [uri, table as BlockerTable] as const)
  )
)

// Masa 1 and Masa 2 are independent; "ambele" takes both. A booking of an event type we do not
// know (another Calendly event type) is treated as taking the whole room, to be safe.
export const tablesOverlap = (table: BlockerTable, eventTypeUri: string) => {
  const other = TABLE_BY_EVENT_TYPE.get(eventTypeUri)

  return !other || table === 'ambele' || other === 'ambele' || other === table
}
