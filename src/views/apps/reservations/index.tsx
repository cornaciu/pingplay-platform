'use client'

import { useMemo, useState } from 'react'

import { CalendarCheck2, SearchIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ReservationRecord } from '@/types/apps/reservation-types'

const PAGE_SIZE = 15

const RESERVATION_COLUMNS: (keyof ReservationRecord)[] = [
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

const getTable = (value: string) => {
  const normalizedValue = value.toLowerCase().replace(/\s/g, '')

  if (normalizedValue.includes('nr.1') || normalizedValue.includes('nr1')) return 'masa1'
  if (normalizedValue.includes('nr.2') || normalizedValue.includes('nr2')) return 'masa2'

  return 'all'
}

const getStatus = (value: string) => value.trim().toLowerCase()

const statusLabels = {
  all: 'Toate',
  active: 'Active',
  canceled: 'Anulate',
  rescheduled: 'Reprogramate'
} as const

const tableLabels = {
  all: 'Toate mesele',
  masa1: 'Masa 1',
  masa2: 'Masa 2'
} as const

const ReservationsPage = ({ reservations }: { reservations: ReservationRecord[] }) => {
  const [search, setSearch] = useState('')
  const [table, setTable] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const filteredReservations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return reservations
      .filter(reservation => table === 'all' || getTable(reservation.Masa_de_joc_durata) === table)
      .filter(reservation => {
        if (status === 'all') return true
        if (status === 'active') return getStatus(reservation.Status_calendly) === 'active'
        if (status === 'rescheduled') return getStatus(reservation.Status_calendly).includes('reprogram')

        return getStatus(reservation.Status_calendly).includes('anulat')
      })
      .filter(reservation => {
        if (!normalizedSearch) return true

        return [
          reservation.Numele_clientului,
          reservation.Email,
          reservation.Numar_telefon,
          reservation.ID_Rezervare,
          reservation.Masa_de_joc_durata
        ]
          .filter(Boolean)
          .some(value => value.toLowerCase().includes(normalizedSearch))
      })
      .sort((first, second) => {
        const firstId = Number(first.id)
        const secondId = Number(second.id)

        if (Number.isFinite(firstId) && Number.isFinite(secondId)) return secondId - firstId

        return second.id.localeCompare(first.id)
      })
  }, [reservations, search, status, table])

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / PAGE_SIZE))
  const visibleReservations = filteredReservations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const showingFrom = filteredReservations.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(page * PAGE_SIZE, filteredReservations.length)

  const updateFilter = (setter: (value: string) => void, value: string | null) => {
    setter(value ?? 'all')
    setPage(1)
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-3'>
        <div className='bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg'>
          <CalendarCheck2 className='size-5' />
        </div>
        <div>
          <h1 className='text-xl font-semibold'>Rezervări</h1>
        </div>
      </div>

      <Card className='py-0'>
        <CardHeader className='gap-4 border-b px-4 py-4 sm:px-6'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <CardTitle className='text-base'>Registru rezervări ultimile 30 de zile</CardTitle>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <InputGroup className='sm:w-64'>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  value={search}
                  onChange={event => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder='Caută client, email...'
                  aria-label='Caută rezervări'
                />
              </InputGroup>
              <Select value={table} onValueChange={value => updateFilter(setTable, value)}>
                <SelectTrigger className='sm:w-36'>
                  <SelectValue>{tableLabels[table as keyof typeof tableLabels] ?? tableLabels.all}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Toate mesele</SelectItem>
                  <SelectItem value='masa1'>Masa 1</SelectItem>
                  <SelectItem value='masa2'>Masa 2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={value => updateFilter(setStatus, value)}>
                <SelectTrigger className='sm:w-32'>
                  <SelectValue>{statusLabels[status as keyof typeof statusLabels] ?? statusLabels.all}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Toate</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='canceled'>Anulate</SelectItem>
                  <SelectItem value='rescheduled'>Reprogramate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className='text-muted-foreground text-xs'>Afișate {filteredReservations.length} rezervări</p>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table className='min-w-480'>
              <TableHeader>
                <TableRow>
                  {RESERVATION_COLUMNS.map(column => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleReservations.map(reservation => (
                  <TableRow key={reservation.id}>
                    {RESERVATION_COLUMNS.map(column => (
                      <TableCell
                        key={column}
                        className={column === 'Numele_clientului' ? 'font-medium' : 'whitespace-nowrap'}
                      >
                        {reservation[column] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {visibleReservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={RESERVATION_COLUMNS.length} className='text-muted-foreground h-28 text-center'>
                      Nu există rezervări pentru filtrele selectate.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className='text-muted-foreground flex items-center justify-between gap-3 border-t px-4 py-4 text-sm sm:px-6'>
            <span>
              {showingFrom}-{showingTo} din {filteredReservations.length}
            </span>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                className='border-border hover:bg-muted rounded-md border px-3 py-1.5 disabled:pointer-events-none disabled:opacity-50'
                onClick={() => setPage(currentPage => currentPage - 1)}
                disabled={page === 1}
              >
                Înapoi
              </button>
              <span className='min-w-16 text-center'>
                Pagina {page}/{totalPages}
              </span>
              <button
                type='button'
                className='border-border hover:bg-muted rounded-md border px-3 py-1.5 disabled:pointer-events-none disabled:opacity-50'
                onClick={() => setPage(currentPage => currentPage + 1)}
                disabled={page >= totalPages}
              >
                Înainte
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReservationsPage
