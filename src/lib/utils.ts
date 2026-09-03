import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitialsFromName(name: string) {
  return name
    .split(' ')
    .map(namePart => namePart[0])
    .join('')
}
