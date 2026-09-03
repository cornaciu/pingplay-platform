'use client'

import { CameraIcon, Maximize2Icon, PlayIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type CameraStream = {
  name: string
  url?: string
  rtspConfigured?: boolean
}

type CameraMonitorCardProps = {
  streams: CameraStream[]
}

const CameraFeed = ({ name, url, rtspConfigured }: CameraStream) => {
  return (
    <div className='bg-muted/30 border-border/60 overflow-hidden rounded-md border'>
      <div className='flex items-center justify-between gap-2 border-b px-3 py-2'>
        <div className='flex min-w-0 items-center gap-2'>
          <CameraIcon className='text-muted-foreground size-4 shrink-0' />
          <span className='truncate text-sm font-medium'>{name}</span>
        </div>
        {url && (
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-foreground shrink-0'
            aria-label={`Deschide ${name} într-un tab nou`}
          >
            <Maximize2Icon className='size-4' />
          </a>
        )}
      </div>
      <div className='bg-muted relative aspect-video'>
        {url ? (
          <video
            className='size-full object-cover'
            src={url}
            autoPlay
            muted
            playsInline
            controls
            preload='metadata'
            aria-label={`Flux video ${name}`}
          />
        ) : (
          <div className='text-muted-foreground flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-sm'>
            <PlayIcon className='size-5' />
            <span>
              {rtspConfigured
                ? `RTSP este configurat pentru ${name}, dar lipsește fluxul HLS/WebRTC pentru browser.`
                : `Fluxul pentru ${name} nu este configurat.`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

const CameraMonitorCard = ({ streams }: CameraMonitorCardProps) => {
  const configuredStreams = streams.filter(stream => stream.url)

  return (
    <Card className='col-span-full w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CameraIcon className='size-4' />
          Camere de supraveghere
        </CardTitle>
        <p className='text-muted-foreground text-sm'>
          {configuredStreams.length > 0
            ? `${configuredStreams.length} flux${configuredStreams.length === 1 ? '' : 'uri'} configurat${configuredStreams.length === 1 ? '' : 'e'}`
            : 'Configurează fluxurile HLS sau WebRTC pentru a începe vizualizarea.'}
        </p>
      </CardHeader>
      <CardContent className={cn('grid gap-4', streams.length > 1 && 'md:grid-cols-2')}>
        {streams.map(stream => (
          <CameraFeed key={stream.name} {...stream} />
        ))}
      </CardContent>
    </Card>
  )
}

export default CameraMonitorCard
