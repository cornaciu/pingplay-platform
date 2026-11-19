'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'

import { toast } from 'sonner'

import { FlameIcon, LeafIcon, MinusIcon, PlusIcon, RefreshCwIcon, SunIcon, ThermometerIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { getThermostatStatus, updateThermostat } from '@/app/server/actions'
import type { ThermostatChange, ThermostatStatus } from '@/app/server/actions'

const REFRESH_INTERVAL_MS = 60_000

// Tuya needs a moment before the shadow properties reflect a command.
const CONFIRM_DELAY_MS = 2_500

const MODE_LABELS: Record<string, { label: string; icon: typeof SunIcon }> = {
  manual: { label: 'Normal', icon: SunIcon },
  eco: { label: 'Eco', icon: LeafIcon },
  program: { label: 'Program', icon: RefreshCwIcon }
}

const formatDegrees = (value: number | null) =>
  value === null ? '–' : `${value.toLocaleString('ro-RO', { maximumFractionDigits: 1 })} °C`

const formatReadAt = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('ro-RO', { timeStyle: 'short', dateStyle: 'short', timeZone: 'Europe/Bucharest' }).format(
        new Date(value)
      )
    : '–'

const ThermostatPanel = () => {
  const [status, setStatus] = useState<ThermostatStatus | null>(null)
  const [draftSetpoint, setDraftSetpoint] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, startLoading] = useTransition()
  const [isSaving, startSaving] = useTransition()

  const loadStatus = useCallback(() => {
    startLoading(async () => {
      try {
        const nextStatus = await getThermostatStatus()

        setStatus(nextStatus)
        setDraftSetpoint(nextStatus.setpoint)
        setError(null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Starea termostatului nu a putut fi citită')
      }
    })
  }, [])

  useEffect(() => {
    loadStatus()

    const timer = window.setInterval(loadStatus, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [loadStatus])

  const sendChange = (change: ThermostatChange, successMessage: string) => {
    if (isSaving) return

    startSaving(async () => {
      try {
        await updateThermostat(change)
        setStatus(current => (current ? { ...current, ...change } : current))
        toast.success(successMessage)
        await new Promise(resolve => setTimeout(resolve, CONFIRM_DELAY_MS))
        loadStatus()
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : 'Comanda pentru termostat a eșuat'

        setError(message)
        toast.error(message)
      }
    })
  }

  const step = status?.step ?? 0.5
  const minSetpoint = status?.minSetpoint ?? 5
  const maxSetpoint = status?.maxSetpoint ?? 35

  const adjustDraft = (direction: 1 | -1) => {
    setDraftSetpoint(current => {
      const base = current ?? status?.setpoint ?? 20
      const next = Math.round((base + direction * step) * 10) / 10

      return Math.min(maxSetpoint, Math.max(minSetpoint, next))
    })
  }

  const hasDraftChange = draftSetpoint !== null && draftSetpoint !== status?.setpoint
  const isOff = status?.power === false
  const controlsDisabled = !status || isSaving

  return (
    <Card className='order-2 col-span-full w-full min-w-0'>
      <CardHeader className='flex flex-row flex-wrap items-start justify-between gap-3'>
        <div>
          <p className='text-foreground text-lg font-semibold tracking-tight'>Termostat</p>
          <p className='text-muted-foreground text-xs'>Ultima citire: {formatReadAt(status?.readAt ?? null)}</p>
        </div>
        <Button variant='outline' size='sm' onClick={loadStatus} disabled={isLoading}>
          <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
          Reîmprospătează
        </Button>
      </CardHeader>
      <CardContent className='grid gap-5 md:grid-cols-3'>
        <div className='bg-muted/30 border-border flex flex-col gap-2 rounded-xl border p-4'>
          <span className='text-muted-foreground flex items-center gap-2 text-sm'>
            <ThermometerIcon className='size-4' />
            Temperatura în sală
          </span>
          <span className='text-4xl font-semibold tracking-tight tabular-nums'>
            {formatDegrees(status?.temperature ?? null)}
          </span>
          <span
            className={cn(
              'inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
              status?.heating
                ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <FlameIcon className='size-3.5' />
            {status?.heating ? 'Încălzește acum' : 'Nu încălzește'}
          </span>
          <label className='mt-auto flex items-center justify-between gap-3 border-t pt-3 text-sm'>
            <span className='font-medium'>{isOff ? 'Termostat oprit' : 'Termostat pornit'}</span>
            <Switch
              checked={status?.power ?? false}
              disabled={controlsDisabled || status?.power === null}
              onCheckedChange={checked =>
                sendChange({ power: checked }, checked ? 'Termostatul a fost pornit.' : 'Termostatul a fost oprit.')
              }
            />
          </label>
        </div>

        <div className='bg-muted/30 border-border flex flex-col gap-3 rounded-xl border p-4'>
          <span className='text-muted-foreground text-sm'>Temperatura dorită</span>
          <div className='flex items-center justify-between gap-3'>
            <Button
              variant='outline'
              size='icon'
              aria-label='Scade temperatura'
              onClick={() => adjustDraft(-1)}
              disabled={controlsDisabled || (draftSetpoint ?? 0) <= minSetpoint}
            >
              <MinusIcon />
            </Button>
            <span className='text-3xl font-semibold tabular-nums' aria-live='polite'>
              {formatDegrees(draftSetpoint)}
            </span>
            <Button
              variant='outline'
              size='icon'
              aria-label='Crește temperatura'
              onClick={() => adjustDraft(1)}
              disabled={controlsDisabled || (draftSetpoint ?? Infinity) >= maxSetpoint}
            >
              <PlusIcon />
            </Button>
          </div>
          <p className='text-muted-foreground text-xs'>
            Interval {formatDegrees(minSetpoint)} – {formatDegrees(maxSetpoint)}, pas {step.toLocaleString('ro-RO')} °C
          </p>
          <div className='mt-auto grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              onClick={() => setDraftSetpoint(status?.setpoint ?? null)}
              disabled={controlsDisabled || !hasDraftChange}
            >
              Renunță
            </Button>
            <Button
              onClick={() =>
                draftSetpoint !== null &&
                sendChange({ setpoint: draftSetpoint }, `Temperatura a fost setată la ${formatDegrees(draftSetpoint)}.`)
              }
              disabled={controlsDisabled || !hasDraftChange}
            >
              {isSaving ? 'Se trimite...' : 'Aplică'}
            </Button>
          </div>
          {status?.mode === 'program' && hasDraftChange && (
            <p className='text-muted-foreground text-xs'>
              În modul Program, termostatul poate reveni la temperatura din program la următorul interval.
            </p>
          )}
        </div>

        <div className='bg-muted/30 border-border flex flex-col gap-3 rounded-xl border p-4'>
          <span className='text-muted-foreground text-sm'>Mod de funcționare</span>
          <div className='grid gap-2'>
            {(status?.modes ?? Object.keys(MODE_LABELS)).map(mode => {
              const { label, icon: ModeIcon } = MODE_LABELS[mode] ?? { label: mode, icon: SunIcon }
              const isActive = status?.mode === mode

              return (
                <Button
                  key={mode}
                  variant={isActive ? 'default' : 'outline'}
                  aria-pressed={isActive}
                  className='justify-start'
                  onClick={() => sendChange({ mode }, `Termostatul a trecut în modul ${label}.`)}
                  disabled={controlsDisabled || isActive}
                >
                  <ModeIcon />
                  {label}
                </Button>
              )
            })}
          </div>
        </div>

        {error && <p className='text-destructive col-span-full text-sm'>{error}</p>}
      </CardContent>
    </Card>
  )
}

export default ThermostatPanel
