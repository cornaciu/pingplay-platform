// Third-party Imports
import type * as Icon from 'lucide-react'

type IconName = keyof typeof Icon

export type MenuLeafSubItem = {
  label: string
  href: string
  activePath?: string
  badge?: string
  badgeClassName?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export type MenuGroupSubItem = {
  label: string
  childItems: MenuLeafSubItem[]
}

export type MenuSubItem = MenuLeafSubItem | MenuGroupSubItem

export type MenuItem = {
  icon: IconName
  label: string
} & (
  | {
      href: string
      badge?: string
      badgeClassName?: string
      childItems?: never
      target?: '_blank' | '_self' | '_parent' | '_top'
    }
  | {
      href?: never
      badge?: string
      badgeClassName?: string
      childItems: MenuSubItem[]
    }
)

export type NavItem = {
  groupLabel?: string
  items: MenuItem[]
}

const allNavItems: NavItem[] = [
  {
    groupLabel: 'Dashboard & Layouts',
    items: [
      {
        icon: 'CalendarCheck',
        label: 'Rezervari',
        href: '/dashboard/rezervari'
      },
      {
        icon: 'TrendingUp',
        label: 'Sales',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/dashboard/sales',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'Wallet',
        label: 'Finance',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/dashboard/finance',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'Truck',
        label: 'Logistics',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/dashboard/logistics',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'Briefcase',
        label: 'Productivity',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/dashboard/productivity',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'Megaphone',
        label: 'Campaign',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/dashboard/campaign',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'BarChart3',
        label: 'Analytics',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/dashboard/analytics',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'CreditCard',
        label: 'Payments',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/dashboard/payments',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'ShoppingCart',
        label: 'eCommerce',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/dashboard/ecommerce',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'LayoutTemplate',
        label: 'Layouts',
        badge: 'Pro',
        badgeClassName: 'right-8',
        childItems: [
          {
            label: 'Full Navbar',
            href: 'https://shadcn-nextjs-admincn-full-navbar-layout-admin-template.vercel.app/',
            target: '_blank'
          },
          {
            label: 'Horizontal',
            href: 'https://shadcn-nextjs-admincn-horizontal-layout-admin-template.vercel.app/',
            target: '_blank'
          },
          {
            label: 'Split',
            href: 'https://shadcn-nextjs-admincn-split-layout-admin-template.vercel.app/',
            target: '_blank'
          },
          {
            label: 'Icon Menu',
            href: 'https://shadcn-nextjs-admincn-icon-menu-layout-admin-template.vercel.app/',
            target: '_blank'
          },
          {
            label: 'Paper',
            href: 'https://shadcn-nextjs-admincn-paper-layout-admin-template.vercel.app/',
            target: '_blank'
          }
        ]
      }
    ]
  },
  {
    groupLabel: 'Apps',
    items: [
      {
        icon: 'CalendarIcon',
        label: 'Calendar',
        href: '/apps/calendar'
      },
      {
        icon: 'UsersIcon',
        label: 'Users',
        childItems: [
          { label: 'List', href: '/apps/users/list' },
          { label: 'View', href: '/apps/users/view' }
        ]
      },
      {
        icon: 'MessageCircleIcon',
        label: 'Chat',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/apps/chat',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'SquareKanbanIcon',
        label: 'Kanban',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/apps/kanban',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'ContactIcon',
        label: 'Contact',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/apps/contact',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'ShieldCheckIcon',
        label: 'Roles & Permissions',
        badge: 'Pro',
        badgeClassName: 'right-8',
        childItems: [
          {
            label: 'Roles',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/apps/roles',
            target: '_blank'
          },
          {
            label: 'Permissions',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/apps/permissions',
            target: '_blank'
          }
        ]
      }
    ]
  },
  {
    groupLabel: 'Pages',
    items: [
      {
        icon: 'UserCogIcon',
        label: 'User Settings',
        childItems: [
          {
            label: 'General',
            href: '/pages/user-settings?setting=general'
          },
          {
            label: 'Workspace',
            href: '/pages/user-settings?setting=workspace'
          },
          {
            label: 'Notifications',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/user-settings?setting=notifications',
            target: '_blank',
            badge: 'Pro',
            badgeClassName: 'right-8'
          },
          {
            label: 'Integrations',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/user-settings?setting=integrations',
            target: '_blank',
            badge: 'Pro',
            badgeClassName: 'right-8'
          },
          {
            label: 'Members',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/user-settings?setting=members',
            target: '_blank',
            badge: 'Pro',
            badgeClassName: 'right-8'
          },
          {
            label: 'Security',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/user-settings?setting=security',
            target: '_blank',
            badge: 'Pro',
            badgeClassName: 'right-8'
          },
          {
            label: 'Billing & Usage',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/user-settings?setting=billing',
            target: '_blank',
            badge: 'Pro',
            badgeClassName: 'right-8'
          }
        ]
      },
      {
        icon: 'UserIcon',
        label: 'User Profile',
        childItems: [
          {
            label: 'Profile',
            href: '/pages/user-profile?view=profile'
          },
          {
            label: 'Connections',
            href: '/pages/user-profile?view=connections'
          },
          {
            label: 'Teams',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/user-profile?view=teams',
            target: '_blank',
            badge: 'Pro',
            badgeClassName: 'right-8'
          },
          {
            label: 'Projects',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/user-profile?view=projects',
            target: '_blank',
            badge: 'Pro',
            badgeClassName: 'right-8'
          }
        ]
      },
      {
        icon: 'LockKeyholeIcon',
        label: 'Authentication',
        childItems: [
          {
            label: 'Login',
            childItems: [
              { label: 'Login v1', href: '/pages/auth/login', target: '_blank' },
              {
                label: 'Login v2',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/login-v2',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              },
              {
                label: 'Login v3',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/login-v3',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              }
            ]
          },
          {
            label: 'Register',
            childItems: [
              { label: 'Register v1', href: '/pages/auth/register', target: '_blank' },
              {
                label: 'Register v2',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/register-v2',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              },
              {
                label: 'Register v3',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/register-v3',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              }
            ]
          },
          {
            label: 'Forgot Password',
            childItems: [
              { label: 'Forgot Password v1', href: '/pages/auth/forgot-password', target: '_blank' },
              {
                label: 'Forgot Password v2',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/forgot-password-v2',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              },
              {
                label: 'Forgot Password v3',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/forgot-password-v3',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              }
            ]
          },
          {
            label: 'Verify Email',
            childItems: [
              { label: 'Verify Email v1', href: '/pages/auth/verify-email', target: '_blank' },
              {
                label: 'Verify Email v2',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/verify-email-v2',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              },
              {
                label: 'Verify Email v3',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/verify-email-v3',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              }
            ]
          },
          {
            label: 'Reset Password',
            childItems: [
              { label: 'Reset Password v1', href: '/pages/auth/reset-password', target: '_blank' },
              {
                label: 'Reset Password v2',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/reset-password-v2',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              },
              {
                label: 'Reset Password v3',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/reset-password-v3',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              }
            ]
          },
          {
            label: 'Two Steps',
            childItems: [
              { label: 'Two Steps v1', href: '/pages/auth/two-steps', target: '_blank' },
              {
                label: 'Two Steps v2',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/two-steps-v2',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              },
              {
                label: 'Two Steps v3',
                href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/auth/two-steps-v3',
                target: '_blank',
                badge: 'Pro',
                badgeClassName: 'right-8'
              }
            ]
          }
        ]
      },
      {
        icon: 'RocketIcon',
        label: 'Landing Page',
        href: 'https://shadcn-nextjs-flow-landing-page.vercel.app/',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'DollarSignIcon',
        label: 'Pricing',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/pricing',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'CircleQuestionMarkIcon',
        label: 'FAQ',
        href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/faq',
        target: '_blank',
        badge: 'Pro',
        badgeClassName: 'right-8'
      },
      {
        icon: 'FootprintsIcon',
        label: 'Onboarding',
        badge: 'Pro',
        badgeClassName: 'right-8',
        childItems: [
          {
            label: 'Onboarding v1',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/onboarding-v1',
            target: '_blank'
          },
          {
            label: 'Onboarding v2',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/onboarding-v2',
            target: '_blank'
          }
        ]
      },
      {
        icon: 'FileIcon',
        label: 'Empty State',
        badge: 'Pro',
        badgeClassName: 'right-8',
        childItems: [
          {
            label: 'Empty State v1',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/empty-state-v1',
            target: '_blank'
          },
          {
            label: 'Empty State v2',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/pages/empty-state-v2',
            target: '_blank'
          }
        ]
      }
    ]
  },
  {
    groupLabel: 'Forms & Tables',
    items: [
      {
        icon: 'TableIcon',
        label: 'Data Table',
        href: '/datatable'
      },
      {
        icon: 'ListTodoIcon',
        label: 'Form Wizard',
        badge: 'Pro',
        badgeClassName: 'right-8',
        childItems: [
          {
            label: 'Icons',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/forms/form-wizard/icons',
            target: '_blank'
          },
          {
            label: 'Numbered',
            href: 'https://shadcn-nextjs-admincn-admin-template.vercel.app/forms/form-wizard/numbered',
            target: '_blank'
          }
        ]
      }
    ]
  }
]

const removeProItems = (items: MenuSubItem[]): MenuSubItem[] => {
  return items.flatMap(item => {
    if (item.badge === 'Pro') return []

    if ('childItems' in item) {
      const childItems = item.childItems.flatMap(childItem => {
        if ('childItems' in childItem) {
          const nestedItems = removeProItems(childItem.childItems)

          return nestedItems.length > 0 ? [{ ...childItem, childItems: nestedItems }] : []
        }

        return childItem.badge === 'Pro' ? [] : [childItem]
      })

      return childItems.length > 0 ? [{ ...item, childItems }] : []
    }

    return [item]
  })
}

export const navItems: NavItem[] = allNavItems
  .map(navGroup => ({ ...navGroup, items: removeProItems(navGroup.items) }))
  .filter(navGroup => navGroup.items.length > 0)
