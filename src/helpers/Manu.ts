import { MENU_ITEMS } from '@/assets/data/menu-items'
import type { MenuItemType } from '@/types/menu'
import { getAccessibleMenuItems, UserSession } from '@/utils/accessControl'

export const getMenuItems = (): MenuItemType[] => {
  return MENU_ITEMS
}

/**
 * Gets menu items filtered by user access permissions
 * @param userSession - User session data containing role and menu access
 * @returns Filtered array of menu items that user has access to
 */
export const getMenuItemsByAccess = (userSession: UserSession | null): MenuItemType[] => {
  return getAccessibleMenuItems(userSession)
}

export const findAllParent = (menuItems: MenuItemType[], menuItem: MenuItemType): string[] => {
  let parents: string[] = []
  const parent = findMenuItem(menuItems, menuItem.parentKey)
  if (parent) {
    parents.push(parent.key)
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)]
    }
  }
  return parents
}

export const getMenuItemFromURL = (items: MenuItemType | MenuItemType[], url: string): MenuItemType | undefined => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url)
      if (foundItem) {
        return foundItem
      }
    }
  } else {
    if (items.url == url) return items
    if (items.children != null) {
      for (const item of items.children) {
        if (item.url == url) return item
      }
    }
  }
}

export const findMenuItem = (menuItems: MenuItemType[] | undefined, menuItemKey: MenuItemType['key'] | undefined): MenuItemType | null => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item
      }
      const found = findMenuItem(item.children, menuItemKey)
      if (found) return found
    }
  }
  return null
}
