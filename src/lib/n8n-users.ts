'use server'

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)

export type N8nUser = {
  id?: string
  name: string
  email: string
  passwordHash: string
}

export type N8nPublicUser = Omit<N8nUser, 'passwordHash'>

type N8nWebhookUser = Partial<N8nUser> & {
  Name?: string
  password_hash?: string
}

type N8nWebhookResponse = N8nWebhookUser[] | N8nWebhookUser | { users?: N8nWebhookResponse }

const getUsersWebhookUrl = () => {
  const url = process.env.N8N_USERS_WEBHOOK_URL?.trim()

  if (!url) throw new Error('Lipsește N8N_USERS_WEBHOOK_URL din configurarea serverului')

  return url
}

const getRegisterWebhookUrl = () => {
  const configuredUrl = process.env.N8N_USERS_REGISTER_WEBHOOK_URL?.trim()

  if (configuredUrl) return configuredUrl

  const baseUrl = process.env.N8N_API_URL?.trim().replace(/\/$/, '')

  return `${baseUrl || 'https://n8n-wf.pingplay.ro'}/webhook/pingplay-users-register`
}

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16)
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer

  return `${salt.toString('base64url')}.${derivedKey.toString('base64url')}`
}

export const verifyPassword = async (password: string, storedHash: string) => {
  const [saltValue, hashValue] = storedHash.split('.')

  if (!saltValue || !hashValue) return false

  try {
    const salt = Buffer.from(saltValue, 'base64url')
    const expectedHash = Buffer.from(hashValue, 'base64url')
    const actualHash = (await scrypt(password, salt, expectedHash.length)) as Buffer

    return actualHash.length === expectedHash.length && timingSafeEqual(actualHash, expectedHash)
  } catch {
    return false
  }
}

const callUsersWebhook = async (payload: Record<string, string>) => {
  const response = await fetch(getRegisterWebhookUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store'
  })

  const responseText = await response.text()
  let data: { user?: N8nUser; exists?: boolean; message?: string } = {}

  if (responseText.trim()) {
    try {
      data = JSON.parse(responseText) as typeof data
    } catch {
      throw new Error('Răspuns invalid de la workflow-ul n8n pentru utilizatori')
    }
  }

  if (!response.ok) throw new Error(data.message || `Workflow-ul n8n a returnat ${response.status}`)

  return data
}

export const getUsersFromWebhook = async (): Promise<N8nUser[]> => {
  const response = await fetch(getUsersWebhookUrl(), {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store'
  })

  const responseText = await response.text()

  if (!response.ok) throw new Error(`Workflow-ul n8n a returnat ${response.status}`)

  try {
    const data = JSON.parse(responseText) as N8nWebhookResponse

    const flattenRows = (value: N8nWebhookResponse): N8nWebhookUser[] => {
      if (Array.isArray(value)) return value.flatMap(item => flattenRows(item as N8nWebhookResponse))
      if ('users' in value && value.users) return flattenRows(value.users)

      return [value as N8nWebhookUser]
    }

    const rows = flattenRows(data)

    return rows.map(row => {
      const webhookUser = row as N8nWebhookUser

      return {
        id: webhookUser.id,
        name: webhookUser.name ?? webhookUser.Name ?? '',
        email: webhookUser.email ?? '',
        passwordHash: webhookUser.passwordHash ?? webhookUser.password_hash ?? ''
      }
    })
  } catch {
    throw new Error('Răspuns invalid de la workflow-ul n8n pentru utilizatori')
  }
}

export const findUserByEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase()
  const users = await getUsersFromWebhook()

  return users.find(user => user.email?.trim().toLowerCase() === normalizedEmail) ?? null
}

export const registerUser = async ({ name, email, password }: { name: string; email: string; password: string }) => {
  const result = await callUsersWebhook({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(password)
  })

  if (!result.user) throw new Error(result.message || 'Utilizatorul nu a putut fi creat')

  return result.user
}

export const getPublicUsersFromWebhook = async (): Promise<N8nPublicUser[]> => {
  const users = await getUsersFromWebhook()

  return users.map(({ id, name, email }) => ({ id, name, email }))
}
