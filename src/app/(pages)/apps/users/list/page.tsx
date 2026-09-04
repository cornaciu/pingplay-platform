// Component Imports
import UserListApp from '@/views/apps/users/list'
import { getPublicUsersFromWebhook } from '@/lib/n8n-users'
import type { AppUser, UserRole, UserPlan, UserStatus } from '@/types/apps/user-types'

export const dynamic = 'force-dynamic'

const mapUser = (user: Awaited<ReturnType<typeof getPublicUsersFromWebhook>>[number], index: number): AppUser => ({
  id: user.id ?? `n8n-user-${index}`,
  name: user.name,
  email: user.email,
  role: 'Subscriber' as UserRole,
  plan: 'Basic' as UserPlan,
  status: 'Active' as UserStatus,
  billing: 'Manual',
  joinedDate: new Date().toISOString()
})

const UsersPage = async () => {
  let users: AppUser[] = []

  try {
    const webhookUsers = await getPublicUsersFromWebhook()

    users = webhookUsers.map(mapUser)
  } catch {
    users = []
  }

  return <UserListApp initialUsers={users} />
}

export default UsersPage
