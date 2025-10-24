# Role Management System V2

This directory contains the advanced role-based access control system with hierarchical menu permissions, featuring staff name and email fields instead of username.

## Components

### 1. MenuAccessCheckbox
A hierarchical checkbox component that displays all menu items from `menu-items.ts` with support for:
- Module-level checkboxes (parent items)
- Sub-module checkboxes (child items)
- Indeterminate state for partially selected modules
- Real-time selection counting

**Props:**
- `selectedAccess: MenuAccess` - Current access permissions
- `onAccessChange: (access: MenuAccess) => void` - Callback when access changes
- `disabled?: boolean` - Disable all checkboxes

### 2. RoleForm
A complete form component for creating/editing roles with:
- Staff name input
- Role dropdown with existing roles + option to create new roles
- Email input (with validation)
- Password input
- Menu access permissions (using MenuAccessCheckbox)

**Props:**
- `initialData?: Partial<RoleFormData>` - Initial form data for editing
- `onSubmit: (data: RoleFormData) => void` - Form submission handler
- `isLoading?: boolean` - Loading state
- `mode?: 'create' | 'edit'` - Form mode

### 3. RoleList
A table component that displays roles with:
- Search functionality
- Menu access badges
- Edit/Delete actions
- Pagination support
- Delete confirmation modal

**Props:**
- `roles: RoleData[]` - Array of role data
- `onDelete?: (id: string) => void` - Delete handler
- `onEdit?: (id: string) => void` - Edit handler

## Data Types

### MenuAccess
```typescript
interface MenuAccess {
  [key: string]: {
    checked: boolean
    children?: { [key: string]: boolean }
  }
}
```

### RoleFormData
```typescript
interface RoleFormData {
  staffName: string
  role: string
  email: string
  password: string
  menuAccess: MenuAccess
}
```

### RoleData
```typescript
interface RoleData {
  id: string
  staffName: string
  role: string
  email: string
  password: string
  menuAccess: MenuAccess
  createdAt: Date
  updatedAt: Date
}
```

## Usage

### 1. Create a New Role
```tsx
import { RoleForm } from '@/components/role-management'

const AddRolePage = () => {
  const handleSubmit = (data: RoleFormData) => {
    // Handle form submission
    console.log('New role:', data)
  }

  return (
    <RoleForm
      onSubmit={handleSubmit}
      mode="create"
    />
  )
}
```

### 2. Edit an Existing Role
```tsx
import { RoleForm } from '@/components/role-management'

const EditRolePage = () => {
  const initialData = {
    staffName: 'Suraj Jamdade',
    role: 'Cashier',
    email: 'suraj@example.com',
    password: 'password123',
    menuAccess: {
      'paymeny-method': {
        checked: true,
        children: {
          'list-of-payment-method': true,
          'add-new-payment-method': false
        }
      }
    }
  }

  const handleSubmit = (data: RoleFormData) => {
    // Handle form submission
    console.log('Updated role:', data)
  }

  return (
    <RoleForm
      initialData={initialData}
      onSubmit={handleSubmit}
      mode="edit"
    />
  )
}
```

### 3. Display Role List
```tsx
import { RoleList } from '@/components/role-management'

const RoleManagementPage = () => {
  const roles = [
    // Your role data
  ]

  const handleDelete = (id: string) => {
    // Handle role deletion
  }

  const handleEdit = (id: string) => {
    // Handle role editing
  }

  return (
    <RoleList
      roles={roles}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  )
}
```

### 4. Standalone Menu Access Component
```tsx
import { MenuAccessCheckbox } from '@/components/role-management'

const MyComponent = () => {
  const [menuAccess, setMenuAccess] = useState<MenuAccess>({})

  return (
    <MenuAccessCheckbox
      selectedAccess={menuAccess}
      onAccessChange={setMenuAccess}
    />
  )
}
```

## Features

### Enhanced Form Fields
- **Staff Name**: Dedicated field for staff member's full name
- **Role Dropdown**: Select from existing roles or create new ones dynamically
- **Email Field**: Replaces username with proper email validation
- **Password Management**: Secure password input with strength requirements
- **Dynamic Role Creation**: Ability to create new roles on-the-fly during form submission

### Hierarchical Selection
- Selecting a module automatically selects all its sub-modules
- Deselecting a module automatically deselects all its sub-modules
- Sub-module selection affects parent module state (indeterminate/checked)

### Visual Feedback
- Indeterminate checkboxes for partially selected modules
- Selection counter showing total permissions
- Color-coded badges for different access levels
- Loading states and disabled states

### Form Validation
- Required field validation for all inputs
- Email format validation
- Password strength requirements (minimum 6 characters)
- Real-time form validation feedback

### Responsive Design
- Mobile-friendly table layout
- Collapsible menu sections
- Touch-friendly checkbox interactions
- Optimized for all screen sizes

## Integration with Backend

The components work with the backend schema defined in `backend-schema-update.md`. The `MenuAccess` structure matches the MongoDB schema for seamless integration.

### Updated Backend Schema
The new system requires these additional fields in your backend:

```typescript
// Updated User/Role Schema
interface RoleData {
  staffName: string    // NEW: Dedicated staff name field
  role: string         // NEW: Role dropdown with dynamic creation
  email: string        // NEW: Email instead of username
  password: string
  menuAccess: MenuAccess
  // ... other fields
}
```

### API Integration Example
```typescript
// Create role with new fields
const createRole = async (roleData: RoleFormData) => {
  const response = await fetch('/api/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      staffName: roleData.staffName,
      role: roleData.role,
      email: roleData.email,
      password: roleData.password,
      menuAccess: roleData.menuAccess
    })
  })
  return response.json()
}

// Update role
const updateRole = async (id: string, roleData: RoleFormData) => {
  const response = await fetch(`/api/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roleData)
  })
  return response.json()
}
```

## Styling

The components use Bootstrap classes and are styled to match your existing design system. Custom CSS can be added by targeting the component classes:

```css
.menu-access-container {
  /* Custom styles */
}

.role-form {
  /* Custom styles */
}

.role-list-table {
  /* Custom styles */
}
```

## System Comparison

### Original Role Management (`/role-management`)
- Basic role management with simple dropdown menu access
- Username field for authentication
- Simple badge display for permissions
- Maintained for backward compatibility

### New Role Management V2 (`/role-management-v2`)
- Advanced hierarchical menu access with checkboxes
- Staff name field for better identification
- Role dropdown with dynamic role creation capability
- Email field with validation (replaces username)
- Enhanced permission display with detailed badges
- Improved form validation and user experience

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- High contrast checkbox states
- Focus management for modals
- Semantic HTML structure
- Email field validation with clear error messages
- Form field labels and descriptions for better UX
