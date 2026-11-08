'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'

import { toast } from 'sonner'

import { LeafIcon, MinusIcon, PlusIcon, RefreshCwIcon, SunIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

const formatDegrees = (value: number | null, unit = ' °C') =>
  value === null ? '–' : `${value.toLocaleString('ro-RO', { maximumFractionDigits: 1 })}${unit}`

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
    <section className='flex min-w-0 flex-col gap-3' aria-labelledby='control-termostat'>
      <h2 id='control-termostat' className='text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase'>
        Termostat
      </h2>
      <div className='bg-card flex flex-col gap-4 rounded-2xl border p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col'>
            <span className='text-5xl leading-none font-semibold tracking-tight tabular-nums'>
              {formatDegrees(status?.temperature ?? null, '°')}
            </span>
            <span className='text-muted-foreground mt-2 text-sm'>
              În sală · {status?.heating ? 'încălzește acum' : 'nu încălzește'}
            </span>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              className='size-11 rounded-full'
              aria-label='Scade temperatura'
              onClick={() => adjustDraft(-1)}
              disabled={controlsDisabled || (draftSetpoint ?? 0) <= minSetpoint}
            >
              <MinusIcon />
            </Button>
            <div className='flex w-14 flex-col items-center'>
              <span className='text-primary text-2xl font-semibold tabular-nums' aria-live='polite'>
                {formatDegrees(draftSetpoint, '°')}
              </span>
              <span className='text-muted-foreground text-[11px]'>setat</span>
            </div>
            <Button
              variant='outline'
              size='icon'
              className='size-11 rounded-full'
              aria-label='Crește temperatura'
              onClick={() => adjustDraft(1)}
              disabled={controlsDisabled || (draftSetpoint ?? Infinity) >= maxSetpoint}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>

        {hasDraftChange && (
          <div className='flex flex-col gap-2'>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                className='h-11'
                onClick={() => setDraftSetpoint(status?.setpoint ?? null)}
                disabled={controlsDisabled}
              >
                Renunță
              </Button>
              <Button
                className='h-11'
                onClick={() =>
                  draftSetpoint !== null &&
                  sendChange(
                    { setpoint: draftSetpoint },
                    `Temperatura a fost setată la ${formatDegrees(draftSetpoint)}.`
                  )
                }
                disabled={controlsDisabled}
              >
                {isSaving ? 'Se trimite...' : `Setează ${formatDegrees(draftSetpoint)}`}
              </Button>
            </div>
            {status?.mode === 'program' && (
              <p className='text-muted-foreground text-xs'>
                În modul Program, termostatul poate reveni la temperatura din program la următorul interval.
              </p>
            )}
          </div>
        )}

        <div
          role='group'
          aria-label='Mod de funcționare'
          className='bg-muted grid gap-1.5 rounded-xl p-1'
          style={{
            gridTemplateColumns: `repeat(${(status?.modes ?? Object.keys(MODE_LABELS)).length}, minmax(0, 1fr))`
          }}
        >
          {(status?.modes ?? Object.keys(MODE_LABELS)).map(mode => {
            const { label, icon: ModeIcon } = MODE_LABELS[mode] ?? { label: mode, icon: SunIcon }
            const isActive = status?.mode === mode

            return (
              <Button
                key={mode}
                variant={isActive ? 'default' : 'ghost'}
                aria-pressed={isActive}
                className='h-11 rounded-lg'
                onClick={() => sendChange({ mode }, `Termostatul a trecut în modul ${label}.`)}
                disabled={controlsDisabled || isActive}
              >
                <ModeIcon />
                {label}
              </Button>
            )
          })}
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3 border-t pt-3'>
          <label className='flex items-center gap-3 text-sm font-medium'>
            <Switch
              checked={status?.power ?? false}
              disabled={controlsDisabled || status?.power === null}
              onCheckedChange={checked =>
                sendChange({ power: checked }, checked ? 'Termostatul a fost pornit.' : 'Termostatul a fost oprit.')
              }
            />
            {status?.power === true ? 'Pornit' : isOff ? 'Oprit' : 'Pornit / oprit'}
          </label>
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground h-11'
            onClick={loadStatus}
            disabled={isLoading}
          >
            <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
            Citit la {formatReadAt(status?.readAt ?? null)}
          </Button>
        </div>

        {error && <p className='text-destructive text-sm'>{error}</p>}
      </div>
    </section>
  )
}

export default ThermostatPanel
