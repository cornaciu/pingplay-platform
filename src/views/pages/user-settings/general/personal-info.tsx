'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Third-party Imports
import { ImageIcon, Trash2Icon, UploadCloudIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const countries = [
  {
    value: 'india',
    label: 'India',
    flag: '/images/flags/india.webp'
  },
  {
    value: 'china',
    label: 'China',
    flag: '/images/flags/china.webp'
  },
  {
    value: 'monaco',
    label: 'Monaco',
    flag: '/images/flags/monaco.webp'
  },
  {
    value: 'serbia',
    label: 'Serbia',
    flag: '/images/flags/serbia.webp'
  },
  {
    value: 'romania',
    label: 'România',
    flag: '/images/flags/romania.webp'
  },
  {
    value: 'mayotte',
    label: 'Mayotte',
    flag: '/images/flags/mayotte.webp'
  },
  {
    value: 'iraq',
    label: 'Irak',
    flag: '/images/flags/iraq.webp'
  },
  {
    value: 'syria',
    label: 'Siria',
    flag: '/images/flags/syria.webp'
  },
  {
    value: 'korea',
    label: 'Coreea',
    flag: '/images/flags/korea.webp'
  },
  {
    value: 'zimbabwe',
    label: 'Zimbabwe',
    flag: '/images/flags/zimbabwe.webp'
  }
]

const PersonalInfo = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      const t = window.setTimeout(() => setPreview(null), 0)

      return () => clearTimeout(t)
    }

    const url = URL.createObjectURL(file)

    const t = window.setTimeout(() => setPreview(url), 0)

    return () => {
      clearTimeout(t)
      URL.revokeObjectURL(url)
    }
  }, [file])

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]

    if (!f) return

    if (!f.type.startsWith('image/')) {
      window.alert('Selectează un fișier imagine')
      e.currentTarget.value = ''

      return
    }

    if (f.size > 1024 * 1024) {
      window.alert('Fișierul trebuie să fie mai mic de 1 MB')
      e.currentTarget.value = ''

      return
    }

    setFile(f)
  }

  const openPicker = () => inputRef.current?.click()

  const remove = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      {/* Lista taburilor verticale */}
      <div className='flex flex-col space-y-1'>
        <h3 className='text-base font-semibold'>Informații personale</h3>
        <p className='text-muted-foreground text-sm'>Gestionează informațiile personale și rolul tău.</p>
      </div>

      {/* Conținut */}
      <div className='space-y-6 lg:col-span-2'>
        <form className='mx-auto'>
          <div className='mb-6 w-full space-y-2'>
            <Label>Avatarul tău</Label>
            <div className='flex items-center gap-4'>
              <div
                role='button'
                tabIndex={0}
                aria-label='Încarcă avatarul tău'
                onClick={openPicker}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openPicker()
                  }
                }}
                className='flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed hover:opacity-95'
              >
                {preview ? (
                  <img src={preview} alt='Previzualizare avatar' className='h-full w-full object-cover' />
                ) : (
                  <ImageIcon />
                )}
              </div>

              <div className='flex items-center gap-2'>
                <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={onSelect} />
                <Button type='button' variant='outline' onClick={openPicker} className='flex items-center gap-2'>
                  <UploadCloudIcon />
                  Încarcă avatarul
                </Button>
                <Button type='button' variant='ghost' onClick={remove} disabled={!file} className='text-destructive!'>
                  <Trash2Icon />
                </Button>
              </div>
            </div>
            <p className='text-muted-foreground text-sm'>Alege o fotografie de cel mult 1 MB.</p>
          </div>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='multi-step-personal-info-first-name'>Prenume</Label>
              <Input id='multi-step-personal-info-first-name' placeholder='Ion' />
            </div>
            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='multi-step-personal-info-last-name'>Nume</Label>
              <Input id='multi-step-personal-info-last-name' placeholder='Popescu' />
            </div>
            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='multi-step-personal-info-mobile'>Telefon</Label>
              <Input id='multi-step-personal-info-mobile' type='tel' placeholder='+40 700 000 000' />
            </div>
            <div className='flex flex-col items-start gap-2'>
              <Label htmlFor='country'>Țară</Label>
              <Select defaultValue='1' required items={countries}>
                <SelectTrigger id='country' className='w-full'>
                  <SelectValue placeholder='Selectează țara'>
                    {(value: string) => {
                      const country = countries.find(c => c.value === value)

                      return country ? (
                        <span className='flex items-center gap-2'>
                          <img src={country.flag} alt={`Steagul țării ${country.label}`} className='h-4 w-5 shrink-0' />
                          <span className='truncate'>{country.label}</span>
                        </span>
                      ) : (
                        <span>Selectează țara</span>
                      )
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className='max-h-100'>
                  <SelectGroup>
                    {countries.map(country => (
                      <SelectItem key={country.value} value={country.value}>
                        <img src={country.flag} alt={`Steagul țării ${country.label}`} className='h-4 w-5' />{' '}
                        <span className='truncate'>{country.label}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='gender'>Gen</Label>
              <Select>
                <SelectTrigger id='gender' className='w-full'>
                  <SelectValue placeholder='Selectează genul' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='male'>Masculin</SelectItem>
                    <SelectItem value='female'>Feminin</SelectItem>
                    <SelectItem value='other'>Altul</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='role'>Rol</Label>
              <Select>
                <SelectTrigger id='role' className='w-full'>
                  <SelectValue placeholder='Selectează rolul' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='admin'>Administrator</SelectItem>
                    <SelectItem value='user'>Utilizator</SelectItem>
                    <SelectItem value='other'>Altul</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <div className='flex justify-end'>
          <Button type='submit' className='max-sm:w-full'>
            Salvează modificările
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo
