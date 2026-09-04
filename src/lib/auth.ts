'use server'

import { createHmac, timingSafeEqual } from 'node:crypto'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { findUserByEmail, registerUser, verifyPassword } from '@/lib/n8n-users'

const AUTH_COOKIE_NAME = 'pingplay_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7

const getAuthConfig = () => {
  const email = process.env.AUTH_EMAIL?.trim()
  const password = process.env.AUTH_PASSWORD
  const secret = process.env.AUTH_SECRET
  const name = process.env.AUTH_NAME?.trim() || email?.split('@')[0] || 'Utilizator'
  const usersWebhookUrl = process.env.N8N_USERS_WEBHOOK_URL?.trim()

  if (!secret || (!usersWebhookUrl && (!email || !password))) {
    throw new Error('Lipsesc AUTH_SECRET sau configurarea autentificării din server')
  }

  return { email, password, secret, name, usersWebhookUrl }
}

const signSession = (secret: string, payload: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url')

const createSessionValue = (secret: string, user: { email: string; name: string }) => {
  const payload = Buffer.from(JSON.stringify({ ...user, issuedAt: Date.now() })).toString('base64url')

  return `${payload}.${signSession(secret, payload)}`
}

const getValidSessionUser = (value: string | undefined, secret: string) => {
  if (!value) return false

  const [payload, signature] = value.split('.')

  if (!payload || !signature) return false

  const expectedSignature = signSession(secret, payload)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return false

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: string
      name?: string
      issuedAt?: number
    }

    if (!session.email || !session.name || !session.issuedAt) return false
    if (Date.now() - session.issuedAt > SESSION_DURATION_SECONDS * 1000) return false

    return { email: session.email, name: session.name }
  } catch {
    return false
  }
}

export const login = async (_previousState: string | null, formData: FormData) => {
  const { email: configuredEmail, password: configuredPassword, secret, usersWebhookUrl } = getAuthConfig()

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()

  const password = String(formData.get('password') ?? '')
  let authenticatedUser: { email: string; name: string } | null = null

  if (usersWebhookUrl) {
    const user = await findUserByEmail(email)

    if (user && (await verifyPassword(password, user.passwordHash))) {
      authenticatedUser = { email: user.email, name: user.name }
    }
  } else if (email === configuredEmail?.toLowerCase() && password === configuredPassword) {
    authenticatedUser = { email: configuredEmail, name: getAuthConfig().name }
  }

  if (!authenticatedUser) return 'Emailul sau parola sunt incorecte.'

  const cookieStore = await cookies()

  cookieStore.set(AUTH_COOKIE_NAME, createSessionValue(secret, authenticatedUser), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_SECONDS,
    path: '/'
  })

  redirect('/dashboard/rezervari')
}

export const register = async (_previousState: string | null, formData: FormData) => {
  const name = String(formData.get('name') ?? '').trim()

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()

  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const privacyAccepted = formData.get('privacyPolicy') === 'on'

  if (!name || !email || !password || !confirmPassword) return 'Completează toate câmpurile obligatorii.'
  if (!email.includes('@')) return 'Introdu o adresă de email validă.'
  if (password.length < 8) return 'Parola trebuie să aibă cel puțin 8 caractere.'
  if (password !== confirmPassword) return 'Parolele nu coincid.'
  if (!privacyAccepted) return 'Trebuie să accepți regulamentul și politica de confidențialitate.'

  try {
    await registerUser({ name, email, password })
  } catch (error) {
    return error instanceof Error ? error.message : 'Utilizatorul nu a putut fi creat.'
  }

  redirect('/pages/auth/login')
}

export const requireAuth = async () => {
  const { secret } = getAuthConfig()
  const cookieStore = await cookies()
  const user = getValidSessionUser(cookieStore.get(AUTH_COOKIE_NAME)?.value, secret)

  if (!user) {
    redirect('/pages/auth/login')
  }

  return {
    fullName: user.name,
    email: user.email,
    imageUrl: '/images/avatars/avatar-1.webp',
    initials: user.name
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
}

export const logout = async () => {
  const cookieStore = await cookies()

  cookieStore.delete(AUTH_COOKIE_NAME)
  redirect('/pages/auth/login')
}
