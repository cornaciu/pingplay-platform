const ts = require('typescript')
const vm = require('node:vm')
const fs = require('node:fs')
const assert = require('node:assert/strict')
const root = require('node:path').resolve(__dirname, '..') + '/'
function load(
  file,
  env = {},
  fetcher = () => {
    throw Error('Unexpected network')
  },
  imports = {}
) {
  const code = ts.transpileModule(fs.readFileSync(root + file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText
  const exports = {}
  vm.runInNewContext(code, {
    exports,
    require: id => (id === 'server-only' ? {} : imports[id]),
    process: { env },
    fetch: fetcher,
    URL,
    Date,
    Intl,
    AbortSignal,
    Set,
    Map
  })
  return exports
}
;(async () => {
  const google = load('src/lib/google-calendar.ts')
  assert.equal(
    google.parseIcsDate('20260715T120000', false, 'Europe/Bucharest').toISOString(),
    '2026-07-15T09:00:00.000Z'
  )
  assert.equal(
    google.parseIcsDate('20260115T120000', false, 'Europe/Bucharest').toISOString(),
    '2026-01-15T10:00:00.000Z'
  )
  assert.equal(google.parseIcsDate('20260715T120000Z', false).toISOString(), '2026-07-15T12:00:00.000Z')
  const ics =
    'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:test\r\nDTSTART;TZID=Europe/Bucharest:20260715T120000\r\nDTEND;TZID=Europe/Bucharest:20260715T130000\r\nSUMMARY:Masa 2\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:cancelled\r\nDTSTART:20260715T120000Z\r\nSTATUS:CANCELLED\r\nEND:VEVENT\r\nEND:VCALENDAR'
  const events = await load('src/lib/google-calendar.ts', {}, async () => ({
    ok: true,
    text: async () => ics
  })).getGoogleCalendarEvents()
  assert.equal(events.length, 1)
  assert.equal(events[0].color, 'masa2')
  assert.equal(events[0].start.toISOString(), '2026-07-15T09:00:00.000Z')
  await assert.rejects(load('src/lib/google-calendar.ts', {}, async () => ({ ok: false })).getGoogleCalendarEvents())
  let eventCalls = 0
  const calendly = load(
    'src/lib/calendly.ts',
    {
      CALENDLY_ACCESS_TOKEN: 'synthetic-test-token',
      CALENDLY_EVENT_TYPE_IDS: JSON.stringify({ masa1: ['table1'], masa2: ['table2'], ambele: ['both'] })
    },
    async url => {
      if (String(url).endsWith('/users/me'))
        return {
          ok: true,
          json: async () => ({ resource: { current_organization: 'https://api.calendly.com/organizations/test' } })
        }
      eventCalls++
      assert.equal(url.searchParams.get('status'), 'active')
      return {
        ok: true,
        json: async () => ({
          collection: [
            {
              uri: 'booking1',
              event_type: 'https://api.calendly.com/event_types/table2',
              name: 'Masa 2',
              start_time: '2026-10-15T10:00:00Z',
              end_time: '2026-10-15T11:00:00Z'
            },
            { uri: 'other', event_type: 'unrelated' }
          ]
        })
      }
    }
  )
  const bookings = await calendly.getCalendlyCalendarEvents()
  assert.equal(bookings.length, 1)
  assert.equal(bookings[0].color, 'masa2')
  assert.equal(eventCalls, 1)
  const fallback = load('src/lib/calendar-data.ts', { GOOGLE_CALENDAR_ICAL_URL: 'synthetic-test-feed' }, undefined, {
    '@/lib/google-calendar': {
      getGoogleCalendarEvents: async () => {
        throw Error('Unavailable')
      }
    },
    '@/lib/calendly': { getCalendlyCalendarEvents: async () => bookings }
  })
  const result = await fallback.getCalendarData()
  assert.equal(result.source, 'Calendly')
  assert.ok(result.notice)
  assert.equal(result.events.length, 1)
  const unavailable = load('src/lib/calendar-data.ts', {}, undefined, {
    '@/lib/calendly': {
      getCalendlyCalendarEvents: async () => {
        throw Error('internal secret should never escape')
      }
    }
  })
  const failure = await unavailable.getCalendarData()
  assert.ok(failure.error)
  assert.equal(failure.events.length, 0)
  assert.ok(!failure.error.includes('internal secret'))
  console.log(
    'PASS: summer/winter timezones, UTC, ICS events and cancellation, fetch failure, Calendly filtering, Google fallback, safe error state.'
  )
})().catch(e => {
  console.error(e)
  process.exit(1)
})
