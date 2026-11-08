'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { LockKeyholeIcon, ThermometerIcon, UnlockKeyholeIcon } from 'lucide-react'

import { getDoorStatus, getThermostatStatus } from '@/app/server/actions'
import type { NukiDoorInfo, ThermostatStatus } from '@/app/server/actions'

const MODE_LABELS: Record<string, string> = { manual: 'Normal', eco: 'Eco', program: 'Program' }

const chipClassName =
  'bg-secondary hover:bg-accent focus-visible:outline-ring inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors focus-visible:outline-2'

// Live thermostat and door state as small chips; tapping one opens the Control page.
const LocationStatusChips = () => {
  const [thermostat, setThermostat] = useState<ThermostatStatus | null>(null)
  const [door, setDoor] = useState<NukiDoorInfo | null>(null)

  useEffect(() => {
    getThermostatStatus()
      .then(setThermostat)
      .catch(() => undefined)
    getDoorStatus()
      .then(setDoor)
      .catch(() => undefined)
  }, [])

  const temperature =
    thermostat?.temperature != null
      ? `${thermostat.temperature.toLocaleString('ro-RO', { maximumFractionDigits: 1 })} °C`
      : '– °C'

  const mode = thermostat?.mode ? (MODE_LABELS[thermostat.mode] ?? thermostat.mode) : null
  const doorLabel = door?.status === 'locked' ? 'Ușă încuiată' : door?.status === 'unlocked' ? 'Ușă descuiată' : 'Ușă –'

  return (
    <div className='flex flex-wrap gap-2'>
      <Link href='/dashboard/control' className={chipClassName}>
        <ThermometerIcon className='text-primary size-3.5' aria-hidden='true' />
        {temperature}
        {mode && <span className='text-muted-foreground'>· {mode}</span>}
      </Link>
      <Link href='/dashboard/control' className={chipClassName}>
        {door?.status === 'unlocked' ? (
          <UnlockKeyholeIcon className='text-primary size-3.5' aria-hidden='true' />
        ) : (
          <LockKeyholeIcon className='size-3.5 text-emerald-300' aria-hidden='true' />
        )}
        {doorLabel}
      </Link>
    </div>
  )
}

export default LocationStatusChips
