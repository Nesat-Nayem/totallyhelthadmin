export interface MenuAccess {
  [key: string]: {
    checked: boolean
    children?: { [key: string]: boolean }
  }
}

// Backend API Role structure
export interface Role {
  _id: string
  name: string
  email: string
  phone: string
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Supervisor' | 'Cashier' | 'Waiter' | 'Staff'
  menuAccess: MenuAccess
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// Legacy Role interface for backward compatibility
export interface LegacyRole {
  _id?: string
  name: string
  description?: string
  menuAccess: MenuAccess
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface UserRole {
  _id?: string
  userId: string
  roleId: string
  menuAccess: MenuAccess
  assignedBy: string
  assignedAt: Date
  isActive: boolean
}

// Updated RoleFormData to match backend API
export interface RoleFormData {
  staffName: string
  email: string
  password?: string // Optional for edit mode
  phone: string
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Supervisor' | 'Cashier' | 'Waiter' | 'Staff'
  menuAccess: MenuAccess
}
