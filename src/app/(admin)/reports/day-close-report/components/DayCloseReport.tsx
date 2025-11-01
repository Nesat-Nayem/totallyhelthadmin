'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  Modal,
  Toast,
  ToastContainer,
  Badge,
} from 'react-bootstrap'
import ReportModal from './ReportModal'
import { 
  useGetDayCloseReportsQuery, 
  useGetDayWiseShiftWiseReportsByDateQuery,
  useLazyGetDayCloseByIdQuery,
  useDownloadDayCloseReportsMutation,
  useDeleteDayCloseReportsByDateMutation,
  useDeleteDayCloseReportByIdMutation,
  DayCloseReportQuery,
  type DayCloseReport,
  type DayWiseShiftWiseReportResponse
} from '@/services/dayCloseApi'
import { useSession } from 'next-auth/react'

function fmt(d?: string | Date | null) {
  if (!d) return '-'
  try { return new Date(d).toLocaleString() } catch { return '-' }
}

const DayCloseReport = () => {
  const { data: session, status } = useSession()
  const [currentDate, setCurrentDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [queryParams, setQueryParams] = useState<DayCloseReportQuery>({
    page: 1,
    limit: 20,
    date: '',
    startDate: '',
    endDate: '',
    sortBy: 'startTime',
    sortOrder: 'desc'
  })
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [isDownloading, setIsDownloading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{id: string, date: string} | null>(null)
  const [showDeleteDateModal, setShowDeleteDateModal] = useState(false)
  const [deleteDateTarget, setDeleteDateTarget] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [deletingReports, setDeletingReports] = useState<Set<string>>(new Set())
  const [deletedReports, setDeletedReports] = useState<Set<string>>(new Set())
  const [abortControllers, setAbortControllers] = useState<Map<string, AbortController>>(new Map())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'days' | 'shifts' | 'dayWise' | 'shiftWise'>('days')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showDayWiseShiftWise, setShowDayWiseShiftWise] = useState(false)

  const { data: listRes, isLoading, error, refetch } = useGetDayCloseReportsQuery(queryParams, {
    skip: status !== 'authenticated' || !session,
    refetchOnMountOrArgChange: true,
  })
  
  // New query for day-wise and shift-wise data when a specific date is selected
  const { data: dayWiseShiftWiseRes, isLoading: isLoadingDayWiseShiftWise } = useGetDayWiseShiftWiseReportsByDateQuery(currentDate, {
    skip: status !== 'authenticated' || !session || !currentDate || !showDayWiseShiftWise,
    refetchOnMountOrArgChange: true,
  })
  
  const [fetchDetail] = useLazyGetDayCloseByIdQuery()
  const [downloadReports] = useDownloadDayCloseReportsMutation()
  const [deleteReports] = useDeleteDayCloseReportsByDateMutation()
  const [deleteReportById] = useDeleteDayCloseReportByIdMutation()

  const items = listRes?.data ?? []
  const meta = { page: 1, pages: 1 } // Default pagination since the new API structure doesn't include meta

  // Filter shifts by status and flatten all shifts from all days for selection logic
  const allShifts = items.flatMap((dayData: any) => 
    (dayData.shifts || []).filter((shift: any) => 
      statusFilter === 'all' || shift.status === statusFilter
    )
  )
  
  // Helper function to detect whole-day records
  const isWholeDayRecord = (shift: any) => {
    return shift.isWholeDay === true || 
           shift.recordType === 'day-close' ||
           shift.shiftNumber === 999 ||
           shift.shiftNumber === 0 ||
           shift.loginName === 'DAY-CLOSE' ||
           (shift.note && shift.note.toLowerCase().includes('whole day')) ||
           (shift.note && shift.note.toLowerCase().includes('no shifts'))
  }

  // Get selected day data with filtered shifts
  const originalSelectedDayData = items.find((dayData: any) => dayData.date === selectedDay) as any
  let selectedDayData = null
  
  if (originalSelectedDayData) {
    // Debug: Log the data structure to understand what's available
    console.log('🔍 Day Close Report Data Structure:', {
      date: originalSelectedDayData.date,
      sales: originalSelectedDayData.sales,
      shifts: originalSelectedDayData.shifts,
      wholeDayRecords: originalSelectedDayData.shifts?.filter((shift: any) => isWholeDayRecord(shift))
    });
    // Separate actual shifts from whole-day records
    const allShifts = originalSelectedDayData.shifts || []
    const actualShifts = allShifts.filter((shift: any) => !isWholeDayRecord(shift))
    const wholeDayRecords = allShifts.filter((shift: any) => isWholeDayRecord(shift))
    
    // Filter actual shifts by status
    const filteredActualShifts = actualShifts.filter((shift: any) => 
      statusFilter === 'all' || shift.status === statusFilter
    )
    
    // Determine if this is a no-shifts day (only whole-day records)
    const isNoShiftsDay = actualShifts.length === 0 && wholeDayRecords.length > 0
    
    selectedDayData = {
      ...originalSelectedDayData,
      shifts: filteredActualShifts, // Only show actual shifts
      wholeDayRecords: wholeDayRecords, // Store whole-day records separately
      shiftCount: filteredActualShifts.length, // Count only actual shifts
      isNoShiftsDay: isNoShiftsDay,
      statistics: {
        ...originalSelectedDayData.statistics,
        totalShifts: filteredActualShifts.length,
        totalCash: filteredActualShifts.reduce((sum: number, shift: any) => sum + (shift.denominations?.totalCash || 0), 0)
      }
    }
  }

  useEffect(() => {
    // No default date selection - show all days by default
    setQueryParams(prev => ({ ...prev, date: undefined }))
  }, [])

  // Clear deleted reports when date changes
  useEffect(() => {
    setDeletedReports(new Set())
  }, [currentDate])

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      abortControllers.forEach(controller => controller.abort())
    }
  }, [abortControllers])

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'day-close':
        return (
          <span className="badge badge-soft-success">
            Closed
          </span>
        )
      case 'closed':
        return (
          <span className="badge badge-soft-primary">
            Closed
          </span>
        )
      case 'open':
        return (
          <span className="badge badge-soft-warning">
            Open
          </span>
        )
      default:
        return (
          <span className="badge badge-soft-secondary">
            Unknown
          </span>
        )
    }
  }

  const openDetail = async (id: string) => {
    // Prevent opening details for reports being deleted or already deleted
    if (deletingReports.has(id) || deletedReports.has(id)) {
      showToastMessage('This report is not available. It may have been deleted.', 'info')
      return
    }
    
    // First, try to find the shift data from the current day view (which includes user details)
    if (selectedDayData?.shifts) {
      const shiftFromDayView = selectedDayData.shifts.find((shift: any) => shift._id === id);
      if (shiftFromDayView) {
        console.log('🔍 Using shift data from day view (includes user details):', shiftFromDayView);
        setDetail(shiftFromDayView);
        setIsOpen(true);
        return;
      }
    }
    
    // If not found in day view, try to find in all shifts
    const shiftFromAllShifts = allShifts.find((shift: any) => shift._id === id);
    if (shiftFromAllShifts) {
      console.log('🔍 Using shift data from all shifts:', shiftFromAllShifts);
      setDetail(shiftFromAllShifts);
      setIsOpen(true);
      return;
    }
    
    // Fallback to API call if not found in local data
    console.log('🔍 Shift not found in local data, making API call...');
    
    // Cancel any existing request for this ID
    const existingController = abortControllers.get(id)
    if (existingController) {
      existingController.abort()
    }
    
    // Create new abort controller for this request
    const abortController = new AbortController()
    setAbortControllers(prev => new Map(prev).set(id, abortController))
    
    try {
      const res = await fetchDetail(id).unwrap()
      console.log('🔍 Shift Detail API Response:', res?.data);
      setDetail(res?.data)
      setIsOpen(true)
    } catch (e: any) {
      // Don't show error if request was aborted
      if (e?.name === 'AbortError') {
        return
      }
      
      // Handle 404 errors specifically
      if (e?.status === 404 || e?.data?.statusCode === 404) {
        // Mark as deleted to prevent future attempts
        setDeletedReports(prev => new Set(prev).add(id))
        showToastMessage('Report not found. It may have been deleted.', 'error')
        // Refetch the list to update the UI
        refetch()
      } else {
        showToastMessage(e?.data?.message || 'Failed to load day close details', 'error')
      }
    } finally {
      // Clean up abort controller
      setAbortControllers(prev => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })
    }
  }

  const handleDateChange = (date: string) => {
    setCurrentDate(date)
    // If date is empty, show all days; otherwise filter by specific date
    setQueryParams(prev => ({ 
      ...prev, 
      date: date || undefined, 
      page: 1 
    }))
    // Reset view mode when date changes
    setViewMode('days')
    setShowDayWiseShiftWise(false)
    // Clear selected day when date input changes manually
    setSelectedDay(null)
  }

  const handleViewToggle = (view: 'dayWise' | 'shiftWise') => {
    // Prevent switching to shiftWise for no-shifts days
    if (view === 'shiftWise' && selectedDayData?.isNoShiftsDay) {
      return // Do nothing - button is disabled
    }
    setViewMode(view)
    setShowDayWiseShiftWise(true)
  }

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    setQueryParams(prev => ({ 
      ...prev, 
      startDate: start || '', 
      endDate: end || '', 
      date: undefined,
      page: 1 
    }))
    // Clear selected days when date range changes
    setSelectedDays([])
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setQueryParams(prev => ({ ...prev, sortBy: sortBy as any, sortOrder, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }))
  }

  const handleDayClick = (date: string) => {
    setSelectedDay(date)
    setCurrentDate(date) // Set the current date to the clicked day
    setViewMode('shifts') // Always show shift details view when clicking a day
    
    // Update query parameters to filter by the selected date
    setQueryParams(prev => ({ 
      ...prev, 
      date: date,
      page: 1 
    }))
  }

  const handleBackToDays = () => {
    setSelectedDay(null)
    setCurrentDate('') // Clear the current date selection
    setViewMode('days')
    // Reset query params to show all days
    setQueryParams(prev => ({ ...prev, date: undefined, startDate: '', endDate: '', page: 1 }))
    // Clear date range filters
    setStartDate('')
    setEndDate('')
    setSelectedDays([])
  }


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(allShifts.map((shift: any) => shift._id))
    } else {
      setSelectedReports([])
    }
  }

  const handleSelectReport = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReports(prev => [...prev, id])
    } else {
      setSelectedReports(prev => prev.filter(reportId => reportId !== id))
    }
  }

  const handleSelectDay = (date: string, checked: boolean) => {
    if (checked) {
      setSelectedDays(prev => [...prev, date])
    } else {
      setSelectedDays(prev => prev.filter(dayDate => dayDate !== date))
    }
  }

  const handleSelectAllDays = (checked: boolean) => {
    if (checked) {
      setSelectedDays(items.map((dayData: any) => dayData.date))
    } else {
      setSelectedDays([])
    }
  }

  const handleDownload = async () => {
    if (isDownloading) return
    
    setIsDownloading(true)
    try {
      // Validate download parameters
      if (selectedDays.length === 0 && !startDate && !endDate) {
        showToastMessage('Please select date range or specific days to download', 'error')
        return
      }
      
      // For now, use backend for all formats including PDF
      // TODO: Implement client-side PDF generation when modules are properly resolved
      await downloadFromBackend()
      
      // Clear selections after download
      setSelectedDays([])
      
      showToastMessage('Report downloaded successfully', 'success')
    } catch (error: any) {
      console.error('Download error:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to download reports'
      
      if (error?.message?.includes('Authentication token not found')) {
        errorMessage = 'Please log in again to download reports'
      } else if (error?.message?.includes('Invalid API URL')) {
        errorMessage = 'Server configuration error. Please contact support.'
      } else if (error?.message?.includes('Downloaded file is empty')) {
        errorMessage = 'No data available for the selected criteria'
      } else if (error?.message?.includes('Server returned HTML')) {
        errorMessage = 'Server error. Please try again later.'
      } else if (error?.message?.includes('Download failed:')) {
        errorMessage = `Download failed: ${error.message.split('Download failed: ')[1]}`
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      showToastMessage(errorMessage, 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadFromBackend = async () => {
    // Build query parameters
    const queryParams = new URLSearchParams()
    queryParams.append('format', downloadFormat)
    
    // Add date range parameters
    if (startDate) {
      queryParams.append('startDate', startDate)
    }
    
    if (endDate) {
      queryParams.append('endDate', endDate)
    }
    
    // Add selected days
    if (selectedDays.length > 0) {
      queryParams.append('dates', selectedDays.join(','))
    }

    // Get auth token
    const token = localStorage.getItem('backend_token')
    if (!token) {
      throw new Error('Authentication token not found')
    }

    // Make direct fetch request
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050/v1/api'
    const fullUrl = `${apiBaseUrl}/day-close-report/download?${queryParams.toString()}`
    
    // Ensure we're using the correct backend URL
    if (fullUrl.includes('localhost:3000') || fullUrl.includes('undefined')) {
      throw new Error(`Invalid API URL: ${fullUrl}. Please check NEXT_PUBLIC_API_BASE_URL environment variable.`)
    }
    
    // Set proper headers for file download
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Accept': downloadFormat === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : downloadFormat === 'pdf' 
        ? 'application/pdf'
        : 'text/csv',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      credentials: 'same-origin'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Download error response:', errorText)
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    // Check if response is actually a file
    const contentType = response.headers.get('content-type')
    const contentDisposition = response.headers.get('content-disposition')

    if (contentType && contentType.includes('text/html')) {
      const htmlContent = await response.text()
      console.error('Received HTML instead of file:', htmlContent.substring(0, 200))
      throw new Error('Server returned HTML instead of file. Check backend implementation.')
    }

    // Get the blob with proper type
    const blob = await response.blob()
    
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty')
    }

    // Create a properly typed blob
    const mimeType = downloadFormat === 'excel' 
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : downloadFormat === 'pdf' 
      ? 'application/pdf'
      : 'text/csv'
    
    const typedBlob = new Blob([blob], { type: mimeType })

    // Generate filename with timestamp to avoid conflicts
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    let filename = 'day-close-reports'
    if (selectedDays.length > 0) {
      filename = `day-close-reports-selected-days`
    } else if (startDate && endDate) {
      filename = `day-close-reports-${startDate}-to-${endDate}`
    } else if (startDate) {
      filename = `day-close-reports-from-${startDate}`
    } else if (endDate) {
      filename = `day-close-reports-until-${endDate}`
    }
    
    const fileExtension = downloadFormat === 'excel' ? 'xlsx' : downloadFormat
    const finalFilename = `${filename}-${timestamp}.${fileExtension}`
    
    // Create download link with proper attributes
    const url = window.URL.createObjectURL(typedBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = finalFilename
    link.style.display = 'none'
    link.setAttribute('download', finalFilename)
    
    // Add to DOM, click, and remove
    document.body.appendChild(link)
    link.click()
    
    // Clean up immediately
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }


  const handleDeleteByDate = (date: string) => {
    setDeleteDateTarget(date)
    setShowDeleteDateModal(true)
  }

  const confirmDeleteByDate = async () => {
    if (!deleteDateTarget) return
    
    try {
      await deleteReports(deleteDateTarget).unwrap()
      refetch()
      showToastMessage(`Reports deleted successfully for ${deleteDateTarget}`, 'success')
    } catch (error: any) {
      showToastMessage(error?.data?.message || 'Failed to delete reports', 'error')
    } finally {
      setShowDeleteDateModal(false)
      setDeleteDateTarget(null)
    }
  }

  const handleDeleteReport = (report: DayCloseReport) => {
    setDeleteTarget({ id: report._id, date: report.startDate })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    
    try {
      // Add to deleting set to prevent other operations
      setDeletingReports(prev => new Set(prev).add(deleteTarget.id))
      
      await deleteReportById(deleteTarget.id).unwrap()
      
      // Cancel any pending requests for this report
      const controller = abortControllers.get(deleteTarget.id)
      if (controller) {
        controller.abort()
        setAbortControllers(prev => {
          const newMap = new Map(prev)
          newMap.delete(deleteTarget.id)
          return newMap
        })
      }
      
      // Mark as deleted immediately to prevent any further API calls
      setDeletedReports(prev => new Set(prev).add(deleteTarget.id))
      
      // Remove the deleted report from selected reports if it was selected
      setSelectedReports(prev => prev.filter(id => id !== deleteTarget.id))
      
      // Close modal first
      setShowDeleteModal(false)
      setDeleteTarget(null)
      showToastMessage('Report deleted successfully', 'success')
      
      // Refetch after a short delay to ensure cache invalidation is complete
      setTimeout(() => {
        refetch()
        // Remove from deleting set after refetch
        setDeletingReports(prev => {
          const newSet = new Set(prev)
          newSet.delete(deleteTarget.id)
          return newSet
        })
      }, 100)
    } catch (error: any) {
      // Remove from deleting set on error
      setDeletingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(deleteTarget.id)
        return newSet
      })
      showToastMessage(error?.data?.message || 'Failed to delete report', 'error')
    }
  }

  // Show loading state while checking authentication
  if (status === 'loading' || isLoading || isLoadingDayWiseShiftWise) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <span className="ms-2">Loading day close reports...</span>
      </div>
    )
  }

  // Show authentication error if not authenticated
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="text-danger mb-3">
          <IconifyIcon icon="solar:shield-warning-bold-duotone" className="fs-1" />
        </div>
        <h5 className="text-danger mb-2">Authentication Required</h5>
        <p className="text-muted mb-3">
          Please log in to access day close reports.
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/auth/sign-in'}>
          <IconifyIcon icon="solar:login-3-bold-duotone" className="me-1" />
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle as="h4" className="mb-0">
                  Day Close Report
                </CardTitle>
              </div>

              {/* Only show date filters when not in individual day view */}
              {!selectedDay && (
                <div className="d-flex gap-2 align-items-end">
                  <div className="flex-grow-1">
                    <label className="form-label small mb-1">Start Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={startDate}
                      onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <label className="form-label small mb-1">End Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={endDate}
                      onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <label className="form-label small mb-1">Format</label>
                    <select 
                      className="form-select form-select-sm"
                      value={downloadFormat}
                      onChange={(e) => setDownloadFormat(e.target.value as 'csv' | 'excel' | 'pdf')}
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div className="flex-grow-1">
                    <label className="form-label small mb-1">Download</label>
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="w-100"
                      onClick={handleDownload}
                      disabled={isDownloading || (selectedDays.length === 0 && !startDate && !endDate)}
                      title={
                        selectedDays.length === 0 && !startDate && !endDate
                          ? "Please select date range or specific days to download"
                          : isDownloading 
                          ? "Downloading report..."
                          : "Download report"
                      }
                    >
                      {isDownloading ? (
                        <>
                          <Spinner size="sm" className="me-1" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <IconifyIcon icon="solar:download-bold-duotone" className="me-1" />
                          Download {selectedDays.length > 0 && `(${selectedDays.length} days)`}
                        </>
                      )}
                    </Button>
                  </div>
                  {(startDate || endDate) && (
                    <div className="ms-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleDateRangeChange('', '')}
                        title="Clear date filters"
                      >
                        <IconifyIcon icon="solar:close-circle-bold-duotone" className="me-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardHeader>

            <div>
              {error ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                  <div className="text-danger mb-3">
                    <IconifyIcon icon="solar:danger-circle-bold-duotone" className="fs-1" />
                  </div>
                  <h5 className="text-danger mb-2">Failed to load reports</h5>
                  <p className="text-muted mb-3">
                    {error && 'data' in error 
                      ? (error.data as any)?.message || 'An error occurred while loading the day close reports.'
                      : 'An error occurred while loading the day close reports.'
                    }
                  </p>
                  <Button variant="outline-primary" onClick={() => refetch()}>
                    <IconifyIcon icon="solar:refresh-bold-duotone" className="me-1" />
                    Try Again
                  </Button>
                </div>
              ) : items.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                  <div className="text-muted mb-3">
                    <IconifyIcon icon="solar:document-text-bold-duotone" className="fs-1" />
                  </div>
                  <h5 className="text-muted mb-2">No reports found</h5>
                  <p className="text-muted">
                    {queryParams.date 
                      ? `No day close reports found for ${queryParams.date}` 
                      : 'No day close reports found for the selected date range.'
                    }
                  </p>
                </div>
              ) : viewMode === 'days' ? (
                // Days List View - Table Structure
                <div className="table-responsive">
                  <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th style={{ textWrap: 'nowrap', width: '50px', minWidth: '50px' }}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedDays.length === items.length && items.length > 0}
                            onChange={(e) => handleSelectAllDays(e.target.checked)}
                          />
                        </th>
                        <th style={{ textWrap: 'nowrap', minWidth: '200px' }}>Date</th>
                        <th style={{ textWrap: 'nowrap', minWidth: '100px' }}>Shifts</th>
                        <th style={{ textWrap: 'nowrap', minWidth: '120px' }}>Total Cash</th>
                        <th style={{ textWrap: 'nowrap', minWidth: '150px' }}>Status Summary</th>
                        <th style={{ textWrap: 'nowrap', width: '120px', minWidth: '120px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((dayData: any) => {
                        // Separate actual shifts from whole-day records
                        const allShifts = dayData.shifts || []
                        const actualShifts = allShifts.filter((shift: any) => !isWholeDayRecord(shift))
                        const wholeDayRecords = allShifts.filter((shift: any) => isWholeDayRecord(shift))
                        
                        // Filter actual shifts for this day based on status filter
                        const filteredActualShifts = actualShifts.filter((shift: any) => 
                          statusFilter === 'all' || shift.status === statusFilter
                        )
                        
                        // Determine if this is a no-shifts day
                        const isNoShiftsDay = actualShifts.length === 0 && wholeDayRecords.length > 0
                        
                        // Calculate cash from actual shifts
                        const filteredCash = filteredActualShifts.reduce((sum: number, shift: any) => 
                          sum + (shift.denominations?.totalCash || 0), 0
                        )
                        
                        // Calculate cash from whole day records (for no-shifts days)
                        const wholeDayCash = wholeDayRecords.reduce((sum: number, record: any) => 
                          sum + (record.denominations?.totalCash || 0), 0
                        )
                        
                        // Use backend total cash if available, otherwise calculate from shifts/records
                        const totalCash = dayData.statistics?.totalCash || (filteredCash + wholeDayCash)
                        
                        // Determine display values
                        const displayShiftCount = isNoShiftsDay ? 0 : filteredActualShifts.length
                        const displayShiftText = isNoShiftsDay ? 'No shifts' : `${displayShiftCount} shift${displayShiftCount !== 1 ? 's' : ''}`
                        
                        return (
                          <tr 
                            key={dayData.date} 
                            className="table-row-hover"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                          >
                            <td style={{ textWrap: 'nowrap', width: '50px', minWidth: '50px' }}>
                              <div className="d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedDays.includes(dayData.date)}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    handleSelectDay(dayData.date, e.target.checked)
                                  }}
                                />
                              </div>
                            </td>
                            <td 
                              style={{ textWrap: 'nowrap', cursor: 'pointer', minWidth: '200px' }}
                              onClick={() => handleDayClick(dayData.date)}
                            >
                              <div className="d-flex align-items-center">
                                <IconifyIcon icon="solar:calendar-bold-duotone" className="text-primary me-2" />
                                <div>
                                  <div className="fw-medium">
                                    {new Date(dayData.date).toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <small className="text-muted">{dayData.date}</small>
                                </div>
                              </div>
                            </td>
                            <td style={{ textWrap: 'nowrap', minWidth: '100px' }}>
                              <div className="text-center">
                                <div className={`fw-bold fs-5 ${isNoShiftsDay ? 'text-muted' : 'text-primary'}`}>
                                  {displayShiftCount}
                                </div>
                                <small className="text-muted">{displayShiftText}</small>
                              </div>
                            </td>
                            <td style={{ textWrap: 'nowrap', minWidth: '120px' }}>
                              <div className="fw-medium text-success">
                                ₹{totalCash.toLocaleString()}
                              </div>
                            </td>
                            <td style={{ textWrap: 'nowrap', minWidth: '150px' }}>
                              <div className="d-flex gap-1 flex-wrap">
                                {isNoShiftsDay ? (
                                  <span className="badge badge-soft-info">Whole Day Close</span>
                                ) : statusFilter === 'all' ? (
                                  <>
                                    {dayData.statistics?.openShifts > 0 && (
                                      <span className="badge badge-soft-warning">Open: {dayData.statistics.openShifts}</span>
                                    )}
                                    {dayData.statistics?.closedShifts > 0 && (
                                      <span className="badge badge-soft-primary">Closed: {dayData.statistics.closedShifts}</span>
                                    )}
                                    {dayData.statistics?.dayCloseShifts > 0 && (
                                      <span className="badge badge-soft-success">Day Close: {dayData.statistics.dayCloseShifts}</span>
                                    )}
                                  </>
                                ) : (
                                  <span className={`badge badge-soft-${
                                    statusFilter === 'day-close' ? 'success' :
                                    statusFilter === 'closed' ? 'primary' : 'warning'
                                  }`}>
                                    {statusFilter === 'day-close' ? 'Day Close' :
                                     statusFilter === 'closed' ? 'Closed' : 'Open'}: {filteredActualShifts.length}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ textWrap: 'nowrap', width: '120px', minWidth: '120px' }}>
                              <div className="d-flex justify-content-center gap-1">
                                <button
                                  type="button"
                                  className="btn btn-soft-primary btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDayClick(dayData.date)
                                  }}
                                  title="View day details"
                                >
                                  <IconifyIcon icon="solar:arrow-right-bold-duotone" />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-danger btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteByDate(dayData.date)
                                  }}
                                  title="Delete day reports"
                                >
                                  <IconifyIcon icon="solar:trash-bin-trash-bold-duotone" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : selectedDay ? (
                // Day Details View
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-4 p-3 bg-light rounded">
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={handleBackToDays}
                        className="me-3"
                      >
                        <IconifyIcon icon="solar:arrow-left-bold-duotone" className="me-1" />
                        Back to Days
                      </Button>
                      <div>
                        <h5 className="mb-1">
                          <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2" />
                          Day Report - {new Date(selectedDay).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h5>
                        <div className="d-flex gap-3 text-muted">
                          <span><strong>{selectedDayData?.sales?.dayWise?.totalOrders || 0}</strong> total orders</span>
                          <span><strong>₹{(selectedDayData?.sales?.dayWise?.totalSales || 0).toLocaleString()}</strong> total sales</span>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Individual Shifts Table - Only show if there are actual shifts */}
                  {!selectedDayData?.isNoShiftsDay && selectedDayData?.shifts && selectedDayData.shifts.length > 0 && (
                    <div className="table-responsive">
                      <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                        <thead className="bg-light-subtle">
                          <tr>
                            <th style={{ textWrap: 'nowrap' }}>Shift Details</th>
                            <th style={{ textWrap: 'nowrap' }}>Status</th>
                            <th style={{ textWrap: 'nowrap' }}>Sales</th>
                            <th style={{ textWrap: 'nowrap' }}>Cash</th>
                            <th style={{ textWrap: 'nowrap' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDayData.shifts.map((shift: any) => (
                            <tr key={shift._id}>
                              <td style={{ textWrap: 'nowrap' }}>
                                <div className="d-flex flex-column">
                                  <div className="fw-medium">Shift #{shift.shiftNumber}</div>
                                  <div>
                                    <strong>Start:</strong> {fmt(shift.startTime)}
                                  </div>
                                  <div>
                                    <strong>End:</strong> {shift.endTime ? fmt(shift.endTime) : 'Still Open'}
                                  </div>
                                </div>
                              </td>
                              <td style={{ textWrap: 'nowrap' }}>
                                {getStatusBadge(shift.status)}
                              </td>
                              <td style={{ textWrap: 'nowrap' }}>
                                <div className="fw-medium">
                                  ₹{shift.sales?.totalSales?.toLocaleString() || 0}
                                </div>
                                <small className="text-muted">
                                  {shift.sales?.totalOrders || 0} orders
                                </small>
                              </td>
                              <td style={{ textWrap: 'nowrap' }}>
                                <div className="fw-medium">
                                  ₹{shift.denominations?.totalCash?.toLocaleString() || 0}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button 
                                    type="button" 
                                    className="btn btn-soft-primary btn-sm" 
                                    onClick={() => openDetail(shift._id)}
                                    disabled={deletingReports.has(shift._id) || deletedReports.has(shift._id)}
                                  >
                                    <IconifyIcon icon="solar:eye-bold-duotone" className="align-middle fs-18" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Day Details View - Show when a day is selected */}
              {selectedDay && selectedDayData && (
                <div className="mt-4">
                  {/* Day Summary Cards */}
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <Card className="h-100">
                        <CardHeader>
                          <CardTitle as="h6" className="mb-0">
                            <IconifyIcon icon="solar:chart-bold-duotone" className="me-2" />
                            Day Summary
                          </CardTitle>
                        </CardHeader>
                        <div className="p-3">
                          <div className="row text-center">
                            <div className="col-4">
                              <div className="fw-bold text-primary fs-4">{selectedDayData.sales?.dayWise?.totalOrders || 0}</div>
                              <small className="text-muted">Orders</small>
                            </div>
                            <div className="col-4">
                              <div className="fw-bold text-success fs-4">₹{(selectedDayData.sales?.dayWise?.totalSales || 0).toLocaleString()}</div>
                              <small className="text-muted">Total Sales</small>
                            </div>
                            <div className="col-4">
                              <div className="fw-bold text-info fs-4">{selectedDayData.shiftCount || 0}</div>
                              <small className="text-muted">Shifts</small>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                    <div className="col-md-4">
                      <Card className="h-100">
                        <CardHeader>
                          <CardTitle as="h6" className="mb-0">
                            <IconifyIcon icon="solar:wallet-money-bold-duotone" className="me-2" />
                            Payment Methods
                          </CardTitle>
                        </CardHeader>
                        <div className="p-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Cash:</span>
                            <strong className="text-success">₹{(selectedDayData.sales?.dayWise?.payments?.cash || 0).toLocaleString()}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Card:</span>
                            <strong className="text-primary">₹{(selectedDayData.sales?.dayWise?.payments?.card || 0).toLocaleString()}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Online:</span>
                            <strong className="text-info">₹{(selectedDayData.sales?.dayWise?.payments?.online || 0).toLocaleString()}</strong>
                          </div>
                          {/* Show total cash from denominations if available */}
                          {selectedDayData.statistics?.totalCash > 0 && (
                            <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                              <span><strong>Total Cash (Denominations):</strong></span>
                              <strong className="text-success">₹{selectedDayData.statistics.totalCash.toLocaleString()}</strong>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                    <div className="col-md-4">
                      <Card className="h-100">
                        <CardHeader>
                          <CardTitle as="h6" className="mb-0">
                            <IconifyIcon icon="solar:clock-circle-bold-duotone" className="me-2" />
                            Day Close Info
                          </CardTitle>
                        </CardHeader>
                        <div className="p-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Closed At:</span>
                            <strong>
                              {(() => {
                                // Try multiple possible paths for day close time
                                const dayCloseTime = selectedDayData.sales?.summary?.dayCloseTime || 
                                                   selectedDayData.sales?.dayCloseTime ||
                                                   selectedDayData.dayCloseTime ||
                                                   selectedDayData.wholeDayRecords?.[0]?.dayCloseTime ||
                                                   selectedDayData.shifts?.[0]?.dayCloseTime ||
                                                   selectedDayData.shifts?.find((shift: any) => shift.status === 'day-close')?.dayCloseTime ||
                                                   selectedDayData.shifts?.find((shift: any) => shift.status === 'day-close')?.endTime ||
                                                   selectedDayData.shifts?.find((shift: any) => shift.status === 'closed')?.endTime;
                                
                                console.log('🔍 Found dayCloseTime:', dayCloseTime);
                                
                                if (dayCloseTime) {
                                  try {
                                    return new Date(dayCloseTime).toLocaleString();
                                  } catch (error) {
                                    console.error('Error parsing dayCloseTime:', error);
                                    return dayCloseTime; // Return raw value if parsing fails
                                  }
                                }
                                
                                return 'N/A';
                              })()}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Closed By:</span>
                            <strong>
                              {(() => {
                                // Debug: Log the entire selectedDayData structure
                                console.log('🔍 Full selectedDayData structure:', selectedDayData);
                                console.log('🔍 Sales structure:', selectedDayData.sales);
                                console.log('🔍 Shifts structure:', selectedDayData.shifts);
                                console.log('🔍 Whole day records:', selectedDayData.wholeDayRecords);
                                
                                // Try multiple possible paths for user details
                                const closedByDetails = selectedDayData.sales?.summary?.closedByDetails || 
                                                      selectedDayData.sales?.closedByDetails ||
                                                      selectedDayData.closedByDetails ||
                                                      selectedDayData.wholeDayRecords?.[0]?.closedByDetails ||
                                                      selectedDayData.shifts?.[0]?.closedByDetails ||
                                                      selectedDayData.shifts?.find((shift: any) => shift.status === 'day-close')?.closedByDetails;
                                
                                console.log('🔍 Found closedByDetails:', closedByDetails);
                                
                                if (closedByDetails) {
                                  return (
                                    <div className="text-end">
                                      <div className="fw-medium">{closedByDetails.name || 'Unknown'}</div>
                                      <small className="text-muted">{closedByDetails.email || 'No email'}</small>
                                    </div>
                                  );
                                }
                                
                                // Fallback to raw ID or N/A
                                const closedBy = selectedDayData.sales?.summary?.closedBy || 
                                               selectedDayData.sales?.closedBy ||
                                               selectedDayData.closedBy ||
                                               selectedDayData.wholeDayRecords?.[0]?.closedBy ||
                                               selectedDayData.shifts?.[0]?.closedBy ||
                                               selectedDayData.shifts?.find((shift: any) => shift.status === 'day-close')?.closedBy;
                                
                                console.log('🔍 Found closedBy ID:', closedBy);
                                
                                return closedBy || 'N/A';
                              })()}
                            </strong>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>


                  {/* No Shifts Message */}
                  {selectedDayData.isNoShiftsDay && (
                    <div className="text-center py-5">
                      <IconifyIcon icon="solar:calendar-add-bold-duotone" className="fs-48 text-muted mb-3" />
                      <h5 className="text-muted mb-2">No Operational Shifts</h5>
                      <p className="text-muted mb-0">This day was closed without any operational shifts. Only day-wise sales data is available.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className="page-item">
                    <button className="page-link" onClick={() => handlePageChange((meta?.page || 1) - 1)} disabled={!meta || meta.page === 1}>
                      Previous
                    </button>
                  </li>
                  <li className="page-item active">
                    <button className="page-link">
                      {meta?.page || 1}
                    </button>
                  </li>
                  <li className="page-item">
                    <button className="page-link" onClick={() => handlePageChange((meta?.page || 1) + 1)} disabled={!meta || meta.page === meta.pages}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      <ReportModal show={isOpen} onClose={() => setIsOpen(false)} data={detail || undefined} />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this day close report?</p>
          <p className="text-muted">
            <strong>Report Date:</strong> {deleteTarget?.date}<br/>
            <strong>Report ID:</strong> {deleteTarget?.id}
          </p>
          <p className="text-muted">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <IconifyIcon icon="solar:trash-bin-trash-bold-duotone" className="me-1" />
            Delete Report
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Date Confirmation Modal */}
      <Modal show={showDeleteDateModal} onHide={() => setShowDeleteDateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <IconifyIcon icon="solar:danger-triangle-bold-duotone" className="me-2 text-danger" />
            Confirm Delete Day Reports
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning d-flex align-items-center mb-3">
            <IconifyIcon icon="solar:danger-triangle-bold-duotone" className="me-2 fs-5" />
            <div>
              <strong>Warning:</strong> This action will delete ALL day close reports for the selected date.
            </div>
          </div>
          <p>Are you sure you want to delete all day close reports for:</p>
          <div className="bg-light p-3 rounded mb-3">
            <div className="d-flex align-items-center">
              <IconifyIcon icon="solar:calendar-bold-duotone" className="me-2 text-primary" />
              <div>
                <strong>{deleteDateTarget && new Date(deleteDateTarget).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong>
                <br />
                <small className="text-muted">{deleteDateTarget}</small>
              </div>
            </div>
          </div>
          <div className="text-danger">
            <IconifyIcon icon="solar:info-circle-bold-duotone" className="me-1" />
            <strong>This action cannot be undone.</strong> All shifts, sales data, and day close records for this date will be permanently deleted.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteDateModal(false)}>
            <IconifyIcon icon="solar:close-circle-bold-duotone" className="me-1" />
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteByDate}>
            <IconifyIcon icon="solar:trash-bin-trash-bold-duotone" className="me-1" />
            Delete All Reports
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastType}
        >
          <Toast.Header closeButton={false}>
            <IconifyIcon 
              icon={
                toastType === 'success' ? 'solar:check-circle-bold-duotone' :
                toastType === 'error' ? 'solar:danger-circle-bold-duotone' :
                'solar:info-circle-bold-duotone'
              } 
              className={`me-2 fs-5 ${
                toastType === 'success' ? 'text-success' :
                toastType === 'error' ? 'text-danger' :
                'text-info'
              }`}
            />
            <strong className="me-auto">
              {toastType === 'success' ? 'Success' :
               toastType === 'error' ? 'Error' :
               'Information'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default DayCloseReport
