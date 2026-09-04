'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { CalendarPlusIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { createReservation, getReservationAvailability, type ReservationSlot } from '@/app/server/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const EVENT_TYPES = [
  {
    id: 'masa1-30',
    eventTypeUri: 'https://api.calendly.com/event_types/2fa1f3d1-311a-4605-b4f7-40ef071cba5e',
    label: 'Masa 1 - 30 minute'
  },
  {
    id: 'masa2-30',
    eventTypeUri: 'https://api.calendly.com/event_types/5e6303f1-effc-4b41-ada3-c679376557af',
    label: 'Masa 2 - 30 minute'
  },
  {
    id: 'masa1-60',
    eventTypeUri: 'https://api.calendly.com/event_types/c32e6a06-b625-4dd3-8f45-3f9ae299a488',
    label: 'Masa 1 - 1 ora'
  },
  {
    id: 'masa2-60',
    eventTypeUri: 'https://api.calendly.com/event_types/74540ed4-4521-45ef-919d-71a6c4c4f609',
    label: 'Masa 2 - 1 ora'
  },
  {
    id: 'masa1-90',
    eventTypeUri: 'https://api.calendly.com/event_types/9a1b291a-a500-4f80-8b73-582f3619cf73',
    label: 'Masa 1 - 1 ora si 30 minute'
  },
  {
    id: 'masa2-90',
    eventTypeUri: 'https://api.calendly.com/event_types/e6dc2775-44a8-4976-9acb-6c4ea5375987',
    label: 'Masa 2 - 1 ora si 30 minute'
  },
  {
    id: 'masa1-120',
    eventTypeUri: 'https://api.calendly.com/event_types/2698c02e-093f-407d-8058-bed4c40d6ca6',
    label: 'Masa 1 - 2 ore'
  },
  {
    id: 'masa2-120',
    eventTypeUri: 'https://api.calendly.com/event_types/1b2eba10-7783-4523-a2aa-f3255e7a9a5a',
    label: 'Masa 2 - 2 ore'
  },
  {
    id: 'ambele-30',
    eventTypeUri: 'https://api.calendly.com/event_types/628d387d-7da8-4a2c-ba07-22dc17cc7d8a',
    label: 'Ambele mese - 30 minute'
  },
  {
    id: 'ambele-60',
    eventTypeUri: 'https://api.calendly.com/event_types/d5b6759a-caa0-45a7-bdc7-be72ec5fbd37',
    label: 'Ambele mese - 1 ora'
  },
  {
    id: 'ambele-90',
    eventTypeUri: 'https://api.calendly.com/event_types/59924205-14fe-470d-aff2-72ece2dccf75',
    label: 'Ambele mese - 1 ora si 30 minute'
  },
  {
    id: 'ambele-120',
    eventTypeUri: 'https://api.calendly.com/event_types/ab65dbda-ea1e-4702-8b7d-d743da8a7df2',
    label: 'Ambele mese - 2 ore'
  }
]

const getToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' })

const CreateReservationCard = () => {
  const router = useRouter()
  const [eventTypeId, setEventTypeId] = useState(EVENT_TYPES[0].id)
  const [date, setDate] = useState(getToday)
  const [slots, setSlots] = useState<ReservationSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<ReservationSlot | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const loadSlots = async (
    nextDate = date,
    nextEventType = EVENT_TYPES.find(type => type.id === eventTypeId)?.eventTypeUri ?? EVENT_TYPES[0].eventTypeUri
  ) => {
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)

    try {
      const availability = await getReservationAvailability(nextEventType, nextDate)

      setSlots(availability.slots ?? [])
    } catch (error) {
      setSlots([])
      toast.error(error instanceof Error ? error.message : 'Nu s-au putut încărca sloturile')
    } finally {
      setLoadingSlots(false)
    }
  }

  const updateForm = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }))
  const selectedEventType = EVENT_TYPES.find(type => type.id === eventTypeId) ?? EVENT_TYPES[0]

  useEffect(() => {
    let active = true

    void getReservationAvailability(EVENT_TYPES[0].eventTypeUri, getToday())
      .then(availability => {
        if (active) setSlots(availability.slots ?? [])
      })
      .catch(error => {
        if (active) toast.error(error instanceof Error ? error.message : 'Nu s-au putut încărca sloturile')
      })
      .finally(() => {
        if (active) setLoadingSlots(false)
      })

    return () => {
      active = false
    }
  }, [])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedSlot?.start_time) return toast.error('Selectează mai întâi o oră disponibilă')
    setSubmitting(true)

    try {
      const eventType = EVENT_TYPES.find(type => type.id === eventTypeId) ?? EVENT_TYPES[0]

      const result = await createReservation({
        eventTypeUri: eventType.eventTypeUri,
        eventTypeName: eventType.label,
        startTime: selectedSlot.start_time,
        consentAccepted,
        ...form
      })

      toast.success('Rezervarea a fost creată')

      if (result.paymentUrl) window.location.assign(result.paymentUrl)
      else {
        await loadSlots(date, eventType.eventTypeUri)
        setSelectedSlot(null)
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rezervarea nu a putut fi creată')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className='col-span-full w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CalendarPlusIcon className='text-primary size-5' />
          Creează rezervare
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className='space-y-5' onSubmit={submit}>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='reservation-type'>Tip rezervare</Label>
              <Select
                disabled={loadingSlots}
                value={eventTypeId}
                onValueChange={value => {
                  if (value) {
                    setEventTypeId(value)
                    const eventType = EVENT_TYPES.find(type => type.id === value) ?? EVENT_TYPES[0]

                    void loadSlots(date, eventType.eventTypeUri)
                  }
                }}
              >
                <SelectTrigger id='reservation-type' aria-busy={loadingSlots} className='w-full'>
                  <SelectValue>{selectedEventType.label}</SelectValue>
                  {loadingSlots && <Loader2Icon className='text-muted-foreground size-4 animate-spin' />}
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='reservation-date'>Data</Label>
              <Input
                id='reservation-date'
                type='date'
                min={getToday()}
                value={date}
                onChange={event => {
                  setDate(event.target.value)
                  void loadSlots(event.target.value)
                }}
              />
            </div>
          </div>

          <div className='grid gap-2'>
            <div className='flex items-center justify-between'>
              <Label>Ore disponibile</Label>
              {loadingSlots && <Loader2Icon className='text-muted-foreground size-4 animate-spin' />}
            </div>
            <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
              {slots.map(slot => (
                <Button
                  key={`${slot.start_time}-${slot.time}`}
                  type='button'
                  size='sm'
                  variant={selectedSlot === slot ? 'default' : 'outline'}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
            {!loadingSlots && slots.length === 0 && (
              <p className='text-muted-foreground text-sm'>Alege data pentru a încărca orele disponibile.</p>
            )}
          </div>

          {selectedSlot && (
            <div className='grid gap-4 border-t pt-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3'>
              <div className='grid gap-2'>
                <Label htmlFor='reservation-name'>Nume</Label>
                <Input
                  id='reservation-name'
                  required
                  value={form.name}
                  onChange={event => updateForm('name', event.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='reservation-email'>Email</Label>
                <Input
                  id='reservation-email'
                  required
                  type='email'
                  value={form.email}
                  onChange={event => updateForm('email', event.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='reservation-phone'>Telefon</Label>
                <Input
                  id='reservation-phone'
                  required
                  pattern='07[0-9]{8}'
                  placeholder='07xxxxxxxx'
                  value={form.phone}
                  onChange={event => updateForm('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>
          )}

          {selectedSlot && (
            <div className='flex items-start gap-3 border-t pt-4'>
              <Checkbox
                id='reservation-consent'
                checked={consentAccepted}
                onCheckedChange={checked => setConsentAccepted(checked === true)}
              />
              <Label htmlFor='reservation-consent' className='text-muted-foreground cursor-pointer text-sm leading-5'>
                Prin rezervare confirm că am luat la cunoștință regulamentul de ordine interioară, politica de
                confidențialitate, GDPR și politicile de anulare sau reprogramare și accept să primesc oferte pe email.
              </Label>
            </div>
          )}

          <Button className='w-full' type='submit' disabled={!selectedSlot || !consentAccepted || submitting}>
            {submitting && <Loader2Icon className='animate-spin' />}
            Creează rezervarea
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateReservationCard
