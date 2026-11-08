'use client'

import { useEffect, useState, useTransition } from 'react'

import { toast } from 'sonner'

import { AirVentIcon, BatteryMediumIcon, LightbulbIcon, LockKeyholeIcon, UnlockKeyholeIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  controlAirConditioner,
  controlDoor,
  controlLightsAndTv,
  controlTable,
  getDoorStatus
} from '@/app/server/actions'

const tileClassName = 'bg-card relative flex flex-col gap-3 rounded-2xl border p-4'
const sectionLabelClassName = 'text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase'

// Same open/close buttons for every table; only the table label carries its colour.
const OpenCloseButtons = ({
  onOpen,
  onClose,
  disabled,
  openLabel = 'Deschide',
  closeLabel = 'Închide'
}: {
  onOpen: () => void
  onClose: () => void
  disabled: boolean
  openLabel?: string
  closeLabel?: string
}) => (
  <div className='bg-muted grid grid-cols-2 gap-1.5 rounded-xl p-1'>
    <Button className='h-11 rounded-lg' onClick={onOpen} disabled={disabled}>
      {openLabel}
    </Button>
    <Button variant='ghost' className='bg-background/60 h-11 rounded-lg' onClick={onClose} disabled={disabled}>
      {closeLabel}
    </Button>
  </div>
)

const CooldownOverlay = ({ seconds }: { seconds: number }) => (
  <div className='bg-background/90 absolute inset-0 z-10 flex items-center justify-center rounded-2xl px-4 text-center backdrop-blur-sm'>
    <span className='text-muted-foreground text-sm font-medium' role='status'>
      Poți efectua o nouă acțiune peste {seconds}s.
    </span>
  </div>
)

const TableAvailabilityPanel = () => {
  const cooldownSeconds = 26

  // Unknown until a command is sent from this page: the table relays do not report their state.
  const [tableStatus, setTableStatus] = useState<Record<'masa1' | 'masa2', boolean | null>>({
    masa1: null,
    masa2: null
  })

  const [cooldowns, setCooldowns] = useState({ masa1: 0, masa2: 0 })
  const [cooldownTarget, setCooldownTarget] = useState<'masa1' | 'masa2' | 'Ambele' | null>(null)

  const [isPending, startTransition] = useTransition()
  const [isLightsAndTvPending, startLightsAndTvTransition] = useTransition()
  const [isAirConditionerPending, startAirConditionerTransition] = useTransition()
  const [airConditionerError, setAirConditionerError] = useState<string | null>(null)
  const [isDoorPending, startDoorTransition] = useTransition()
  const [doorError, setDoorError] = useState<string | null>(null)
  const [doorStatus, setDoorStatus] = useState<'locked' | 'unlocked' | 'unknown'>('unknown')
  const [doorBattery, setDoorBattery] = useState<number | null>(null)
  const [doorBatteryCritical, setDoorBatteryCritical] = useState<boolean | null>(null)

  const hasCooldown = cooldowns.masa1 > 0 || cooldowns.masa2 > 0
  const displayedCooldown = Math.max(cooldowns.masa1, cooldowns.masa2)

  const updateTable = (table: 'masa1' | 'masa2' | 'Ambele', isOpen: boolean) => {
    const isTableBlocked = table === 'Ambele' ? hasCooldown : cooldowns[table] > 0

    if (isTableBlocked || isPending) return

    setCooldowns(currentCooldowns =>
      table === 'Ambele'
        ? { masa1: cooldownSeconds, masa2: cooldownSeconds }
        : { ...currentCooldowns, [table]: cooldownSeconds }
    )
    setCooldownTarget(table)

    startTransition(async () => {
      try {
        await controlTable(table, isOpen ? 'open' : 'close')

        if (table === 'Ambele') {
          setTableStatus({ masa1: isOpen, masa2: isOpen })
        } else {
          setTableStatus(currentStatus => ({ ...currentStatus, [table]: isOpen }))
        }

        toast.success(
          table === 'Ambele'
            ? `Ambele mese au fost ${isOpen ? 'deschise' : 'închise'} cu succes.`
            : `${table === 'masa1' ? 'Masa 1' : 'Masa 2'} a fost ${isOpen ? 'deschisă' : 'închisă'} cu succes.`
        )
      } catch {
        setCooldowns(currentCooldowns =>
          table === 'Ambele' ? { masa1: 0, masa2: 0 } : { ...currentCooldowns, [table]: 0 }
        )
        setCooldownTarget(null)
        toast.error('Comanda pentru mese a eșuat.')
      }
    })
  }

  const updateLightsAndTv = (action: 'on' | 'off') => {
    if (isLightsAndTvPending) return

    startLightsAndTvTransition(async () => {
      try {
        await controlLightsAndTv(action)
        toast.success(action === 'on' ? 'Lumina și TV-ul au fost pornite.' : 'Lumina și TV-ul au fost oprite.')
      } catch {
        toast.error('Comanda pentru lumină și TV a eșuat.')
      }
    })
  }

  const updateAirConditioner = (action: 'on' | 'off') => {
    if (isAirConditionerPending) return

    setAirConditionerError(null)

    startAirConditionerTransition(async () => {
      try {
        await controlAirConditioner(action)
        toast.success(action === 'on' ? 'Clima a fost pornită cu succes.' : 'Clima a fost oprită cu succes.')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Comanda pentru climă a eșuat'

        setAirConditionerError(message)
        toast.error(message)
      }
    })
  }

  const updateDoor = (action: 'unlock' | 'lock') => {
    if (isDoorPending) return

    setDoorError(null)

    startDoorTransition(async () => {
      try {
        const result = await controlDoor(action)

        setDoorStatus(result.status)
        toast.success(action === 'unlock' ? 'Ușa a fost descuiată cu succes.' : 'Ușa a fost încuiată cu succes.')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Comanda pentru ușă a eșuat'

        setDoorError(message)
        toast.error(message)
      }
    })
  }

  useEffect(() => {
    startDoorTransition(async () => {
      try {
        const doorInfo = await getDoorStatus()

        setDoorStatus(doorInfo.status)
        setDoorBattery(doorInfo.batteryLevel)
        setDoorBatteryCritical(doorInfo.batteryCritical)
      } catch (error) {
        setDoorError(error instanceof Error ? error.message : 'Starea ușii nu a putut fi preluată')
      }
    })
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCooldowns(currentCooldowns => ({
        masa1: Math.max(0, currentCooldowns.masa1 - 1),
        masa2: Math.max(0, currentCooldowns.masa2 - 1)
      }))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <section className='flex flex-col gap-3' aria-labelledby='control-mese'>
        <h2 id='control-mese' className={sectionLabelClassName}>
          Mese
        </h2>
        <div className='grid grid-cols-1 gap-3 min-[420px]:grid-cols-2'>
          {(
            [
              { key: 'masa1', label: 'Masa 1', dotClassName: 'bg-emerald-400', textClassName: 'text-emerald-300' },
              { key: 'masa2', label: 'Masa 2', dotClassName: 'bg-blue-400', textClassName: 'text-blue-300' }
            ] as const
          ).map(table => {
            const isOpen = tableStatus[table.key]

            return (
              <div key={table.key} className={tileClassName}>
                {cooldownTarget === table.key && cooldowns[table.key] > 0 && (
                  <CooldownOverlay seconds={cooldowns[table.key]} />
                )}
                <div className='flex items-center justify-between gap-2'>
                  <span
                    className={cn(
                      'flex items-center gap-2 text-xs font-bold tracking-[0.14em] uppercase',
                      table.textClassName
                    )}
                  >
                    <span className={cn('size-2.5 rounded-full', table.dotClassName)} aria-hidden='true' />
                    {table.label}
                  </span>
                  {isOpen !== null && <span className='text-xs font-semibold'>{isOpen ? 'Deschisă' : 'Închisă'}</span>}
                </div>
                <OpenCloseButtons
                  onOpen={() => updateTable(table.key, true)}
                  onClose={() => updateTable(table.key, false)}
                  disabled={isPending || cooldowns[table.key] > 0}
                />
              </div>
            )
          })}
        </div>
        <div className={tileClassName}>
          {cooldownTarget === 'Ambele' && hasCooldown && <CooldownOverlay seconds={displayedCooldown} />}
          <span className='text-xs font-bold tracking-[0.14em] uppercase'>Ambele mese</span>
          <OpenCloseButtons
            onOpen={() => updateTable('Ambele', true)}
            onClose={() => updateTable('Ambele', false)}
            disabled={isPending || hasCooldown}
            openLabel='Deschide ambele'
            closeLabel='Închide ambele'
          />
        </div>
      </section>

      <section className='flex flex-col gap-3' aria-labelledby='control-echipamente'>
        <h2 id='control-echipamente' className={sectionLabelClassName}>
          Echipamente
        </h2>
        <div className='grid grid-cols-1 gap-3 min-[420px]:grid-cols-2'>
          <div className={tileClassName}>
            <span className='flex items-center gap-2 font-semibold'>
              <LightbulbIcon className='text-muted-foreground size-5' aria-hidden='true' />
              Lumină și TV
            </span>
            <OpenCloseButtons
              onOpen={() => updateLightsAndTv('on')}
              onClose={() => updateLightsAndTv('off')}
              disabled={isLightsAndTvPending}
              openLabel='Aprinde'
              closeLabel='Stinge'
            />
          </div>
          <div className={tileClassName}>
            <span className='flex items-center gap-2 font-semibold'>
              <AirVentIcon className='text-muted-foreground size-5' aria-hidden='true' />
              Climă
            </span>
            <OpenCloseButtons
              onOpen={() => updateAirConditioner('on')}
              onClose={() => updateAirConditioner('off')}
              disabled={isAirConditionerPending}
              openLabel={isAirConditionerPending ? 'Se trimite...' : 'Pornește'}
              closeLabel={isAirConditionerPending ? 'Se trimite...' : 'Oprește'}
            />
            {airConditionerError && <p className='text-destructive text-sm'>{airConditionerError}</p>}
          </div>
        </div>
      </section>

      <section className='flex flex-col gap-3' aria-labelledby='control-usa'>
        <h2 id='control-usa' className={sectionLabelClassName}>
          Ușă
        </h2>
        <div className={tileClassName}>
          {isDoorPending && (
            <div className='bg-background/90 absolute inset-0 z-10 flex items-center justify-center rounded-2xl px-4 text-center backdrop-blur-sm'>
              <span className='text-muted-foreground text-sm font-medium' role='status' aria-live='polite'>
                Se așteaptă răspunsul de la Nuki...
              </span>
            </div>
          )}
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <span className='flex items-center gap-2 font-semibold'>
              {doorStatus === 'unlocked' ? (
                <UnlockKeyholeIcon className='text-primary size-5' aria-hidden='true' />
              ) : (
                <LockKeyholeIcon className='text-muted-foreground size-5' aria-hidden='true' />
              )}
              {doorStatus === 'locked' ? 'Încuiată' : doorStatus === 'unlocked' ? 'Descuiată' : 'Stare necunoscută'}
            </span>
            <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
              <BatteryMediumIcon className='size-4' aria-hidden='true' />
              Baterie Nuki{' '}
              <span className='text-foreground font-medium'>
                {doorBattery !== null ? `${doorBattery}%` : doorBatteryCritical ? 'critică' : '–'}
              </span>
            </span>
          </div>
          <OpenCloseButtons
            onOpen={() => updateDoor('unlock')}
            onClose={() => updateDoor('lock')}
            disabled={isDoorPending}
            openLabel='Descuie'
            closeLabel='Încuie'
          />
          {doorError && <p className='text-destructive text-sm'>{doorError}</p>}
        </div>
      </section>
    </div>
  )
}

export default TableAvailabilityPanel
