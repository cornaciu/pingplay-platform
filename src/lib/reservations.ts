import type { ReservationRecord } from '@/types/apps/reservation-types'

const RESERVATIONS_WEBHOOK_URL = 'https://n8n-wf.pingplay.ro/webhook/pingplay-clients'

const reservationColumns: (keyof ReservationRecord)[] = [
  'id',
  'Numele_clientului',
  'Masa_de_joc_durata',
  'ID_Rezervare',
  'Cod_acces_folosit',
  'Ora_de_inceput_a_rezervarii',
  'Ora_de_sfarsit_a_rezervarii',
  'Numar_telefon',
  'Email',
  'Factura',
  'Status_plata',
  'Link_reprogramare',
  'Link_anulare',
  'Event_UUID',
  'Rezervarea_creata_pe_data_de',
  'Event_type',
  'Status_calendly',
  'Motiv_anulare_reprogramare',
  'Anulata_pe_data_de_',
  'Link_plata',
  'ID_Plata_stripe',
  'Invitee_UUID',
  'Old_Invitee',
  'New_invitee',
  'Event_type_short',
  'Stripe_Payment_link_ID',
  'Delta_timp_reprogramare_',
  'mail_recenzie_trimis',
  'createdAt',
  'updatedAt'
]

type WebhookValue = Record<string, unknown> | WebhookValue[]

const getRows = (value: WebhookValue): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.flatMap(item => getRows(item))

  for (const key of ['data', 'items', 'rows', 'reservations', 'results', 'users']) {
    const nested = value[key]

    if (Array.isArray(nested) || (nested && typeof nested === 'object')) {
      return getRows(nested as WebhookValue)
    }
  }

  return [value]
}

const toReservationRecord = (row: Record<string, unknown>): ReservationRecord => {
  const record = {} as ReservationRecord

  for (const column of reservationColumns) {
    const value = Object.entries(row).find(([key]) => key.trim().toLowerCase() === column.toLowerCase())?.[1]

    const normalizedValue = value === null || value === undefined ? '' : String(value)

    record[column] =
      column === 'Cod_acces_folosit' && normalizedValue !== '0'
        ? normalizedValue.padStart(6, '0')
        : normalizedValue === '0' && column === 'Cod_acces_folosit'
          ? ''
          : normalizedValue
  }

  return record
}

export const getReservationsFromWebhook = async (): Promise<ReservationRecord[]> => {
  const response = await fetch(RESERVATIONS_WEBHOOK_URL, {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store'
  })

  const responseText = await response.text()

  if (!response.ok) throw new Error(`Workflow-ul n8n pentru rezervări a returnat ${response.status}`)

  try {
    const data = JSON.parse(responseText) as WebhookValue

    return getRows(data).map(toReservationRecord)
  } catch {
    throw new Error('Răspuns invalid de la workflow-ul n8n pentru rezervări')
  }
}
