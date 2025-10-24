# Role API Integration - Frontend

## Overview
The role API has been successfully integrated into the frontend with full CRUD operations. The system now supports creating, reading, updating, and deleting roles through the backend API.

## Files Created/Modified

### 1. API Service (`src/services/roleApi.ts`)
- Complete RTK Query API service with all CRUD operations
- TypeScript interfaces for request/response types
- Automatic caching and invalidation
- Error handling built-in

### 2. Updated Types (`src/types/role.ts`)
- Updated to match backend API structure
- Added phone field support
- Maintained backward compatibility

### 3. Enhanced Form (`src/components/role-management/RoleForm.tsx`)
- Integrated API calls for role creation
- Added phone field to the form
- Success/error feedback with SweetAlert2
- Loading states during API calls

### 4. Custom Hook (`src/hooks/useRoleApi.ts`)
- Simplified API usage with built-in feedback
- Confirmation dialogs for destructive actions
- Error handling with user-friendly messages

### 5. Example Component (`src/components/role-management/RoleApiExample.tsx`)
- Complete example of listing roles
- Search and filter functionality
- Pagination support
- Delete with confirmation

## API Endpoints Available

### Create Role
```typescript
POST /v1/api/auth/roles
Body: {
  name: string
  email: string
  password: string
  phone: string
  role: 'Admin' | 'Manager' | 'Cashier' | 'Waiter' | 'Staff'
  menuAccess?: MenuAccess
}
```

### Get All Roles
```typescript
GET /v1/api/auth/roles?page=1&limit=10&search=&role=&status=
```

### Get Role by ID
```typescript
GET /v1/api/auth/roles/:id
```

### Update Role
```typescript
PUT /v1/api/auth/roles/:id
Body: Partial<CreateRoleRequest> & { status?: 'active' | 'inactive' }
```

### Delete Role
```typescript
DELETE /v1/api/auth/roles/:id
```

## Usage Examples

### 1. Using the Custom Hook (Recommended)
```typescript
import { useRoleApi } from '@/hooks/useRoleApi'

const MyComponent = () => {
  const { createRole, getAllRoles, deleteRole, isCreating } = useRoleApi()
  
  const handleCreate = async () => {
    try {
      await createRole({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'Manager',
        menuAccess: { /* permissions */ }
      })
      // Success message shown automatically
    } catch (error) {
      // Error message shown automatically
    }
  }
}
```

### 2. Using Direct API Hooks
```typescript
import { useCreateRoleMutation, useGetAllRolesQuery } from '@/services/roleApi'

const MyComponent = () => {
  const [createRole, { isLoading }] = useCreateRoleMutation()
  const { data: roles, refetch } = useGetAllRolesQuery({ page: 1, limit: 10 })
  
  const handleCreate = async () => {
    try {
      const result = await createRole(payload).unwrap()
      console.log('Created:', result)
    } catch (error) {
      console.error('Error:', error)
    }
  }
}
```

### 3. Form Integration
The `RoleForm` component now automatically:
- Validates all fields including phone
- Calls the API on submit
- Shows success/error messages
- Handles loading states
- Maintains form state

## Form Fields

The role form now includes:
- **Staff Name**: Required text field
- **Role**: Dropdown with predefined roles (Admin, Manager, Cashier, Waiter, Staff)
- **Email**: Required email field with validation
- **Password**: Required password field (min 6 characters)
- **Phone**: Required phone number field
- **Menu Access**: Complex permission system with checkboxes

## Menu Access Structure

```typescript
menuAccess: {
  "pos-module": {
    checked: true,
    children: {
      "pos-main": true,
      "settle-bill": true,
      "print-order": false,
      // ... more permissions
    }
  },
  "menu-master": {
    checked: false,
    children: {
      "Restaurant-menu": true,
      "online-menu": true,
      // ... more permissions
    }
  }
}
```

## Error Handling

All API calls include comprehensive error handling:
- Network errors
- Validation errors
- Server errors
- User-friendly error messages
- Automatic retry mechanisms

## Loading States

The system provides loading states for:
- Form submission
- Data fetching
- Updates and deletions
- UI feedback during operations

## Success Feedback

Success operations show:
- SweetAlert2 success dialogs
- Automatic form reset (on create)
- List refresh (on update/delete)
- User-friendly success messages

## Next Steps

1. **List Page**: Integrate the `RoleApiExample` component into your role management page
2. **Edit Page**: Create an edit role page using the same form with pre-populated data
3. **Permissions**: Implement permission-based UI hiding/showing based on user's menuAccess
4. **Bulk Operations**: Add bulk delete/update functionality
5. **Export**: Add export functionality for role data

## Testing

To test the integration:
1. Fill out the role form with all required fields
2. Select menu permissions
3. Click "Save" - you should see a success message
4. Check the browser console for the submitted data
5. Verify the role appears in your backend system

The API integration is now complete and ready for production use!
