'use client'

import { useEffect, useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { BanIcon, CheckCircle2Icon, Loader2Icon, TriangleAlertIcon } from 'lucide-react'
import { toast } from 'sonner'

import { checkBlockerConflicts, createBlocker, type BlockerConflict } from '@/app/server/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MAX_BLOCK_MINUTES, splitBlockDuration, type BlockerTable } from '@/lib/calendly-event-types'
import { cn } from '@/lib/utils'

const TABLES: { value: BlockerTable; label: string; dots: string[] }[] = [
  { value: 'masa1', label: 'Masa 1', dots: ['bg-emerald-400'] },
  { value: 'masa2', label: 'Masa 2', dots: ['bg-blue-400'] },
  { value: 'ambele', label: 'Ambele', dots: ['bg-emerald-400', 'bg-blue-400'] }
]

// Opening hours 08:00–22:00, half-hour steps.
const START_TIMES = Array.from({ length: 28 }, (_, index) => {
  const minutes = 8 * 60 + index * 30

  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${minutes % 60 === 0 ? '00' : '30'}`
})

const DURATIONS = Array.from({ length: MAX_BLOCK_MINUTES / 30 }, (_, index) => (index + 1) * 30)

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours === 0) return `${rest} min`

  return rest ? `${hours} h ${rest} min` : hours === 1 ? '1 oră' : `${hours} ore`
}

const addMinutes = (time: string, minutes: number) => {
  const [hour, minute] = time.split(':').map(Number)
  const total = hour * 60 + minute + minutes

  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('ro-RO', { timeStyle: 'short', timeZone: 'Europe/Bucharest' }).format(new Date(value))

const getToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' })

const CreateBlockerCard = () => {
  const router = useRouter()
  const [table, setTable] = useState<BlockerTable>('masa1')
  const [date, setDate] = useState(getToday)
  const [time, setTime] = useState('18:00')
  const [duration, setDuration] = useState(120)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  // Live overlap check against existing bookings. The answer is stored with the query it belongs
  // to, so while the inputs change the form treats an older answer as "still checking".
  const [checkKey, setCheckKey] = useState(0)
  const queryKey = `${table}|${date}|${time}|${duration}|${checkKey}`

  const [check, setCheck] = useState<{ key: string; conflicts: BlockerConflict[] | null; error: string | null }>({
    key: '',
    conflicts: null,
    error: null
  })

  useEffect(() => {
    let active = true

    const timer = window.setTimeout(() => {
      checkBlockerConflicts({ table, date, time, durationMinutes: duration })
        .then(result => {
          if (active) {
            setCheck(
              result.ok
                ? { key: queryKey, conflicts: result.conflicts, error: null }
                : { key: queryKey, conflicts: null, error: result.error }
            )
          }
        })
        .catch(error => {
          if (active) {
            setCheck({
              key: queryKey,
              conflicts: null,
              error: error instanceof Error ? error.message : 'Rezervările nu au putut fi verificate'
            })
          }
        })
    }, 400)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [table, date, time, duration, queryKey])

  const isChecking = check.key !== queryKey
  const conflicts = isChecking ? null : check.conflicts
  const checkError = isChecking ? null : check.error
  const hasConflicts = (conflicts?.length ?? 0) > 0

  const parts = splitBlockDuration(duration)
  const endTime = addMinutes(time, duration)
  const [startHour, startMinute] = time.split(':').map(Number)
  const endsAfterClosing = startHour * 60 + startMinute + duration > 22 * 60

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      try {
        const result = await createBlocker({ table, date, time, durationMinutes: duration, reason })

        if (!result.ok) {
          setCheckKey(key => key + 1)
          toast.error(result.error)

          return
        }

        toast.success(`${TABLES.find(item => item.value === table)?.label} este blocată ${time}–${endTime}.`)
        setReason('')
        setCheckKey(key => key + 1)
        router.refresh()
      } catch (error) {
        setCheckKey(key => key + 1)
        toast.error(error instanceof Error ? error.message : 'Blocarea nu a putut fi creată')
      }
    })
  }

  return (
    <Card className='col-span-full w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BanIcon className='text-primary size-5' aria-hidden='true' />
          Blochează masa
        </CardTitle>
        <p className='text-muted-foreground text-sm'>
          Intervalul apare ca rezervare plătită și confirmată: nu mai poate fi rezervat, iar automatizările îl tratează
          ca rezervare activă.
        </p>
      </CardHeader>
      <CardContent>
        <form className='space-y-5' onSubmit={submit}>
          <fieldset className='grid gap-2'>
            <legend className='mb-2 text-sm font-medium'>Masă</legend>
            <div className='bg-muted grid grid-cols-3 gap-1.5 rounded-xl p-1'>
              {TABLES.map(item => (
                <Button
                  key={item.value}
                  type='button'
                  variant={table === item.value ? 'default' : 'ghost'}
                  aria-pressed={table === item.value}
                  className='h-11 rounded-lg'
                  onClick={() => setTable(item.value)}
                  disabled={isPending}
                >
                  <span className='flex gap-0.5' aria-hidden='true'>
                    {item.dots.map(dot => (
                      <span key={dot} className={cn('size-2 rounded-full', dot)} />
                    ))}
                  </span>
                  {item.label}
                </Button>
              ))}
            </div>
          </fieldset>

          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='grid gap-2'>
              <Label htmlFor='blocker-date'>Data</Label>
              <Input
                id='blocker-date'
                type='date'
                required
                min={getToday()}
                value={date}
                onChange={event => setDate(event.target.value)}
                disabled={isPending}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='blocker-time'>De la</Label>
              <Select value={time} onValueChange={value => value && setTime(value)} disabled={isPending}>
                <SelectTrigger id='blocker-time' className='w-full'>
                  <SelectValue>{time}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {START_TIMES.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='blocker-duration'>Durată</Label>
              <Select
                value={String(duration)}
                onValueChange={value => value && setDuration(Number(value))}
                disabled={isPending}
              >
                <SelectTrigger id='blocker-duration' className='w-full'>
                  <SelectValue>{formatDuration(duration)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map(option => (
                    <SelectItem key={option} value={String(option)}>
                      {formatDuration(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='blocker-reason'>Motiv (opțional)</Label>
            <Input
              id='blocker-reason'
              maxLength={60}
              placeholder='ex. Antrenament, Mentenanță, Eveniment privat'
              value={reason}
              onChange={event => setReason(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className='bg-muted/40 rounded-xl border p-3 text-sm'>
            <p className='font-medium'>
              {time}–{endTime} · {formatDuration(duration)}
            </p>
            <p className='text-muted-foreground mt-1'>
              {parts.length === 1
                ? 'O rezervare în Calendly, marcată ca plătită.'
                : `${parts.length} rezervări consecutive în Calendly (${parts.map(formatDuration).join(' + ')}), toate marcate ca plătite.`}
            </p>
            {endsAfterClosing && (
              <p className='text-destructive mt-1'>Intervalul depășește ora 22:00, Calendly îl poate refuza.</p>
            )}
            <div className='mt-3 border-t pt-3' role='status' aria-live='polite'>
              {isChecking && (
                <p className='text-muted-foreground flex items-center gap-2'>
                  <Loader2Icon className='size-4 animate-spin' aria-hidden='true' />
                  Verific rezervările existente…
                </p>
              )}
              {checkError && (
                <p className='text-destructive flex items-start gap-2'>
                  <TriangleAlertIcon className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
                  {checkError}
                </p>
              )}
              {conflicts && !hasConflicts && (
                <p className='flex items-center gap-2 text-emerald-400'>
                  <CheckCircle2Icon className='size-4' aria-hidden='true' />
                  Intervalul e liber.
                </p>
              )}
              {hasConflicts && (
                <div className='text-destructive'>
                  <p className='flex items-center gap-2 font-medium'>
                    <TriangleAlertIcon className='size-4' aria-hidden='true' />
                    Se suprapune cu{' '}
                    {conflicts!.length === 1 ? 'o rezervare existentă' : `${conflicts!.length} rezervări existente`}:
                  </p>
                  <ul className='mt-1 list-disc pl-10'>
                    {conflicts!.map(conflict => (
                      <li key={`${conflict.startTime}-${conflict.name}`}>
                        {formatTime(conflict.startTime)}–{formatTime(conflict.endTime)} · {conflict.name ?? 'Rezervare'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <Button
            className='h-11 w-full'
            type='submit'
            disabled={isPending || isChecking || hasConflicts || checkError !== null}
          >
            {isPending && <Loader2Icon className='animate-spin' />}
            {isPending ? 'Se blochează… (durează până la un minut)' : 'Blochează intervalul'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateBlockerCard
