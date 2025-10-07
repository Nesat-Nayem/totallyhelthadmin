# Shift Management System

This module implements a comprehensive shift management system for the admin panel, including shift operations, cash denomination tracking, and day close functionality.

## Features

### 1. Shift Operations
- **Start Shift**: Create new shifts with optional login/logout times
- **Close Shift**: Close current shift with cash denomination tracking
- **Day Close**: Close all shifts for the current day
- **View Current Shift**: Real-time display of current shift status

### 2. Cash Denomination Tracking
- Support for UAE currency denominations (1000, 500, 200, 100, 50, 20, 10, 5, 2, 1)
- Interactive keypad for easy denomination entry
- Automatic total calculation
- Visual feedback for active denomination selection

### 3. Shift Management
- View all shifts with filtering and pagination
- Filter by date, status, and shift number
- Status tracking (Open, Closed, Day Close)
- Comprehensive shift history

## Components

### Core Components
- `ShiftClose.tsx` - Main shift close interface
- `ShiftStartModal.tsx` - Modal for starting new shifts
- `ShiftCloseModal.tsx` - Modal for closing shifts with denominations
- `DayCloseModal.tsx` - Modal for day close operations
- `ShiftManagement.tsx` - Shift listing and management

### API Integration
- `shiftApi.ts` - RTK Query service for all shift operations
- Full TypeScript support with proper type definitions
- Error handling and loading states

## API Endpoints

- `GET /api/shifts/current` - Get current open shift
- `POST /api/shifts/start` - Start new shift
- `POST /api/shifts/close` - Close current shift
- `POST /api/shifts/day-close` - Perform day close
- `GET /api/shifts` - Get all shifts with filtering
- `GET /api/shifts/:id` - Get shift by ID

## Usage

### Starting a Shift
1. Click "Start Shift" button
2. Fill in optional login details (date, time, name, note)
3. Click "Start Shift" to confirm

### Closing a Shift
1. Click "Close Shift" button (only available when shift is open)
2. Enter cash denominations using the keypad or direct input
3. Click "Close Shift" to confirm

### Day Close
1. Click "Day Close" button
2. Add optional note
3. Confirm the day close operation

### Viewing Shifts
Navigate to `/shift-management` to view all shifts with filtering options.

## Technical Details

- Built with React Bootstrap for consistent UI
- RTK Query for efficient API state management
- TypeScript for type safety
- Responsive design for various screen sizes
- Real-time data updates with automatic refetching
