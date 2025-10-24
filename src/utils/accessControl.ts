import { MenuItemType } from '@/types/menu'
import { POS_ROLE_MENU_ITEMS } from '@/assets/data/pos-role-menu-items'

export interface MenuAccess {
  [key: string]: {
    checked: boolean
    children?: { [key: string]: boolean }
  }
}

export interface UserSession {
  email: string
  name: string
  role: string
  branchId: string
  menuAccess: MenuAccess
}

/**
 * Checks if a user has access to a specific module
 * @param menuAccess - User's menu access permissions
 * @param moduleKey - The module key to check
 * @returns boolean indicating if user has access
 */
export const hasModuleAccess = (menuAccess: MenuAccess, moduleKey: string): boolean => {
  if (!menuAccess || !moduleKey) return false
  
  const moduleAccess = menuAccess[moduleKey]
  if (!moduleAccess) return false
  
  return moduleAccess.checked === true
}

/**
 * Checks if a user has access to a specific sub-module
 * @param menuAccess - User's menu access permissions
 * @param moduleKey - The parent module key
 * @param subModuleKey - The sub-module key to check
 * @returns boolean indicating if user has access
 */
export const hasSubModuleAccess = (menuAccess: MenuAccess, moduleKey: string, subModuleKey: string): boolean => {
  if (!menuAccess || !moduleKey || !subModuleKey) return false
  
  const moduleAccess = menuAccess[moduleKey]
  if (!moduleAccess || !moduleAccess.children) return false
  
  return moduleAccess.children[subModuleKey] === true
}

/**
 * Filters menu items based on user's role and menu access permissions
 * @param menuItems - Array of menu items to filter
 * @param userSession - User session data containing role and menu access
 * @returns Filtered array of menu items that user has access to
 */
export const filterMenuItemsByAccess = (menuItems: MenuItemType[], userSession: UserSession | null): MenuItemType[] => {
  if (!userSession || !userSession.menuAccess) {
    // If no user session or menu access, return empty array (no access)
    return []
  }

  // Super Admin or Admin roles typically have full access
  if (userSession.role === 'superadmin' || userSession.role === 'admin') {
    // Still exclude POS Module from sidebar even for admins
    return menuItems.filter(item => item.key !== 'pos-module')
  }

  return menuItems.filter(item => {
    // Skip title items
    if (item.isTitle) return true

    // Always exclude POS Module from sidebar - it will be handled in top navbar
    if (item.key === 'pos-module') return false

    // Check if user has access to this module (either main module or any children)
    const hasAccess = hasAnyModuleAccess(userSession.menuAccess, item.key)
    
    if (!hasAccess) return false

    // If module has children, filter them based on access
    if (item.children && item.children.length > 0) {
      const filteredChildren = item.children.filter(child => 
        hasSubModuleAccess(userSession.menuAccess, item.key, child.key)
      )
      
      // Only show the module if user has access to at least one child
      if (filteredChildren.length === 0) return false
      
      // Update the item with filtered children
      item.children = filteredChildren
    }

    return true
  })
}

/**
 * Gets all accessible menu items for a user based on their role and permissions
 * @param userSession - User session data
 * @returns Array of accessible menu items
 */
export const getAccessibleMenuItems = (userSession: UserSession | null): MenuItemType[] => {
  return filterMenuItemsByAccess(POS_ROLE_MENU_ITEMS, userSession)
}

/**
 * Checks if a user can access a specific route
 * @param userSession - User session data
 * @param routePath - The route path to check
 * @returns boolean indicating if user can access the route
 */
export const canAccessRoute = (userSession: UserSession | null, routePath: string): boolean => {
  if (!userSession || !userSession.menuAccess) return false

  // Super Admin or Admin roles typically have full access
  if (userSession.role === 'superadmin' || userSession.role === 'admin') {
    return true
  }

  // Find the menu item that matches this route
  const findMenuItemByRoute = (items: MenuItemType[], path: string): MenuItemType | null => {
    for (const item of items) {
      if (item.url === path) return item
      if (item.children) {
        const found = findMenuItemByRoute(item.children, path)
        if (found) return found
      }
    }
    return null
  }

  const menuItem = findMenuItemByRoute(POS_ROLE_MENU_ITEMS, routePath)
  if (!menuItem) return false

  // Check if it's a parent module or child module
  if (menuItem.parentKey) {
    // It's a child module
    return hasSubModuleAccess(userSession.menuAccess, menuItem.parentKey, menuItem.key)
  } else {
    // It's a parent module
    return hasModuleAccess(userSession.menuAccess, menuItem.key)
  }
}

/**
 * Gets user's accessible routes for navigation guards
 * @param userSession - User session data
 * @returns Array of accessible route paths
 */
export const getAccessibleRoutes = (userSession: UserSession | null): string[] => {
  if (!userSession || !userSession.menuAccess) return []

  const accessibleRoutes: string[] = []

  const collectRoutes = (items: MenuItemType[]) => {
    items.forEach(item => {
      if (item.isTitle) return

      const hasAccess = hasModuleAccess(userSession.menuAccess, item.key)
      if (hasAccess) {
        if (item.url) {
          accessibleRoutes.push(item.url)
        }
        
        if (item.children) {
          item.children.forEach(child => {
            if (hasSubModuleAccess(userSession.menuAccess, item.key, child.key) && child.url) {
              accessibleRoutes.push(child.url)
            }
          })
        }
      }
    })
  }

  collectRoutes(POS_ROLE_MENU_ITEMS)
  return accessibleRoutes
}

/**
 * Utility function to check if user has any access to a module (either direct or through children)
 * @param menuAccess - User's menu access permissions
 * @param moduleKey - The module key to check
 * @returns boolean indicating if user has any access to the module
 */
export const hasAnyModuleAccess = (menuAccess: MenuAccess, moduleKey: string): boolean => {
  if (!menuAccess || !moduleKey) return false
  
  const moduleAccess = menuAccess[moduleKey]
  if (!moduleAccess) return false
  
  // Check if module itself is checked
  if (moduleAccess.checked) return true
  
  // Check if any children are checked
  if (moduleAccess.children) {
    return Object.values(moduleAccess.children).some(hasAccess => hasAccess === true)
  }
  
  return false
}

/**
 * Checks if user has access to POS module (for top navbar button)
 * @param userSession - User session data
 * @returns boolean indicating if user has access to POS module
 */
export const hasPOSModuleAccess = (userSession: UserSession | null): boolean => {
  if (!userSession || !userSession.menuAccess) return false
  
  // Super Admin or Admin roles typically have full access
  if (userSession.role === 'superadmin' || userSession.role === 'admin') {
    return true
  }
  
  // For POS module, check if user has access to the module OR any of its children
  // This allows POS to work like a dashboard - if any POS feature is accessible, show POS button
  return hasAnyModuleAccess(userSession.menuAccess, 'pos-module')
}

/**
 * Gets accessible POS sub-options for the user
 * @param userSession - User session data
 * @returns Array of accessible POS sub-options
 */
export const getAccessiblePOSOptions = (userSession: UserSession | null): Array<{key: string, label: string, url: string}> => {
  if (!userSession || !userSession.menuAccess) return []
  
  const posOptions = [
    { key: 'settle-bill', label: 'Settle Bill', url: '/pos/settle-bill' },
    { key: 'print-order', label: 'Print Order', url: '/pos/print-order' },
    { key: 'pos-reports', label: 'POS Reports', url: '/pos/reports' },
    { key: 'view-orders', label: 'View Orders', url: '/pos/view-orders' },
    { key: 'transaction-history', label: 'Transaction History', url: '/pos/transaction-history' },
    { key: 'split-bill', label: 'Split Bill', url: '/pos/split-bill' },
    { key: 'apply-discount', label: 'Apply Discount', url: '/pos/apply-discount' },
    { key: 'meal-plan-list', label: 'Meal Plan List', url: '/pos/meal-plan-list' },
    { key: 'sales-list', label: 'Sales List', url: '/pos/sales-list' },
    { key: 'calculator', label: 'Calculator', url: '/pos/calculator' },
    { key: 'start-shift', label: 'Start Shift', url: '/pos/start-shift' }
  ]
  
  // Super Admin or Admin roles typically have full access
  if (userSession.role === 'superadmin' || userSession.role === 'admin') {
    return posOptions
  }
  
  // Filter based on user's POS module access
  return posOptions.filter(option => 
    hasSubModuleAccess(userSession.menuAccess, 'pos-module', option.key)
  )
}

/**
 * Checks if user has access to a specific POS button/feature
 * @param userSession - User session data
 * @param buttonKey - The POS button key to check (e.g., 'settle-bill', 'print-order')
 * @returns boolean indicating if user has access to the POS button
 */
export const hasPOSButtonAccess = (userSession: UserSession | null, buttonKey: string): boolean => {
  if (!userSession || !userSession.menuAccess) return false
  
  // Super Admin or Admin roles typically have full access
  if (userSession.role === 'superadmin' || userSession.role === 'admin') {
    return true
  }
  
  // Check if user has access to POS module first
  if (!hasAnyModuleAccess(userSession.menuAccess, 'pos-module')) {
    return false
  }
  
  // Check specific button access
  return hasSubModuleAccess(userSession.menuAccess, 'pos-module', buttonKey)
}
