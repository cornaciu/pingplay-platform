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

const hasChildItems = (item: MenuItem): item is Extract<MenuItem, { childItems: MenuSubItem[] }> =>
  Array.isArray(item.childItems)

const allNavItems: NavItem[] = [
  {
    items: [
      {
        icon: 'CalendarCheck',
        label: 'Privire de ansamblu',
        href: '/dashboard/rezervari'
      }
    ]
  },
  {
    groupLabel: '',
    items: [
      {
        icon: 'CalendarCheck2',
        label: 'Rezervări',
        href: '/apps/reservations'
      },
      {
        icon: 'CalendarIcon',
        label: 'Calendar',
        href: '/apps/calendar'
      },
      {
        icon: 'UsersIcon',
        label: 'Clienți',
        childItems: [
          { label: 'List', href: '/apps/users/list' },
          { label: 'View', href: '/apps/users/view' }
        ]
      },
      {
        icon: 'UserCogIcon',
        label: 'Setări cont',
        href: '/pages/user-settings?setting=general'
      }
    ]
  },
  {
    groupLabel: '',
    items: [
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
          }
        ]
      }
    ]
  }
]

const removeProSubItems = (items: MenuSubItem[]): MenuSubItem[] => {
  return items.reduce<MenuSubItem[]>((filteredItems, item) => {
    if ('childItems' in item) {
      const childItems = item.childItems.filter(childItem => childItem.badge !== 'Pro')

      if (childItems.length > 0) filteredItems.push({ ...item, childItems })
    } else if (item.badge !== 'Pro') {
      filteredItems.push(item)
    }

    return filteredItems
  }, [])
}

const removeProItems = (items: MenuItem[]): MenuItem[] => {
  return items.reduce<MenuItem[]>((filteredItems, item) => {
    if (item.badge === 'Pro') return filteredItems

    if (hasChildItems(item)) {
      const childItems = removeProSubItems(item.childItems)

      if (childItems.length > 0) filteredItems.push({ ...item, childItems })
    } else {
      filteredItems.push(item)
    }

    return filteredItems
  }, [])
}

export const navItems: NavItem[] = allNavItems
  .map(navGroup => ({ ...navGroup, items: removeProItems(navGroup.items) }))
  .filter(navGroup => navGroup.items.length > 0)
