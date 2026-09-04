'use client'

import { useEffect, useState, useTransition } from 'react'

import { toast } from 'sonner'

import {
  AirVentIcon,
  BatteryMediumIcon,
  CheckCircle2Icon,
  LockKeyholeIcon,
  PowerIcon,
  UnlockKeyholeIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  controlAirConditioner,
  controlDoor,
  controlLightsAndTv,
  controlTable,
  getDoorStatus
} from '@/app/server/actions'

const TableAvailabilityPanel = () => {
  const cooldownSeconds = 26
  const [tableStatus, setTableStatus] = useState({ masa1: true, masa2: true })

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
    <Card className='h-full w-full lg:col-span-1'>
      <CardHeader>
        <p className='text-foreground mb-3 text-base font-semibold'>Control mese</p>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col justify-between gap-4 [&_button]:h-12'>
        <div className='flex flex-col gap-2'>
          {(
            [
              { key: 'masa1', label: 'MASA 1' },
              { key: 'masa2', label: 'MASA 2' }
            ] as const
          ).map(table => {
            const isOpen = tableStatus[table.key]

            return (
              <div
                key={table.key}
                className='border-border relative flex flex-col items-stretch gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between'
              >
                {cooldownTarget === table.key && cooldowns[table.key] > 0 && (
                  <div className='bg-background/90 absolute inset-0 z-10 flex items-center justify-center rounded-md backdrop-blur-sm'>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Poți efectua o nouă acțiune peste {cooldowns[table.key]}s.
                    </span>
                  </div>
                )}
                <div className='flex min-w-0 items-center gap-2'>
                  {isOpen ? (
                    <UnlockKeyholeIcon className='size-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
                  ) : (
                    <LockKeyholeIcon className='text-destructive size-4 shrink-0' />
                  )}
                  <span className='font-medium'>{table.label}</span>
                </div>
                <div className='grid w-full gap-2 sm:w-auto sm:grid-cols-2'>
                  <Button
                    variant='destructive'
                    size='sm'
                    className='w-full'
                    onClick={() => updateTable(table.key, false)}
                    disabled={isPending || cooldowns[table.key] > 0}
                  >
                    Închide
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-emerald-600/50 text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-400'
                    onClick={() => updateTable(table.key, true)}
                    disabled={isPending || cooldowns[table.key] > 0}
                  >
                    Deschide
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className='border-border relative grid gap-2 border-t pt-4 sm:grid-cols-2'>
          {cooldownTarget === 'Ambele' && hasCooldown && (
            <div className='bg-background/90 absolute inset-0 z-10 flex items-center justify-center rounded-md backdrop-blur-sm'>
              <span className='text-muted-foreground text-center text-sm font-medium'>
                Poți efectua o nouă acțiune peste {displayedCooldown}s.
              </span>
            </div>
          )}
          <Button
            variant='outline'
            className='border-emerald-600/50 text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-400'
            onClick={() => updateTable('Ambele', true)}
            disabled={isPending || hasCooldown}
          >
            <CheckCircle2Icon />
            Deschide ambele mese
          </Button>
          <Button
            variant='destructive'
            onClick={() => updateTable('Ambele', false)}
            disabled={isPending || hasCooldown}
          >
            <LockKeyholeIcon />
            Închide ambele mese
          </Button>
        </div>

        <div className='border-border border-t pt-4'>
          <p className='text-foreground mb-3 text-base font-semibold'>Control lumină și TV</p>
          <div className='grid gap-2 sm:grid-cols-2'>
            <Button
              variant='outline'
              className='border-emerald-600/50 text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-400'
              onClick={() => updateLightsAndTv('on')}
              disabled={isLightsAndTvPending}
            >
              <PowerIcon />
              Aprinde lumina și TV
            </Button>
            <Button variant='destructive' onClick={() => updateLightsAndTv('off')} disabled={isLightsAndTvPending}>
              <PowerIcon />
              Stinge lumina și TV
            </Button>
          </div>
        </div>

        <div className='border-border border-t pt-4'>
          <p className='text-foreground mb-3 text-base font-semibold'>Control climă</p>
          <div className='grid gap-2 sm:grid-cols-2'>
            <Button
              variant='outline'
              className='border-emerald-600/50 text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-400'
              onClick={() => updateAirConditioner('on')}
              disabled={isAirConditionerPending}
            >
              <AirVentIcon />
              {isAirConditionerPending ? 'Se procesează...' : 'Pornește clima'}
            </Button>
            <Button
              variant='destructive'
              onClick={() => updateAirConditioner('off')}
              disabled={isAirConditionerPending}
            >
              <AirVentIcon />
              {isAirConditionerPending ? 'Se procesează...' : 'Oprește clima'}
            </Button>
          </div>
          {airConditionerError && <p className='text-destructive text-sm'>{airConditionerError}</p>}
        </div>

        <div className='border-border border-t pt-4'>
          <p className='text-foreground mb-3 text-base font-semibold'>Control ușă</p>
          <p className='text-muted-foreground mb-2 text-sm'>
            Stare inițială:{' '}
            <span className='text-foreground font-medium'>
              {doorStatus === 'locked' ? 'Încuiată' : doorStatus === 'unlocked' ? 'Descuiată' : 'Necunoscută'}
            </span>
          </p>
          <p className='text-muted-foreground mb-3 flex items-center gap-1.5 text-sm'>
            <BatteryMediumIcon className='size-4' />
            Baterie Nuki:{' '}
            <span className='text-foreground font-medium'>
              {doorBattery !== null ? `${doorBattery}%` : doorBatteryCritical ? 'Critică' : 'Necunoscută'}
            </span>
          </p>
          <div className='relative'>
            {isDoorPending && (
              <div className='bg-background/90 absolute inset-0 z-10 flex items-center justify-center rounded-md px-4 text-center backdrop-blur-sm'>
                <span className='text-muted-foreground text-sm font-medium' role='status' aria-live='polite'>
                  Se așteaptă răspunsul de la Nuki...
                </span>
              </div>
            )}
            <div className='grid gap-2 sm:grid-cols-2'>
              <Button
                variant='outline'
                className='border-emerald-600/50 text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-400'
                onClick={() => updateDoor('unlock')}
                disabled={isDoorPending}
              >
                <UnlockKeyholeIcon />
                Descuie ușa
              </Button>
              <Button variant='destructive' onClick={() => updateDoor('lock')} disabled={isDoorPending}>
                <LockKeyholeIcon />
                Încuie ușa
              </Button>
            </div>
          </div>
          {doorError && <p className='text-destructive text-sm'>{doorError}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default TableAvailabilityPanel
