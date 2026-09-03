/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */
'use server'

import crypto from 'node:crypto'

// Data Imports
import { db as calendarDb } from '@/fake-db/apps/calendar'
import { db as userProfileDb } from '@/fake-db/pages/user-profile'

// Calendar App Actions
export const getCalendarData = async () => {
  return calendarDb
}

// User Profile Actions
export const getProfileData = async () => userProfileDb

type TableControl = 'masa1' | 'masa2' | 'Ambele'
type TableAction = 'open' | 'close'
type LightsAndTvAction = 'on' | 'off'
type AirConditionerAction = 'on' | 'off'
type DoorAction = 'unlock' | 'lock'

type NukiDoorStatus = 'locked' | 'unlocked' | 'unknown'
export type NukiDoorInfo = {
  status: NukiDoorStatus
  batteryLevel: number | null
  batteryCritical: boolean | null
}

const tableWebhooks: Record<TableAction, Record<TableControl, string>> = {
  open: {
    masa1: 'https://eu-apia.coolkit.cc/v2/smartscene2/webhooks/execute?id=e28afdf589a74472854881da6a9b6257',
    masa2: 'https://eu-apia.coolkit.cc/v2/smartscene2/webhooks/execute?id=bfb9b8a6b26b499e93c03ea6d7aa71aa',
    Ambele: 'https://eu-apia.coolkit.cc/v2/smartscene2/webhooks/execute?id=b6c2a93a244a47b2819078051d4ec9fb'
  },
  close: {
    masa1: 'https://eu-apia.coolkit.cc/v2/smartscene2/webhooks/execute?id=333e2861592c428f8f24cf74cf222211',
    masa2: 'https://eu-apia.coolkit.cc/v2/smartscene2/webhooks/execute?id=b55c9594c77b4b08bfbfd1dbad74057b',
    Ambele: 'https://eu-apia.coolkit.cc/v2/smartscene2/webhooks/execute?id=5a09f524a3de4455bb01c7b65cb58ff2'
  }
}

const lightsAndTvWebhooks: Record<LightsAndTvAction, string> = {
  on: 'https://eu-apia.coolkit.cc/v2/smartscene2/webhooks/execute?id=322ae19dadb74054b28a1d6dbeac5854',
  off: 'https://eu-apia.coolkit.cc/v2/smartscene2/webhooks/execute?id=84458e21143b4189a2cf7f2bf9dbdd3c'
}

const TUYA_API_URL = 'https://openapi.tuyaeu.com'
const TUYA_CLIENT_ID = process.env.TUYA_CLIENT_ID
const TUYA_CLIENT_SECRET = process.env.TUYA_CLIENT_SECRET
const TUYA_DEVICE_ID = process.env.TUYA_DEVICE_ID
const NUKI_API_URL = process.env.NUKI_API_URL ?? 'https://api.nuki.io'
const NUKI_SMARTLOCK_ID = process.env.NUKI_SMARTLOCK_ID
const NUKI_API_TOKEN = process.env.NUKI_API_TOKEN
const NUKI_CONFIRMATION_ATTEMPTS = 15
const NUKI_CONFIRMATION_DELAY_MS = 1500

const createTuyaSignature = (
  clientId: string,
  accessToken: string,
  timestamp: string,
  method: string,
  path: string,
  body: string
) => {
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex').toLowerCase()
  const stringToSign = `${method}\n${bodyHash}\n\n${path}`

  return crypto
    .createHmac('sha256', TUYA_CLIENT_SECRET!)
    .update(clientId + accessToken + timestamp + stringToSign)
    .digest('hex')
    .toUpperCase()
}

const getTuyaAccessToken = async () => {
  if (!TUYA_CLIENT_ID || !TUYA_CLIENT_SECRET) throw new Error('Lipsesc credentialele Tuya')

  const timestamp = Date.now().toString()
  const path = '/v1.0/token?grant_type=1'
  const sign = createTuyaSignature(TUYA_CLIENT_ID, '', timestamp, 'GET', path, '')

  const response = await fetch(`${TUYA_API_URL}${path}`, {
    headers: {
      client_id: TUYA_CLIENT_ID,
      sign,
      t: timestamp,
      sign_method: 'HMAC-SHA256'
    },
    cache: 'no-store'
  })

  if (!response.ok) throw new Error(`Tuya token returned ${response.status}`)

  const data = (await response.json()) as { success?: boolean; result?: { access_token?: string } }
  const accessToken = data.result?.access_token

  if (!data.success || !accessToken) throw new Error('Tokenul Tuya nu a fost primit')

  return accessToken
}

export const controlTable = async (table: TableControl, action: TableAction) => {
  const response = await fetch(tableWebhooks[action][table], { method: 'GET', cache: 'no-store' })

  if (!response.ok) throw new Error(`Webhook returned ${response.status}`)

  return { success: true }
}

export const controlLightsAndTv = async (action: LightsAndTvAction) => {
  const response = await fetch(lightsAndTvWebhooks[action], { method: 'GET', cache: 'no-store' })

  if (!response.ok) throw new Error(`Webhook returned ${response.status}`)

  return { success: true }
}

export const controlDoor = async (action: DoorAction) => {
  if (!NUKI_SMARTLOCK_ID || !NUKI_API_TOKEN) throw new Error('Lipsesc setările Nuki')

  const response = await fetch(`${NUKI_API_URL}/smartlock/${NUKI_SMARTLOCK_ID}/action/${action}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NUKI_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) throw new Error(`Nuki door returned ${response.status}`)

  const expectedStatus = action === 'unlock' ? 'unlocked' : 'locked'

  await new Promise(resolve => setTimeout(resolve, NUKI_CONFIRMATION_DELAY_MS))

  for (let attempt = 0; attempt < NUKI_CONFIRMATION_ATTEMPTS; attempt++) {
    const { status } = await getDoorStatus()

    if (status === expectedStatus) return { success: true, status }

    if (attempt < NUKI_CONFIRMATION_ATTEMPTS - 1) {
      await new Promise(resolve => setTimeout(resolve, NUKI_CONFIRMATION_DELAY_MS))
    }
  }

  throw new Error(
    action === 'unlock'
      ? 'Nuki nu a confirmat descuierea ușii în timpul așteptat'
      : 'Nuki nu a confirmat încuiarea ușii în timpul așteptat'
  )
}

export const getDoorStatus = async (): Promise<NukiDoorInfo> => {
  if (!NUKI_SMARTLOCK_ID || !NUKI_API_TOKEN) throw new Error('Lipsesc setările Nuki')

  const response = await fetch(`${NUKI_API_URL}/smartlock/${NUKI_SMARTLOCK_ID}`, {
    headers: { Authorization: `Bearer ${NUKI_API_TOKEN}` },
    cache: 'no-store'
  })

  if (!response.ok) throw new Error(`Nuki status returned ${response.status}`)

  const data = (await response.json()) as {
    state?: { state?: number; batteryLevel?: number; batteryCharge?: number; batteryCritical?: boolean } | number
    lastKnownState?: { state?: number; batteryLevel?: number; batteryCharge?: number; batteryCritical?: boolean }
    batteryLevel?: number
    batteryCharge?: number
    batteryCritical?: boolean
  }

  const stateData = typeof data.state === 'object' ? data.state : data.lastKnownState
  const state = typeof data.state === 'number' ? data.state : stateData?.state

  const batteryLevel =
    data.batteryLevel ?? data.batteryCharge ?? stateData?.batteryLevel ?? stateData?.batteryCharge ?? null

  const batteryCritical = data.batteryCritical ?? stateData?.batteryCritical ?? null

  const status = state === 1 ? 'locked' : state === 3 || state === 5 ? 'unlocked' : 'unknown'

  return { status, batteryLevel, batteryCritical }
}

export const controlAirConditioner = async (action: AirConditionerAction) => {
  if (!TUYA_CLIENT_ID || !TUYA_CLIENT_SECRET || !TUYA_DEVICE_ID) throw new Error('Lipsesc setările Tuya')

  const accessToken = await getTuyaAccessToken()
  const path = `/v2.0/cloud/thing/${TUYA_DEVICE_ID}/shadow/properties/issue`
  const body = JSON.stringify({ properties: { Power: action === 'on' } })
  const timestamp = Date.now().toString()
  const sign = createTuyaSignature(TUYA_CLIENT_ID, accessToken, timestamp, 'POST', path, body)

  const response = await fetch(`${TUYA_API_URL}${path}`, {
    method: 'POST',
    headers: {
      client_id: TUYA_CLIENT_ID,
      access_token: accessToken,
      sign,
      t: timestamp,
      sign_method: 'HMAC-SHA256',
      'Content-Type': 'application/json'
    },
    body,
    cache: 'no-store'
  })

  if (!response.ok) throw new Error(`Tuya climate returned ${response.status}`)

  const data = (await response.json()) as { success?: boolean; code?: number; msg?: string }

  if (!data.success) {
    const details = [data.code, data.msg].filter(Boolean).join(': ')

    throw new Error(`Comanda pentru climă a fost respinsă${details ? ` (${details})` : ''}`)
  }

  return { success: true }
}
